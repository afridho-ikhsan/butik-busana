import { CheckoutDataType } from "@/types/checkout-types";
import { toast } from "react-toastify";
import { orderTokenizer } from "@/actions";
import { createOrder } from "@/lib/order";

function waitForSnap(maxWaitMs = 8000) {
  return new Promise<{ pay: (token: string, options: object) => void }>((resolve, reject) => {
    const startedAt = Date.now();

    const checkSnap = () => {
      const snap = (window as unknown as { snap?: { pay: (token: string, options: object) => void } }).snap;
      if (snap) {
        resolve(snap);
        return;
      }
      if (Date.now() - startedAt >= maxWaitMs) {
        reject(new Error("Midtrans Snap belum dimuat. Muat ulang halaman lalu coba lagi."));
        return;
      }
      setTimeout(checkSnap, 100);
    };

    checkSnap();
  });
}

export const redirectToCheckout = async (
  checkoutData: CheckoutDataType & {
    orderId?: string;
    orderNumber?: string;
    grossAmount?: number;
  },
  _userId: string,
  toMidtrans: boolean = false
) => {
  try {
    if (toMidtrans) {
      const { token } = await orderTokenizer(checkoutData);
      if (!token) throw new Error("Gagal membuat token pembayaran");

      const snap = await waitForSnap();
      const redirectUserId =
        checkoutData.informasiPembeli.userSlug ||
        checkoutData.informasiPembeli.memberId;

      snap.pay(token, {
        onSuccess: () => {
          window.location.href = `/user/${redirectUserId}/transactions`;
        },
        onPending: () => toast.info("Pembayaran menunggu konfirmasi"),
        onError: () => toast.error("Pembayaran tidak valid"),
        onClose: () => toast.info("Pembayaran dibatalkan"),
      });
      return null;
    }
    const createdOrder = await createOrder(checkoutData);
    return createdOrder;
  } catch (error) {
    throw new Error(String(error));
  }
};