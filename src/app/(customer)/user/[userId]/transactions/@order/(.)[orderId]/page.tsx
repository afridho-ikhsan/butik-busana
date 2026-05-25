import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import OrderDetailModal from "@/components/order-detail-modal";
import { formatDate } from "@/utils/date-formatter";
import TimerText from "@/components/timer-text";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { cancelOrder } from "@/actions";
import { OrderDetailContent } from "@/components/order-detail/order-detail-content";

async function OrderDetailModalPage({
  params,
}: {
  params: Promise<{ userId: string; orderId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();

  const { orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  });

  if (!order) return notFound();

  const tomorrowTimeStamp = new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000;

  if (Date.now() > tomorrowTimeStamp && order.paymentStatus === "NOT_PAID") {
    await cancelOrder(order.id);
  }

  const lineItems = (order.lineItems as { productName?: string; price?: number; quantity?: number; image?: string; catalogReference?: object }[]) || [];
  const orderForDisplay = {
    lineItems: lineItems.map((item) => ({
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      catalogReference: item.catalogReference || { appId: "", catalogItemId: "", options: {} },
    })),
    customFields: [
      { title: "layananKurir", value: order.layananKurir || "" },
      { title: "metodePembayaran", value: order.metodePembayaran || "" },
    ],
    priceSummary: {
      subtotal: { amount: order.subtotal.toString() },
      shipping: { amount: order.shippingCost.toString() },
      total: { amount: order.total.toString() },
    },
    billingInfo: {
      address: { addressLine1: order.address },
      contactDetails: {
        firstName: order.recipientName?.split(" ")[0] || "",
        lastName: order.recipientName?.split(" ").slice(1).join(" ") || "",
        phone: order.recipientPhone || "",
      },
    },
  };

  return (
    <OrderDetailModal
      data={{
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
      }}
    >
      <div
        className="overflow-y-auto flex flex-col gap-3 text-xs py-3 pr-1 lg:pr-3 scrollbar relative"
        id="order-modal-content"
      >
        {order.paymentStatus === "NOT_PAID" && order.status !== "CANCELED" && (
          <div className="bg-blue-200 p-3 flex flex-col gap-1 text-center rounded-lg">
            <p>Lakukan pembayaran sebelum</p>
            <p className="font-semibold text-md">
              {formatDate(tomorrowTimeStamp)}
            </p>
            {Date.now() >= tomorrowTimeStamp ? (
              <p className="text-red-500 text-lg font-medium">Waktu Pembayaran Habis</p>
            ) : (
              <TimerText targetDate={tomorrowTimeStamp} className="text-lg font-semibold text-blue-500" />
            )}
          </div>
        )}

        {order.status === "CANCELED" && (
          <div className="bg-gray-200 p-3 flex gap-2 items-center rounded-lg">
            <IoMdInformationCircleOutline size="2rem" className="shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Pesanan ini telah dibatalkan</p>
              <p>Lakukan pemesanan ulang untuk proses pesanan lebih lanjut</p>
            </div>
          </div>
        )}

        <OrderDetailContent
          variant="customer"
          order={{
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            lineItems,
            address: order.address,
            layananKurir: order.layananKurir,
            metodePembayaran: order.metodePembayaran,
            subtotal: order.subtotal,
            shippingCost: order.shippingCost,
            total: order.total,
          }}
          orderForDisplay={orderForDisplay}
          cardClassName="bg-slate-100"
        />
      </div>
    </OrderDetailModal>
  );
}

export default OrderDetailModalPage;
