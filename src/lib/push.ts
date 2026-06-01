import webPush from "web-push";
import { prisma } from "@/lib/prisma";
import { normalizeVapidPublicKey } from "@/lib/vapid-public-key";

const vapidPublicKey = normalizeVapidPublicKey(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
);
const vapidPrivateKey = normalizeVapidPublicKey(process.env.VAPID_PRIVATE_KEY);

if (vapidPrivateKey && vapidPublicKey) {
  webPush.setVapidDetails(
    "mailto:support@butik-busana.com",
    vapidPublicKey,
    vapidPrivateKey
  );
}

export type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
};

async function sendPushToSubscription(
  subscription: {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushPayload
): Promise<void> {
  const sendPayload = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
    data: { url: payload.url ?? "/" },
    tag: payload.tag ?? "default",
    requireInteraction: payload.requireInteraction ?? false,
  });

  try {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      sendPayload,
      { TTL: 60 * 60 * 24 }
    );
  } catch (e) {
    if (
      (e as { statusCode?: number }).statusCode === 410 ||
      (e as { statusCode?: number }).statusCode === 404
    ) {
      await prisma.pushSubscription.delete({ where: { id: subscription.id } });
    }
    throw e;
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<void> {
  if (!vapidPrivateKey || !vapidPublicKey) return;

  const subscription = await prisma.pushSubscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) return;

  try {
    await sendPushToSubscription(subscription, payload);
  } catch (e) {
    console.error("Push send failed for user", userId, e);
  }
}

export async function sendPushToGuestKey(
  guestKey: string,
  payload: PushPayload
): Promise<void> {
  if (!vapidPrivateKey || !vapidPublicKey) return;

  const subscription = await prisma.pushSubscription.findFirst({
    where: { guestKey },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) return;

  try {
    await sendPushToSubscription(subscription, payload);
  } catch (e) {
    console.error("Push send failed for guest", guestKey, e);
  }
}
