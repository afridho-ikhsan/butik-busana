import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  PAYMENT_DEADLINE_MS,
  paymentDeadlineReminderMinutesList,
} from "@/lib/payment-deadline";
import { sendPushToUser } from "@/lib/push";

const CRON_SECRET = process.env.CRON_SECRET;
const CRON_WINDOW_MS = 60 * 1000;

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

    for (let index = 0; index < reminderMinutes.length; index++) {
      const minutes = reminderMinutes[index];
      const sentField = paymentDeadlineReminderSentFields[index];
      if (!sentField || minutes > PAYMENT_DEADLINE_MS / (60 * 1000)) continue;

      sentCounts[String(minutes)] = 0;
      const remainingMaxMs = minutes * 60 * 1000;
      const remainingMinMs = remainingMaxMs - CRON_WINDOW_MS;
      const createdAtMax = new Date(now - PAYMENT_DEADLINE_MS + remainingMaxMs);
      const createdAtMin = new Date(now - PAYMENT_DEADLINE_MS + remainingMinMs);

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

      for (const order of orders) {
        const userSlug = order.user?.slug;
        const orderUrl = userSlug
          ? `/user/${userSlug}/transactions/${order.id}`
          : "/";

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
        } catch (_e) {}
      }
    }

    const total = Object.values(sentCounts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({
      sent: sentCounts,
      total,
      paymentDeadlineMinutes: PAYMENT_DEADLINE_MS / (60 * 1000),
      reminderMinutes,
    });
  } catch (error) {
    console.error("Payment deadline reminder cron error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
