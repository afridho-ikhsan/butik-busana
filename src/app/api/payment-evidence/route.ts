import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (orderId) {
      const evidence = await prisma.paymentEvidence.findFirst({
        where: { orderId },
      });
      return NextResponse.json(evidence);
    }

    const all = await prisma.paymentEvidence.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(all);
  } catch (error) {
    console.error("Payment evidence API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, linkBuktiPembayaran, namaFoto, orderNumber } = body;

    const evidence = await prisma.paymentEvidence.create({
      data: {
        orderId,
        orderNumber,
        linkBuktiPembayaran,
        namaFoto,
      },
    });
    return NextResponse.json(evidence);
  } catch (error) {
    console.error("Payment evidence create error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
