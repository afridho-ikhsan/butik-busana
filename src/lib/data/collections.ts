import { prisma } from "@/lib/prisma";

export async function getCollections() {
  return prisma.collection.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCollectionBySlug(slug: string) {
  return prisma.collection.findUnique({
    where: { slug },
  });
}
