import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const phoneSuffix = searchParams.get("phoneSuffix")?.trim();

    if (!orderNumber && !phoneSuffix) {
      return NextResponse.json(
        { error: "Masukkan nomor pesanan atau ujung nomor telepon" },
        { status: 400 }
      );
    }

    const phoneDigits = phoneSuffix?.replace(/\D/g, "") || "";
    const conditions: object[] = [];
    if (orderNumber) {
      conditions.push({ orderNumber: { contains: orderNumber, mode: "insensitive" as const } });
    }
    if (phoneDigits.length >= 4) {
      conditions.push({ recipientPhone: { endsWith: phoneDigits } });
    }
    if (conditions.length === 0) {
      return NextResponse.json(
        { error: "Masukkan minimal 4 digit nomor telepon" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { OR: conditions },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { nickname: true, email: true } } },
    });

    return NextResponse.json(
      orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
        total: o.total,
        recipientName: o.recipientName,
        recipientPhone: o.recipientPhone,
      }))
    );
  } catch (error) {
    console.error("Order lookup error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
