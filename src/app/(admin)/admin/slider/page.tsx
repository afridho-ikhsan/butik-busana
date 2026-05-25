import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SliderDragContent } from "./slider-drag-content";
import { getSliderDuration } from "@/lib/data/site-config";

export default async function AdminSliderPage() {
  const [slides, duration] = await Promise.all([
    prisma.sliderSlide.findMany({ orderBy: { sortOrder: "asc" } }),
    getSliderDuration(),
  ]);

  return (
    <div>
      <div className="flex gap-3 flex-row justify-between items-center mb-6 flex-wrap">
        <h1 className="text-2xl font-bold !m-0">Slider</h1>
        <Link
          href="/admin/slider/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Tambah Slider
        </Link>
      </div>
      <SliderDragContent slides={slides} duration={duration} />
    </div>
  );
}
