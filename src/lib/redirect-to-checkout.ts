import { CheckoutDataType } from "@/types/checkout-types";
import { toast } from "react-toastify";
import apiClient from "@/lib/api/client";
import { orderTokenizer } from "@/actions";
import { createOrder } from "@/lib/order";

export const redirectToCheckout = async (
  checkoutData: CheckoutDataType,
  _userId: string,
  toMidtrans: boolean = false
) => {
  try {
    if (toMidtrans) {
      const { token } = await orderTokenizer(checkoutData);
      if (!token) throw new Error("Gagal membuat token pembayaran");
      if (typeof window !== "undefined" && (window as unknown as { snap?: unknown }).snap) {
        (window as unknown as { snap: { pay: (t: string, o: object) => void } }).snap.pay(token, {
          onSuccess: () => {
            window.location.href = `/user/${checkoutData.informasiPembeli.memberId}/transactions`;
          },
          onPending: () => toast.error("Pembayaran dalam status pending"),
          onError: () => toast.error("Pembayaran tidak valid"),
          onClose: () => toast.error("Pembayaran dibatalkan"),
        });
      }
      return null;
    }
    const createdOrder = await createOrder(checkoutData);
    return createdOrder;
  } catch (error) {
    throw new Error(String(error));
  }
};