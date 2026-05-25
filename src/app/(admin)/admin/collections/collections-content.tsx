"use client";

import Link from "next/link";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminMediaPreview } from "@/components/admin/admin-media-preview";

interface CollectionsContentProps {
  collections: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  basePath: string;
}

export function CollectionsContent({ collections, total, page, limit, basePath }: CollectionsContentProps) {
  return (
    <DataTable
      data={collections}
      total={total}
      page={page}
      limit={limit}
      basePath={basePath}
      searchKey="search"
      sortOptions={[
        { value: "name-asc", label: "Nama A-Z" },
        { value: "name-desc", label: "Nama Z-A" },
      ]}
      actions={(item) => (
        <span className="flex gap-3 items-center">
          <Link href={`/admin/collections/${item.id}/edit`}>
            <Button type="primary" icon={<EditOutlined />} />
          </Link>
          <DeleteButton
            id={String(item.id)}
            deleteUrl="/api/admin/collections"
            title="Hapus Kategori"
            message="Apakah anda yakin ingin menghapus kategori ini?"
            successMessage="Kategori berhasil dihapus"
          />
        </span>
      )}
      columns={[
        {
          key: "imageUrl",
          header: "Gambar",
          render: (item) => {
            const url = (item.imageUrl as string) || "/default.jpg";
            return (
              <AdminMediaPreview
                url={url}
                type="image"
                thumbnailClassName="relative w-12 h-12 rounded overflow-hidden"
                imageSizes="48px"
              />
            );
          },
        },
        { key: "name", header: "Nama" },
        { key: "slug", header: "Slug" },
        { key: "numberOfProducts", header: "Jumlah Produk" },
      ]}
      idKey="id"
    />
  );
}
