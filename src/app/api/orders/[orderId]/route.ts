import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { getOrCreateGuestUser } from "@/lib/guest-user";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { orderId } = await params;
    const order = await prisma.order.findFirst({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }
    const guestUser = await getOrCreateGuestUser();
    const isGuestOrder = order.userId === guestUser.id;
    if (!isGuestOrder && order.userId !== session?.user?.id) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }
    const lineItems = (order.lineItems as { productName?: string; image?: string }[]) || [];
    const formattedOrder = {
      ...order,
      _id: order.id,
      _createdDate: order.createdAt,
      number: order.orderNumber,
      lineItems: lineItems.map((item) => ({
        ...item,
        productName: { original: item.productName || "" },
        image: item.image || "",
      })),
      priceSummary: {
        total: {
          formattedAmount: `Rp ${order.total.toLocaleString("id-ID")}`,
          amount: order.total.toString(),
        },
      },
    };
    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("Order API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
