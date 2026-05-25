import { prisma } from "@/lib/prisma";

export async function getMarqueeItems() {
  return prisma.marqueeItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
}