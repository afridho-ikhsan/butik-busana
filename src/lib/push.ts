import webPush from "web-push";
import { prisma } from "@/lib/prisma";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

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

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!vapidPrivateKey || !vapidPublicKey) return;

  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const sendPayload = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
    data: { url: payload.url ?? "/" },
    tag: payload.tag ?? "default",
    requireInteraction: payload.requireInteraction ?? false,
  });

  const results = await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          sendPayload,
          { TTL: 60 * 60 * 24 }
        );
      } catch (e) {
        if ((e as { statusCode?: number }).statusCode === 410 || (e as { statusCode?: number }).statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        throw e;
      }
    })
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0 && failed.length === results.length) {
    console.error("Push send failed for user", userId, failed);
  }
}
