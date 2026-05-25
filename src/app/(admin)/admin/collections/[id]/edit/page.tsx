import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CollectionForm from "@/components/admin/collection-form";
import Link from "next/link";
import { Button } from "antd";
import { RollbackOutlined } from "@ant-design/icons";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({ where: { id } });

  if (!collection) return notFound();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/collections">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Edit Kategori</h1>
      </div>
      <CollectionForm collection={collection} />
    </div>
  );
}
