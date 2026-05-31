import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PAYMENT_DEADLINE_MS,
  paymentDeadlineReminderMinutesList,
} from "@/lib/payment-deadline";
import { sendPushToUser } from "@/lib/push";

const CRON_SECRET = process.env.CRON_SECRET;

const paymentDeadlineReminderSentFields = [
  "paymentDeadlineReminder30SentAt",
  "paymentDeadlineReminder15SentAt",
  "paymentDeadlineReminder5SentAt",
] as const;

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = Date.now();
    const reminderMinutes = paymentDeadlineReminderMinutesList();
    const sentCounts: Record<string, number> = {};
    const matchedCounts: Record<string, number> = {};
    const pushFailedCounts: Record<string, number> = {};

    for (let index = 0; index < reminderMinutes.length; index++) {
      const minutes = reminderMinutes[index];
      const sentField = paymentDeadlineReminderSentFields[index];

      if (!sentField || minutes > PAYMENT_DEADLINE_MS / (60 * 1000)) continue;

      sentCounts[String(minutes)] = 0;
      matchedCounts[String(minutes)] = 0;
      pushFailedCounts[String(minutes)] = 0;

      const minOrderAgeMs = PAYMENT_DEADLINE_MS - minutes * 60 * 1000;
      const createdAtMax = new Date(now - minOrderAgeMs);
      const createdAtMin = new Date(now - PAYMENT_DEADLINE_MS);

      const orders = await prisma.order.findMany({
        where: {
          paymentStatus: "NOT_PAID",
          status: { not: "CANCELED" },
          [sentField]: null,
          createdAt: { gt: createdAtMin, lte: createdAtMax },
        },
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          user: { select: { slug: true } },
        },
      });

      matchedCounts[String(minutes)] = orders.length;

      for (const order of orders) {
        const userSlug = order.user?.slug;
        const orderUrl = userSlug
          ? `/user/${userSlug}/transactions/${order.id}`
          : "/";

        const subscriptionCount = await prisma.pushSubscription.count({
          where: { userId: order.userId },
        });

        if (subscriptionCount === 0) {
          pushFailedCounts[String(minutes)] += 1;
          continue;
        }

        try {
          await sendPushToUser(order.userId, {
            title: `Pembayaran ${minutes} menit lagi habis`,
            body: `Pesanan #${order.orderNumber} akan dibatalkan jika belum dibayar.`,
            url: orderUrl,
            tag: `payment-deadline-${minutes}-${order.id}`,
            requireInteraction: true,
          });
          await prisma.order.update({
            where: { id: order.id },
            data: { [sentField]: new Date() },
          });
          sentCounts[String(minutes)] += 1;
        } catch {
          pushFailedCounts[String(minutes)] += 1;
        }
      }
    }

    const total = Object.values(sentCounts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      sent: sentCounts,
      matched: matchedCounts,
      pushFailedNoSubscription: pushFailedCounts,
      total,
      paymentDeadlineMinutes: PAYMENT_DEADLINE_MS / (60 * 1000),
      reminderMinutes,
      serverTime: new Date(now).toISOString(),
    });
  } catch (error) {
    console.error("Payment deadline reminder cron error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
