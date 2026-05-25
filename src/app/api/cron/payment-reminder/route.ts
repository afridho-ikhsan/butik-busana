import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "NOT_PAID",
        createdAt: { lt: hoursAgo },
      },
      select: { id: true, orderNumber: true, userId: true, user: { select: { slug: true } } },
    });

    const sent = new Set<string>();
    for (const order of orders) {
      if (sent.has(order.userId)) continue;
      sent.add(order.userId);
      try {
        const userSlug = order.user?.slug;
        await sendPushToUser(order.userId, {
          title: "Reminder: Belum Bayar",
          body: `Pesanan #${order.orderNumber} menunggu pembayaran. Segera selesaikan sebelum pesanan dibatalkan.`,
          url: userSlug ? `/user/${userSlug}/transactions` : "/",
          tag: "payment-reminder",
          requireInteraction: true,
        });
      } catch (_e) {}
    }

    return NextResponse.json({ sent: sent.size, orders: orders.length });
  } catch (error) {
    console.error("Payment reminder cron error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
