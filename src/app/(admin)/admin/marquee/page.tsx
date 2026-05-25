import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MarqueeContent } from "./marquee-content";
import { getMarqueeDuration } from "@/lib/data/site-config";

export default async function AdminMarqueePage() {
  const [items, duration] = await Promise.all([
    prisma.marqueeItem.findMany({ orderBy: { sortOrder: "asc" } }),
    getMarqueeDuration(),
  ]);

  return (
    <div>
      <div className="flex gap-3 flex-row justify-between items-center mb-6 flex-wrap">
        <h1 className="text-2xl font-bold !m-0">Marquee</h1>
        <Link
          href="/admin/marquee/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Tambah Marquee
        </Link>
      </div>
      <MarqueeContent items={items} duration={duration} />
    </div>
  );
}
