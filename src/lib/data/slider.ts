import { prisma } from "@/lib/prisma";

export async function getSliderSlides() {
  return prisma.sliderSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });
}
