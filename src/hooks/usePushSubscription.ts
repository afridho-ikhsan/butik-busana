"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getOrCreateGuestPushKey } from "@/lib/guest-push-key";
import { vapidPublicKeyToApplicationServerKey } from "@/lib/vapid-public-key";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const SW_READY_MS = 10000;
const FETCH_MS = 15000;
const PUSH_SW_URL = "/sw-push.js";
const IS_DEV = process.env.NODE_ENV === "development";

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(msg)), ms)),
  ]);
}

function waitForServiceWorkerActive(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  if (registration.active) return Promise.resolve(registration);

  const worker = registration.installing ?? registration.waiting;
  if (!worker) return Promise.resolve(registration);

  return new Promise((resolve, reject) => {
    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") resolve(registration);
      if (worker.state === "redundant") reject(new Error("Service worker failed"));
    });
  });
}

async function getPushServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const registrations = await navigator.serviceWorker.getRegistrations();

  if (IS_DEV) {
    let pushRegistration = registrations.find((registration) =>
      (registration.active?.scriptURL ?? "").endsWith("/sw-push.js")
    );
    if (!pushRegistration) {
      pushRegistration = await navigator.serviceWorker.register(PUSH_SW_URL, {
        scope: "/",
        updateViaCache: "none",
      });
    }
    return waitForServiceWorkerActive(pushRegistration);
  }

  if (registrations.length === 0) {
    await navigator.serviceWorker.register(PUSH_SW_URL, { scope: "/" });
  }

  return waitForServiceWorkerActive(await navigator.serviceWorker.ready);
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: string };

function pushSubscribeErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "AbortError") {
      return "Push service menolak registrasi. Regenerate VAPID (node scripts/generate-vapid.js), pastikan public & private satu pasang, unregister semua service worker di DevTools, lalu refresh.";
    }
    return error.message || error.name;
  }
  if (error instanceof Error) return error.message;
  return "Gagal mendaftar push";
}

export function usePushSubscription() {
  const { data: session } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const applicationServerKey = vapidPublicKeyToApplicationServerKey(VAPID_PUBLIC);

  const syncPushSubscriptionState = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      setIsSubscribed(false);
      return;
    }
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await withTimeout(
        getPushServiceWorkerRegistration(),
        SW_READY_MS,
        "Service worker not ready"
      );
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    syncPushSubscriptionState();
  }, [permission, syncPushSubscriptionState]);

  useEffect(() => {
    if (!session?.user?.id) return;
    if (permission !== "granted") return;
    if (!isSubscribed) return;

    const linkGuestPushToAccount = async () => {
      try {
        const registration = await getPushServiceWorkerRegistration();
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;

        const guestKey = getOrCreateGuestPushKey();
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(
                String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
              ),
              auth: btoa(
                String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
              ),
            },
            guestKey,
          }),
        });
      } catch { }
    };

    linkGuestPushToAccount();
  }, [session?.user?.id, permission, isSubscribed]);

  const subscribe = useCallback(async (): Promise<SubscribeResult> => {
    try {
      if (!applicationServerKey) {
        return {
          ok: false,
          error:
            "NEXT_PUBLIC_VAPID_PUBLIC_KEY tidak valid. Jalankan: node scripts/generate-vapid.js lalu salin ulang ke .env",
        };
      }
      if (typeof window === "undefined" || !("Notification" in window)) {
        return { ok: false, error: "Browser tidak mendukung notifikasi" };
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return { ok: false, error: "Browser tidak mendukung Web Push" };
      }

      if (Notification.permission === "denied") {
        return { ok: false, error: "Izin notifikasi diblokir di pengaturan browser" };
      }
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== "granted") {
          return { ok: false, error: "Izin notifikasi ditolak" };
        }
      }

      const registration = await withTimeout(
        getPushServiceWorkerRegistration(),
        SW_READY_MS,
        "Service worker not ready"
      );

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });
      }

      const guestKey = getOrCreateGuestPushKey();

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
            ),
            auth: btoa(
              String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
            ),
          },
          guestKey,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          detail?: string;
        };
        const serverMessage = data.detail || data.error;
        return {
          ok: false,
          error: serverMessage || "Gagal menyimpan subscription ke server",
        };
      }

      setIsSubscribed(true);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: pushSubscribeErrorMessage(error) };
    }
  }, [applicationServerKey, session?.user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

      const registration = await withTimeout(
        getPushServiceWorkerRegistration(),
        SW_READY_MS,
        "Service worker not ready"
      );
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        setIsSubscribed(false);
        return true;
      }

      const guestKey = getOrCreateGuestPushKey();

      const res = await withTimeout(
        fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint, guestKey }),
        }),
        FETCH_MS,
        "Unsubscribe request timeout"
      );

      if (res.ok) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
      }
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    permission,
    subscribe,
    unsubscribe,
    isSubscribed,
    isLoggedIn: !!session?.user,
    syncPushSubscriptionState,
    hasValidVapidPublicKey: !!applicationServerKey,
  };
}
