import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push";

async function resolveOrderFromNotification(body: {
  order_id?: string;
  custom_field1?: string;
  custom_field2?: string;
  metadata?: { orderId?: string; buyerInfo?: { memberId?: string } };
}) {
  const orderIdFromFields =
    body.custom_field1 || body.metadata?.orderId || "";

  if (orderIdFromFields) {
    const byId = await prisma.order.findFirst({ where: { id: orderIdFromFields } });
    if (byId) return byId;
  }

  const orderNumberFromFields = body.custom_field2 || "";
  if (orderNumberFromFields) {
    const byNumber = await prisma.order.findFirst({
      where: { orderNumber: orderNumberFromFields },
    });
    if (byNumber) return byNumber;
  }

  // order_id Midtrans = `${orderNumber}-${timestamp}`
  const midtransOrderId = String(body.order_id || "");
  if (midtransOrderId) {
    const maybeOrderNumber = midtransOrderId.replace(/-\d+$/, "");
    if (maybeOrderNumber) {
      const byParsed = await prisma.order.findFirst({
        where: { orderNumber: maybeOrderNumber },
      });
      if (byParsed) return byParsed;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!req.body) {
      throw new Error("Request body is empty");
    }
    const body = await req.json();
    console.log("[midtrans-notification]", {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      custom_field1: body.custom_field1,
      custom_field2: body.custom_field2,
    });

    const { transaction_status } = body;
    const order = await resolveOrderFromNotification(body);

    if (
      ["deny", "cancel", "expire", "failure"].includes(transaction_status)
    ) {
      if (order?.userId) {
        try {
          const u = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { slug: true },
          });
          const baseUrl = u?.slug ? `/user/${u.slug}/transactions` : `/order/${order.id}`;
          await sendPushToUser(order.userId, {
            title: "Pembayaran Gagal",
            body: "Pembayaran tidak berhasil. Silakan coba lagi atau gunakan metode pembayaran lain.",
            url: baseUrl,
            tag: "payment-failed",
          });
        } catch (_e) {}
      }
      return NextResponse.json({ message: "Pembayaran Gagal" });
    }

    if (["settlement", "capture"].includes(transaction_status)) {
      if (!order) {
        console.error("[midtrans-notification] Order tidak ditemukan", body.order_id);
        return NextResponse.json(
          { error: "Order tidak ditemukan" },
          { status: 404 }
        );
      }

      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ message: "Pembayaran sudah diproses" });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "APPROVED",
          paymentStatus: "PAID",
          metodePembayaran:
            body.payment_type === "bank_transfer"
              ? body.va_numbers?.[0]?.bank || body.payment_type
              : body.payment_type,
        },
      });

      const invoiceUrl = `/api/admin/orders/${order.id}/invoice`;
      const existing = await prisma.paymentEvidence.findFirst({
        where: { orderId: order.id },
      });
      if (existing) {
        await prisma.paymentEvidence.update({
          where: { id: existing.id },
          data: { linkBuktiPembayaran: invoiceUrl, namaFoto: "Invoice" },
        });
      } else {
        await prisma.paymentEvidence.create({
          data: {
            orderId: order.id,
            orderNumber: updatedOrder.orderNumber,
            linkBuktiPembayaran: invoiceUrl,
            namaFoto: "Invoice",
          },
        });
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
          select: { slug: true, email: true },
        });
        // Jangan push ke akun guest sistem
        if (user && user.email !== "guest@butik-busana.system") {
          const txUrl = user.slug
            ? `/user/${user.slug}/transactions`
            : `/order/${order.id}`;
          await sendPushToUser(order.userId, {
            title: "Pembayaran Berhasil",
            body: `Pesanan #${updatedOrder.orderNumber} telah dibayar.`,
            url: txUrl,
            tag: "payment-success",
          });
        }
      } catch (_e) {}

      return NextResponse.json({ message: "Pembayaran Berhasil" });
    }

    return NextResponse.json({ message: "Status diterima" });
  } catch (error) {
    console.log("error midtrans", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
