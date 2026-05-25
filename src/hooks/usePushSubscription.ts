"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const SW_READY_MS = 10000;
const FETCH_MS = 15000;

function withTimeout<T>(p: Promise<T>, ms: number, msg: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(msg)), ms)),
  ]);
}

export function usePushSubscription() {
  const { data: session, status } = useSession();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (!cancelled && sub) setIsSubscribed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [permission]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (!VAPID_PUBLIC || !session?.user) return false;
      if (typeof window === "undefined" || !("Notification" in window)) return false;
      if (!("serviceWorker" in navigator)) return false;

      if (Notification.permission === "denied") return false;
      if (Notification.permission === "default") {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== "granted") return false;
      }

      if (!navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register("/sw-push.js").catch(() => { });
      }
      const reg = await withTimeout(
        navigator.serviceWorker.ready,
        SW_READY_MS,
        "Service worker not ready"
      );
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: new Uint8Array(urlBase64ToUint8Array(VAPID_PUBLIC)),
        });
      }

      const payload = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("p256dh")!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey("auth")!))),
        },
      };

      const res = await
        fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      if (res.ok) setIsSubscribed(true);
      return res.ok;
    } catch {
      return false;
    }
  }, [session?.user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
      const reg = await withTimeout(
        navigator.serviceWorker.ready,
        SW_READY_MS,
        "Service worker not ready"
      );
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        setIsSubscribed(false);
        return true;
      }
      const res = await withTimeout(
        fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }),
        FETCH_MS,
        "Unsubscribe request timeout"
      );
      if (res.ok) {
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return { permission, subscribe, unsubscribe, isSubscribed, isLoggedIn: !!session?.user };
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);

  return out;
}
