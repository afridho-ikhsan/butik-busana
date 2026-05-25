import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Harap login terlebih dahulu" },
        { status: 401 }
      );
    }
    const body = await req.json();
    const {
      alamat,
      lineItems,
      catatan,
      ongkir,
      informasiPembeli: { email, nama, nomorHp },
      layananKurir,
    } = body;

    const subtotal = lineItems.reduce(
      (acc: number, item: { price: number; quantity: number }) =>
        acc + item.price * item.quantity,
      0
    );
    const total = subtotal + ongkir;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: "APPROVED",
        paymentStatus: "NOT_PAID",
        lineItems: lineItems as object[],
        subtotal,
        shippingCost: ongkir,
        total,
        recipientName: nama || undefined,
        recipientPhone: nomorHp || undefined,
        address: alamat,
        layananKurir,
        catatan: catatan || "",
        metodePembayaran: "Transfer Bank (Manual)",
      },
    });

    return NextResponse.json({
      _id: order.id,
      number: order.orderNumber,
    });
  } catch (error) {
    console.error("Order create error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
