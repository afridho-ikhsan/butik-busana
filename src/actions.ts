"use server";

import axios from "axios";
import { randomUUID } from "crypto";
import { MidtransClient } from "midtrans-node-client";
import {
  CheckoutDataType,
  MidtransNotificationMetadata,
} from "./types/checkout-types";
import { RekeningBankQueryType } from "./types/rekening-bank";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";

interface RajaOngkirDomesticLocationType {
  meta: { message: string; code: number; status: string };
  data: {
    id: number;
    label: string;
    subdistrict_name: string;
    district_name: string;
    city_name: string;
    province_name: string;
    zip_code: string;
  }[];
}

interface RajaOngkirCostType {
  meta: { message: string; code: number; status: string };
  data: {
    name: string;
    code: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
  }[];
}

type GetOngkirReturnType = {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}[];

export async function getOngkir({
  destination,
  weight,
  courier,
  price = "lowest",
}: {
  destination: string;
  weight: number;
  courier: string;
  price: "lowest" | "highest";
}): Promise<GetOngkirReturnType | { error: string }> {
  const formData = new URLSearchParams();
  formData.append("origin", "6542");
  formData.append("destination", destination);
  formData.append("weight", String(weight < 1 ? 1 : weight));
  formData.append("courier", courier);
  formData.append("price", price);

  try {
    const response = await axios.post<RajaOngkirCostType>(
      `https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost?${formData.toString()}`,
      {},
      {
        headers: {
          key: "o3gfc3EQa029da2e311e2db238H0W7rU",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.data || response.data.data.length < 1)
      throw new Error("Data tidak ditemukan.");

    return response.data.data;
  } catch (error) {
    console.log(error);
    return { error: "Terjadi kesalahan internal" };
  }
}

export async function getRajaOngkirLocationsData(district: string) {
  try {
    const response = await axios.get<RajaOngkirDomesticLocationType>(
      `https://rajaongkir.komerce.id/api/v1/destination/domestic-destination?search=${district}`,
      {
        headers: {
          key: "o3gfc3EQa029da2e311e2db238H0W7rU",
        },
      }
    );

    if (!response.data.data || response.data.data.length < 1)
      throw new Error("Data tidak ditemukan.");

    return {
      message: "Lokasi berhasil diakses.",
      data: response.data.data[0].id,
    };
  } catch (error) {
    console.log(error);
    return { error: "Terjadi kesalahan internal" };
  }
}

const snap = new MidtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT,
  serverKey: process.env.MIDTRANS_ID_SECRET,
});

export async function orderTokenizer({
  alamat,
  lineItems,
  catatan,
  ongkir,
  informasiPembeli: { email, nama, nomorHp, contactId, memberId },
  layananKurir,
  orderId,
  orderNumber,
  grossAmount,
}: CheckoutDataType & {
  orderId?: string;
  orderNumber?: string;
  grossAmount?: number;
}) {
  try {
    const shippingCost = Math.round(ongkir);
    const item_details = lineItems.map((item) => ({
      price: Math.round(item.price),
      quantity: Math.max(1, Math.floor(item.quantity)),
      name:
        item.productName.length > 45
          ? `${item.productName.slice(0, 22)}...${item.productName.slice(-22)}`
          : item.productName || "Produk",
    }));

    item_details.push({
      price: shippingCost,
      quantity: 1,
      name: "Ongkos Kirim",
    });

    const calculatedGrossAmount = item_details.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const gross_amount = grossAmount
      ? Math.round(grossAmount)
      : calculatedGrossAmount;

    const midtransOrderId = orderNumber
      ? `${orderNumber}-${Date.now()}`
      : randomUUID();

    const parameter = {
      item_details:
        grossAmount && Math.abs(calculatedGrossAmount - gross_amount) > 0
          ? [
              {
                price: Math.max(0, gross_amount - shippingCost),
                quantity: 1,
                name: orderNumber ? `Pesanan ${orderNumber}` : "Pesanan Butik Busana",
              },
              {
                price: shippingCost,
                quantity: 1,
                name: "Ongkos Kirim",
              },
            ]
          : item_details,
      customer_details: {
        first_name: nama.trim().split(" ")[0] || "Pelanggan",
        last_name: nama.trim().split(" ").slice(1).join(" "),
        email: email.trim() || "customer@butik-busana.local",
        phone: nomorHp.trim() || "081000000000",
      },
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount,
      },
      // custom_field dikembalikan di webhook Midtrans (metadata tidak)
      custom_field1: orderId || "",
      custom_field2: orderNumber || "",
      metadata: {
        lineItems,
        buyerInfo: {
          contactId,
          email,
          memberId,
          nama,
          nomorHp,
        },
        alamat,
        catatan: catatan || "",
        ongkir,
        layananKurir,
        orderId: orderId || "",
      } as MidtransNotificationMetadata,
    };

    const token = await snap.createTransactionToken(parameter);
    return { token };
  } catch (error) {
    console.error("Midtrans Error: ", error);
    throw new Error("Midtrans Error: " + error);
  }
}

export async function getRekeningBank(): Promise<RekeningBankQueryType[]> {
  try {
    const banks = await prisma.rekeningBank.findMany();
    return banks.map((b) => ({
      _id: b.id,
      namaPenerima: b.namaPenerima,
      jenisBank: b.jenisBank,
      nomorRekening: b.nomorRekening,
      gambarBank: b.gambarBank || "",
      _owner: "",
      _createdDate: b.createdAt.toISOString(),
      _updatedDate: b.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function cancelOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { slug: true } } },
    });
    if (!order) {
      throw new Error("Order not found");
    }
    if (order.status === "CANCELED") {
      return { success: true, message: "Order cancelled successfully" };
    }
    if (order.paymentStatus === "NOT_PAID") {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELED" },
      });

      const userSlug = order.user?.slug;
      const orderUrl = userSlug
        ? `/user/${userSlug}/transactions/${order.id}`
        : "/";

      try {
        await sendPushToUser(order.userId, {
          title: "Pesanan Dibatalkan",
          body: `Pesanan #${order.orderNumber} berhasil dibatalkan.`,
          url: orderUrl,
          tag: `order-canceled-${order.id}`,
          requireInteraction: true,
        });
      } catch (_e) {}

      return { success: true, message: "Order cancelled successfully" };
    }
    throw new Error("Only unpaid orders can be cancelled");
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, message: error };
  }
}
