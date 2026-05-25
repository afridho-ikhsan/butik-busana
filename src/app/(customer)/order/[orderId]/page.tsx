import { notFound } from "next/navigation";
import { getOrderByIdPublic } from "@/lib/order";
import { formatDate } from "@/utils/date-formatter";
import { cancelOrder } from "@/actions";
import PayButton from "@/components/buttons/pay-button";
import TimerText from "@/components/timer-text";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { OrderDetailContent } from "@/components/order-detail/order-detail-content";

async function PublicOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderByIdPublic(orderId);

  if (!order) return notFound();

  const isCanceled =
    Date.now() >= order.createdAt.getTime() + 24 * 60 * 60 * 1000;
  const tomorrowTimeStamp =
    new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000;

  if (Date.now() > tomorrowTimeStamp && order.paymentStatus === "NOT_PAID") {
    await cancelOrder(order.id);
  }

  const lineItems =
    (order.lineItems as {
      productName?: string;
      price?: number;
      quantity?: number;
      image?: string;
    }[]) || [];

  const orderForDisplay = {
    _id: order.id,
    number: order.orderNumber,
    _createdDate: order.createdAt,
    paymentStatus: order.paymentStatus,
    status: order.status,
    lineItems: lineItems.map((item) => ({
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    })),
    priceSummary: {
      subtotal: { amount: order.subtotal.toString() },
      shipping: { amount: order.shippingCost.toString() },
      total: { amount: order.total.toString() },
    },
    customFields: [
      { title: "layananKurir", value: order.layananKurir || "" },
      { title: "metodePembayaran", value: order.metodePembayaran || "" },
    ],
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
    <div className="overflow-y-auto flex flex-col gap-3 text-xs py-3 pr-1 lg:pr-3 max-w-2xl mx-auto px-4">
      <h1 className="text-xl font-bold">Detail Pesanan</h1>

      {order.paymentStatus === "NOT_PAID" &&
        order.status !== "CANCELED" &&
        !isCanceled && (
          <div className="bg-blue-200 p-3 flex flex-col gap-1 text-center rounded-lg">
            <p>Lakukan pembayaran sebelum</p>
            <p className="font-semibold text-md">
              {formatDate(tomorrowTimeStamp)}
            </p>
            <TimerText
              targetDate={tomorrowTimeStamp}
              className="text-lg font-semibold text-blue-500"
            />
          </div>
        )}

      {(order.status === "CANCELED" || isCanceled) && (
        <div className="bg-gray-200 p-3 flex gap-2 items-center rounded-lg">
          <IoMdInformationCircleOutline size="2rem" className="shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-semibold">Pesanan ini telah dibatalkan</p>
            <p>
              Lakukan pemesanan ulang untuk proses pesanan lebih lanjut
            </p>
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
        footer={
          order.paymentStatus !== "PAID" &&
          order.status !== "CANCELED" &&
          !isCanceled ? (
            <PayButton
              orderId={order.id}
              buttonText="Bayar"
              className="w-full rounded-lg"
              orderNumber={order.orderNumber}
            />
          ) : undefined
        }
      />
    </div>
  );
}

export default PublicOrderPage;
