import { prisma } from "@/lib/prisma";

export async function getMarqueeDuration(): Promise<number> {
  const config = await prisma.siteConfig.findUnique({
    where: { key: "marqueeDuration" },
  });
  if (!config) return 10;
  const num = parseInt(config.value, 10);
  return Number.isNaN(num) || num < 1 ? 10 : Math.min(num, 120);
}

export async function getSliderDuration(): Promise<number> {
  const config = await prisma.siteConfig.findUnique({
    where: { key: "sliderDuration" },
  });

  if (!config) return 5;
  const num = parseInt(config.value, 10);
  return Number.isNaN(num) || num < 1 ? 5 : Math.min(num, 120);
}
