import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { user: { select: { nickname: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const lineItems = (order.lineItems as { productName?: string; price?: number; quantity?: number; image?: string }[]) || [];
    return NextResponse.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      recipientName: order.recipientName,
      recipientPhone: order.recipientPhone,
      address: order.address,
      layananKurir: order.layananKurir,
      metodePembayaran: order.metodePembayaran,
      lineItems,
      user: order.user,
    });
  } catch (error) {
    console.error("Public order API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
