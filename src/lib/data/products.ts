import { prisma } from "@/lib/prisma";

export async function getProducts(params?: {
  limit?: number;
  collectionId?: string;
  collectionSlug?: string;
  sort?: string;
  min?: number;
  max?: number;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    quantity: { gt: 0 },
    price: {
      gte: params?.min ?? 0,
      lte: params?.max ?? 999999999,
    },
  };

  if (params?.collectionId) {
    where.collectionIds = { has: params.collectionId };
  }

  if (params?.collectionSlug) {
    const collection = await prisma.collection.findUnique({
      where: { slug: params.collectionSlug },
    });
    if (collection) {
      where.collectionIds = { has: collection.id };
    }
  }

  if (params?.search) {
    where.name = { contains: params.search, mode: "insensitive" };
  }

  const orderBy = params?.sort === "asc"
    ? { updatedAt: "asc" as const }
    : { updatedAt: "desc" as const };

  return prisma.product.findMany({
    where,
    take: params?.limit ?? 18,
    orderBy,
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug: decodeURIComponent(slug) },
  });
}
