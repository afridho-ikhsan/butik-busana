import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/utils/date-formatter";
import Link from "next/link";
import { Button, Tag } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import { OrderDetailContent } from "@/components/order-detail/order-detail-content";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!order) return notFound();

  const lineItems = (order.lineItems as { productName?: string; price?: number; quantity?: number }[]) || [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/orders">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Pesanan #{order.orderNumber}</h1>

        <div className="flex gap-2">
          <Tag color={order.paymentStatus === "PAID" ? "green" : "red"} variant='filled' className="!px-4 !py-1 !rounded-xl">
            {order.paymentStatus === "PAID" ? "Sudah Bayar" : "Belum Bayar"}
          </Tag>
        </div>
      </div>

      <div className="space-y-6">
        <OrderDetailContent
          variant="admin"
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
            recipientName: order.recipientName,
            recipientPhone: order.recipientPhone,
            user: order.user,
          }}
        />
      </div>
    </div>
  );
}
