"use client";

import Link from "next/link";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { DataTable } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { AdminMediaPreview } from "@/components/admin/admin-media-preview";

interface RekeningContentProps {
  banks: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  basePath: string;
}

export function RekeningContent({ banks, total, page, limit, basePath }: RekeningContentProps) {
  return (
    <DataTable
      data={banks}
      total={total}
      page={page}
      limit={limit}
      basePath={basePath}
      searchKey="search"
      actions={(item) => (
        <span className="flex gap-3 items-center">
          <Link href={`/admin/rekening-bank/${item.id}/edit`}>
            <Button type="primary" icon={<EditOutlined />} />
          </Link>
          <DeleteButton
            id={String(item.id)}
            deleteUrl="/api/admin/rekening-bank"
            title="Hapus Rekening"
            message="Apakah anda yakin ingin menghapus rekening ini?"
            successMessage="Rekening berhasil dihapus"
          />
        </span>
      )}
      columns={[
        {
          key: "gambarBank",
          header: "Logo",
          render: (item) => {
            const url = (item.gambarBank as string) || "/broken-image.png";
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
        { key: "jenisBank", header: "Bank" },
        { key: "nomorRekening", header: "Nomor Rekening" },
        { key: "namaPenerima", header: "Atas Nama" },
      ]}
      idKey="id"
    />
  );
}
