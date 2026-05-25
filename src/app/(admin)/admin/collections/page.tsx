import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CollectionsContent } from "./collections-content";

const LIMIT = 10;

export default async function AdminCollectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const sort = params.sort || "name-asc";
  const skip = (page - 1) * LIMIT;

  const where = search
    ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] }
    : {};

  const [sortField, sortDir] = sort.split("-");
  const orderBy = { [sortField || "name"]: sortDir === "desc" ? "desc" : "asc" };

  const [collections, total] = await Promise.all([
    prisma.collection.findMany({
      where,
      skip,
      take: LIMIT,
      orderBy,
    }),
    prisma.collection.count({ where }),
  ]);

  return (
    <div>
      <div className="flex gap-3 flex-row justify-between items-center mb-6 flex-wrap">
        <h1 className="text-2xl font-bold !m-0">Kategori</h1>
        <Link
          href="/admin/collections/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Tambah Kategori
        </Link>
      </div>
      <CollectionsContent
        collections={collections as unknown as Record<string, unknown>[]}
        total={total}
        page={page}
        limit={LIMIT}
        basePath="/admin/collections"
      />
    </div>
  );
}
