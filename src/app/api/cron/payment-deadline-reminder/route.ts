import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAYMENT_DEADLINE_MS } from "@/lib/payment-deadline";
import { sendPushToUser } from "@/lib/push";

const CRON_SECRET = process.env.CRON_SECRET;
const CRON_WINDOW_MS = 60 * 1000;

const paymentDeadlineReminders = [
  { minutes: 30, sentField: "paymentDeadlineReminder30SentAt" as const },
  { minutes: 15, sentField: "paymentDeadlineReminder15SentAt" as const },
  { minutes: 5, sentField: "paymentDeadlineReminder5SentAt" as const },
];

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = Date.now();
    const sentCounts = { 30: 0, 15: 0, 5: 0 };

    for (const { minutes, sentField } of paymentDeadlineReminders) {
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
          sentCounts[minutes as 30 | 15 | 5] += 1;
        } catch (_e) {}
      }
    }

    return NextResponse.json({
      sent: sentCounts,
      total: sentCounts[30] + sentCounts[15] + sentCounts[5],
    });
  } catch (error) {
    console.error("Payment deadline reminder cron error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
