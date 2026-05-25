import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (role !== "admin" && role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus: "PAID" },
      include: { user: { select: { slug: true } } },
    });

    const userSlug = order.user?.slug;
    try {
      await sendPushToUser(order.userId, {
        title: "Pembayaran Disetujui",
        body: `Pesanan #${order.orderNumber} telah disetujui oleh admin.`,
        url: userSlug ? `/user/${userSlug}/transactions` : "/",
        tag: "payment-approved",
      });
    } catch (_e) {}

    return NextResponse.json(order);
  } catch (error) {
    console.error("Admin approve payment:", error);
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

