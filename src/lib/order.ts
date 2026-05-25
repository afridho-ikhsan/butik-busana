"use server";

import { CheckoutDataType } from "@/types/checkout-types";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function createOrder({
  alamat,
  lineItems,
  catatan,
  ongkir,
  informasiPembeli: { email, nama, nomorHp, memberId },
  layananKurir,
}: CheckoutDataType) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Harap login terlebih dahulu");
    }

    const subtotal = lineItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const total = subtotal + ongkir;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const orderLineItems = lineItems.map((item) => ({
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      weight: item.weight,
      catalogReference: item.catalogReference,
    }));

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        status: "APPROVED",
        paymentStatus: "NOT_PAID",
        lineItems: orderLineItems as object[],
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

    return {
      _id: order.id,
      number: order.orderNumber,
    };
  } catch (error) {
    console.error("Order Error: ", error);
    throw new Error("Order Error: " + error);
  }
}

export async function getOrderByIdPublic(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { user: { select: { nickname: true, email: true } } },
    });
    return order;
  } catch (error) {
    console.error("getOrderByIdPublic error:", error);
    return null;
  }
}

export async function getBuktiPembayaran() {
  try {
    const evidences = await prisma.paymentEvidence.findMany({
      orderBy: { createdAt: "desc" },
    });
    return evidences;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getBuktiPembayaranById(orderId: string) {
  try {
    const evidence = await prisma.paymentEvidence.findFirst({
      where: { orderId },
    });
    return evidence;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function addBuktiPembayaran(
  orderId: string,
  linkBuktiPembayaran: string,
  namaFoto: string,
  orderNumber: string
) {
  try {
    const evidence = await prisma.paymentEvidence.create({
      data: {
        orderId,
        orderNumber,
        linkBuktiPembayaran,
        namaFoto,
      },
    });
    return evidence;
  } catch (err) {
    console.log(err);
    return null;
  }
}
