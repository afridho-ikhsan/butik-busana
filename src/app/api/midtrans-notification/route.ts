import {
  CheckoutLineItemType,
  MidtransNotificationMetadata,
} from "@/types/checkout-types";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    if (!req.body) {
      throw new Error("Request body is empty");
    }
    const body = await req.json();
    const { transaction_status } = body;

    if (
      ["deny", "cancel", "expire", "failure"].includes(transaction_status)
    ) {
      const { buyerInfo: { memberId } = {}, orderId } = body.metadata || {};
      if (memberId) {
        try {
          const u = await prisma.user.findUnique({ where: { id: memberId }, select: { slug: true } });
          const baseUrl = u?.slug ? `/user/${u.slug}/transactions` : "/";
          const url = orderId ? `${baseUrl}/${orderId}` : baseUrl;
          await sendPushToUser(memberId, {
            title: "Pembayaran Gagal",
            body: "Pembayaran tidak berhasil. Silakan coba lagi atau gunakan metode pembayaran lain.",
            url,
            tag: "payment-failed",
          });
        } catch (_e) {}
      }
      return NextResponse.json({ message: "Pembayaran Gagal" });
    }

    if (["settlement", "capture"].includes(transaction_status)) {
      const {
        buyerInfo: { memberId },
        orderId,
      } = body.metadata as MidtransNotificationMetadata & { orderId?: string };

      const user = await prisma.user.findFirst({
        where: { id: memberId },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
      }

      if (!orderId) {
        return NextResponse.json({ error: "Order ID tidak ditemukan" }, { status: 400 });
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "APPROVED",
          paymentStatus: "PAID",
          metodePembayaran:
            body.payment_type === "bank_transfer"
              ? body.va_numbers?.[0]?.bank || body.payment_type
              : body.payment_type,
        },
      });

      const invoiceUrl = `/api/admin/orders/${orderId}/invoice`;
      const existing = await prisma.paymentEvidence.findFirst({
        where: { orderId },
      });
      if (existing) {
        await prisma.paymentEvidence.update({
          where: { id: existing.id },
          data: { linkBuktiPembayaran: invoiceUrl, namaFoto: "Invoice" },
        });
      } else {
        await prisma.paymentEvidence.create({
          data: {
            orderId,
            orderNumber: order.orderNumber,
            linkBuktiPembayaran: invoiceUrl,
            namaFoto: "Invoice",
          },
        });
      }

      try {
        const txUrl = user.slug ? `/user/${user.slug}/transactions` : "/";
        await sendPushToUser(memberId, {
          title: "Pembayaran Berhasil",
          body: `Pesanan #${order.orderNumber} telah dibayar.`,
          url: txUrl,
          tag: "payment-success",
        });
      } catch (_e) {}

      return NextResponse.json({ message: "Pembayaran Berhasil" });
    }

    return NextResponse.json({ message: "Pembayaran Berhasil" });
  } catch (error) {
    console.log("error midtrans", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
