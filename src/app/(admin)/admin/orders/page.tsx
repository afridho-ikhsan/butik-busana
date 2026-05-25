import { prisma } from "@/lib/prisma";
import { OrdersContent } from "./orders-content";

const LIMIT = 10;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const status = params.status || "";
  const paymentStatus = params.paymentStatus || "";
  const sort = params.sort || "createdAt-desc";
  const skip = (page - 1) * LIMIT;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { address: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;

  const [sortField, sortDir] = sort.split("-");
  const orderBy = { [sortField || "createdAt"]: sortDir === "asc" ? "asc" : "desc" };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: LIMIT,
      orderBy,
      include: {
        user: { select: { email: true, nickname: true } },
        paymentEvidences: {
          select: { id: true, linkBuktiPembayaran: true, namaFoto: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pesanan</h1>
      <OrdersContent
        orders={orders}
        total={total}
        page={page}
        limit={LIMIT}
        basePath="/admin/orders"
      />
    </div>
  );
}
