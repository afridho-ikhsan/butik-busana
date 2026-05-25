import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RekeningContent } from "./rekening-content";

const LIMIT = 10;

export default async function AdminRekeningBankPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const search = params.search || "";
  const skip = (page - 1) * LIMIT;

  const where = search
    ? {
        OR: [
          { namaPenerima: { contains: search } },
          { jenisBank: { contains: search } },
          { nomorRekening: { contains: search } },
        ],
      }
    : {};

  const [banks, total] = await Promise.all([
    prisma.rekeningBank.findMany({
      where,
      skip,
      take: LIMIT,
      orderBy: { jenisBank: "asc" },
    }),
    prisma.rekeningBank.count({ where }),
  ]);

  return (
    <div>
      <div className="flex gap-3 flex-row justify-between items-center mb-6 flex-wrap">
        <h1 className="text-2xl font-bold !m-0">Rekening Bank</h1>
        <Link
          href="/admin/rekening-bank/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
        >
          Tambah Rekening
        </Link>
      </div>
      <RekeningContent
        banks={banks as unknown as Record<string, unknown>[]}
        total={total}
        page={page}
        limit={LIMIT}
        basePath="/admin/rekening-bank"
      />
    </div>
  );
}
