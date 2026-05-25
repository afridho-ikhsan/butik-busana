"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { Input, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { DragSortTable } from "@/components/admin/drag-sort-table";
import { DeleteButton } from "@/components/admin/delete-button";

interface MarqueeItem {
  id: string;
  text: string;
  sortOrder: number;
}

interface MarqueeContentProps {
  items: MarqueeItem[];
  duration: number;
}

export function MarqueeContent({ items, duration: initialDuration }: MarqueeContentProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(String(initialDuration));
  const [isSavingDuration, setIsSavingDuration] = useState(false);

  const handleSaveDuration = async () => {
    const num = parseInt(duration, 10);
    if (Number.isNaN(num) || num < 1 || num > 120) {
      toast.error("Durasi harus 1-120 detik");
      return;
    }
    setIsSavingDuration(true);
    try {
      const res = await fetch("/api/admin/marquee/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: num }),
      });
      if (!res.ok) throw new Error();
      toast.success("Durasi animasi berhasil disimpan");
      router.refresh();
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setIsSavingDuration(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <label className="font-medium">Durasi animasi (detik):</label>
        <Input
          type="number"
          min={1}
          max={120}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-24"
        />
        <Button type="primary" onClick={handleSaveDuration} loading={isSavingDuration}>
          Simpan
        </Button>
      </div>

      <DragSortTable<MarqueeItem>
        items={items}
        reorderUrl="/api/admin/marquee/reorder"
        columns={[
          {
            key: "sortOrder",
            header: "Urutan",
            render: (_item, index) => index,
          },
          {
            key: "text",
            header: "Teks",
            render: (item) => (
              <span className="max-w-md truncate block" title={item.text}>
                {item.text}
              </span>
            ),
          },
        ]}
        renderActions={(item) => (
          <span className="flex gap-3 items-center">
            <Link href={`/admin/marquee/${item.id}/edit`}>
              <Button type="primary" icon={<EditOutlined />} />
            </Link>
            <DeleteButton
              id={item.id}
              deleteUrl="/api/admin/marquee"
              title="Hapus Marquee"
              message="Apakah anda yakin ingin menghapus item marquee ini?"
              successMessage="Marquee berhasil dihapus"
            />
          </span>
        )}
      />
    </div>
  );
}
