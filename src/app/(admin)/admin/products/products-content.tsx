"use client";

import Link from "next/link";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminMediaPreview } from "@/components/admin/admin-media-preview";
import { rupiahFormatter } from "@/utils/number-formatter";
import { Typography } from "antd";
const { Text } = Typography;

interface ProductsContentProps {
  products: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  collections: { id: string; name: string }[];
  basePath: string;
}

export function ProductsContent({ products, total, page, limit, collections, basePath }: ProductsContentProps) {
  return (
    <DataTable
      data={products}
      total={total}
      page={page}
      limit={limit}
      basePath={basePath}
      searchKey="search"
      filterOptions={[
        {
          key: "collectionId",
          label: "Kategori",
          options: [{ value: "", label: "Semua" }, ...collections.map((c) => ({ value: c.id, label: c.name }))],
        },
      ]}
      sortOptions={[
        { value: "updatedAt-desc", label: "Terbaru" },
        { value: "updatedAt-asc", label: "Terlama" },
        { value: "name-asc", label: "Nama A-Z" },
        { value: "name-desc", label: "Nama Z-A" },
        { value: "price-asc", label: "Harga Terendah" },
        { value: "price-desc", label: "Harga Tertinggi" },
      ]}
      actions={(item) => (
        <span className="flex gap-3 items-center">
          <Link href={`/admin/products/${item.id}/edit`}>
            <Button type="primary" icon={<EditOutlined />} />
          </Link>
          <DeleteButton
            id={String(item.id)}
            deleteUrl="/api/admin/products"
            title="Hapus Produk"
            message="Apakah anda yakin ingin menghapus produk ini?"
            successMessage="Produk berhasil dihapus"
          />
        </span>
      )}
      columns={[
        {
          key: "media",
          header: "Gambar",
          render: (item) => {
            const media = (item.media as { url?: string }[]) || [];
            const url = media[0]?.url || "/product.png";
            return (
              <AdminMediaPreview
                url={url}
                type="image"
                thumbnailClassName="relative w-12 h-12 rounded overflow-hidden"
                imageSizes="48px"
                unoptimized={url.startsWith("http")}
              />
            );
          },
        },
        { key: "name", header: "Nama" },
        {
          key: "price",
          header: "Harga",
          align: 'center',
          render: (item) => {
            const validDiscountPrice = item.discountedPrice !== item.price;
            return <Text delete={validDiscountPrice} className={`${validDiscountPrice ? "!text-slate-400" : ""}`}>{rupiahFormatter.format(item.price as number)}</Text>
          },
        },
        {
          key: "discountedPrice",
          header: "Harga Diskon",
          align: 'center',
          render: (item) => item.discountedPrice === item.price ? '-' : rupiahFormatter.format(item.discountedPrice as number),
        },
        { key: "quantity", header: "Stok", align: 'center'},
        {
          key: "slug",
          header: "Slug",
          render: (item) => (
            <span className="text-xs text-slate-500">{String(item.slug)}</span>
          ),
        },
      ]}
      idKey="id"
    />
  );
}
