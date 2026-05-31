import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PAYMENT_DEADLINE_MS } from "@/lib/payment-deadline";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  if (CRON_SECRET && req.headers.get("authorization") !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deadline = new Date(Date.now() - PAYMENT_DEADLINE_MS);

    const result = await prisma.order.updateMany({
      where: {
        paymentStatus: "NOT_PAID",
        status: { not: "CANCELED" },
        createdAt: { lt: deadline },
      },
      data: { status: "CANCELED" },
    });

    return NextResponse.json({ canceled: result.count });
  } catch (error) {
    console.error("Cancel expired orders cron error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
