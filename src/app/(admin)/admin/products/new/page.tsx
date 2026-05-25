import ProductForm from "@/components/admin/product-form";
import { prisma } from "@/lib/prisma";
import { RollbackOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Link from "next/link";

export default async function NewProductPage() {
  const collections = await prisma.collection.findMany();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Tambah Produk</h1>
      </div>
      <ProductForm collections={collections} />
    </div>
  );
}
