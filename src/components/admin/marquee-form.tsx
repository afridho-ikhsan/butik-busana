"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useState } from "react";
import { Card, Input, Button, Typography } from "antd";

const schema = z.object({
  text: z.string().min(1),
  sortOrder: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface MarqueeFormProps {
  item?: { id: string; text: string; sortOrder: number };
}

export default function MarqueeForm({ item }: MarqueeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: item
      ? { text: item.text, sortOrder: item.sortOrder }
      : { text: "", sortOrder: 0 },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const url = item ? `/api/admin/marquee/${item.id}` : "/api/admin/marquee";
      const method = item ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(item ? "Marquee berhasil diubah" : "Marquee berhasil ditambahkan");
      router.push("/admin/marquee");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow-sm mb-6">
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Teks *</label>
            <Controller
              name="text"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  placeholder="Teks yang ditampilkan di marquee"
                  rows={3}
                  size="large"
                  status={errors.text ? "error" : undefined}
                />
              )}
            />
            {errors.text && (
              <Typography.Text type="danger" className="text-xs mt-1">{errors.text.message}</Typography.Text>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Urutan</label>
            <Controller
              name="sortOrder"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  size="large"
                />
              )}
            />
          </div>
        </div>
      </Card>

      <div className="flex gap-3 mt-6 justify-end flex-wrap">
        <Button type="primary" htmlType="submit" loading={isSubmitting} size="large">
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button size="large" onClick={() => router.back()}>
          Batal
        </Button>
      </div>
    </form>
  );
}
