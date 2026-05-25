import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RekeningForm from "@/components/admin/rekening-form";
import Link from "next/link";
import { Button } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

export default async function EditRekeningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bank = await prisma.rekeningBank.findUnique({ where: { id } });

  if (!bank) return notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/rekening-bank" className="text-slate-600 hover:text-slate-800">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Edit Rekening Bank</h1>
      </div>
      <RekeningForm bank={bank} />
    </div>
  );
}
