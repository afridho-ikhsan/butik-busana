import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ProductsContent } from "./products-content";

const LIMIT = 10;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const sort = params.sort || "updatedAt-desc";
  const collectionId = params.collectionId || "";
  const skip = (page - 1) * LIMIT;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
    ];
  }
  if (collectionId) {
    where.collectionIds = { has: collectionId };
  }

  const [sortField, sortDir] = sort.split("-");
  const orderBy = { [sortField || "updatedAt"]: sortDir === "asc" ? "asc" : "desc" };

  const [products, total, collections] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: LIMIT,
      orderBy,
    }),
    prisma.product.count({ where }),
    prisma.collection.findMany(),
  ]);

  return (
    <div>
      <div className="flex gap-3 flex-row justify-between items-center mb-6 flex-wrap">
        <h1 className="text-2xl font-bold !m-0">Produk</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Tambah Produk
        </Link>
      </div>
      <ProductsContent
        products={products as unknown as Record<string, unknown>[]}
        total={total}
        page={page}
        limit={LIMIT}
        collections={collections}
        basePath="/admin/products"
      />
    </div>
  );
}
