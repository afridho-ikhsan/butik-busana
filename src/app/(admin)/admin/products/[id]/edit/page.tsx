import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm, { type ProductVariant } from "@/components/admin/product-form";
import Link from "next/link";
import { RollbackOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, collections] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.collection.findMany(),
  ]);

  if (!product) return notFound();

  const productForForm = {
    ...product,
    variants: (product.variants ?? []) as ProductVariant[],
    additionalInfo: (product.additionalInfo ?? []) as { title?: string; value?: string }[],
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <Button icon={<RollbackOutlined />}>
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold mb-0">Edit Produk</h1>
      </div>
      <ProductForm product={productForForm} collections={collections} />
    </div>
  );
}
