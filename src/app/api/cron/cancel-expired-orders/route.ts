import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAYMENT_DEADLINE_MS } from "@/lib/payment-deadline";
import { sendPushToUser } from "@/lib/push";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deadline = new Date(Date.now() - PAYMENT_DEADLINE_MS);

    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "NOT_PAID",
        status: { not: "CANCELED" },
        createdAt: { lt: deadline },
      },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        user: { select: { slug: true } },
      },
    });

    let pushSent = 0;

    for (const order of orders) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELED" },
      });

      const userSlug = order.user?.slug;
      const orderUrl = userSlug
        ? `/user/${userSlug}/transactions/${order.id}`
        : "/";

      const subscriptionCount = await prisma.pushSubscription.count({
        where: { userId: order.userId },
      });

      if (subscriptionCount === 0) continue;

      try {
        await sendPushToUser(order.userId, {
          title: "Pesanan Dibatalkan",
          body: `Pesanan #${order.orderNumber} dibatalkan karena batas waktu pembayaran habis.`,
          url: orderUrl,
          tag: `order-expired-${order.id}`,
          requireInteraction: true,
        });
        pushSent += 1;
      } catch (_e) {}
    }

    return NextResponse.json({
      canceled: orders.length,
      pushSent,
    });
  } catch (error) {
    console.error("Cancel expired orders cron error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
