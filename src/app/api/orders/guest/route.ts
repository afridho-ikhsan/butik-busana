import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateGuestUser } from "@/lib/guest-user";

export async function POST(req: NextRequest) {
  try {
    const guestUser = await getOrCreateGuestUser();
    const body = await req.json();
    const {
      alamat,
      lineItems,
      catatan,
      ongkir,
      layananKurir,
      nama,
      nomorHp,
      email = "",
    } = body;

    if (!nama || !nomorHp || !alamat || !lineItems?.length || ongkir == null) {
      return NextResponse.json(
        { error: "Data pemesanan tidak lengkap" },
        { status: 400 }
      );
    }

    const subtotal = Math.max(
      0,
      lineItems.reduce(
        (acc: number, item: { price?: number; quantity?: number }) =>
          acc + (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      )
    );
    const ongkirNum = Number(ongkir);
    const total = subtotal + (isNaN(ongkirNum) ? 0 : ongkirNum);
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const orderLineItems = lineItems.map(
      (item: {
        productName?: string;
        price?: number;
        quantity?: number;
        image?: string;
        weight?: number;
      }) => ({
        productName: item.productName || "",
        price: item.price || 0,
        quantity: item.quantity || 0,
        image: item.image || "",
        weight: item.weight || 0,
      })
    );

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: guestUser.id,
        status: "APPROVED",
        paymentStatus: "NOT_PAID",
        lineItems: orderLineItems as object[],
        subtotal,
        shippingCost: Number(ongkir),
        total,
        recipientName: String(nama),
        recipientPhone: String(nomorHp),
        address: String(alamat),
        layananKurir: layananKurir || null,
        catatan: catatan || "",
        metodePembayaran: "Transfer Bank (Manual)",
      },
    });

    return NextResponse.json({
      _id: order.id,
      number: order.orderNumber,
    });
  } catch (error) {
    console.error("Guest order error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat membuat pesanan",
        details: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
