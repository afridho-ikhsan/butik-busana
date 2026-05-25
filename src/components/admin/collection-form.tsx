"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useState } from "react";
import { Card, Input, Button, Row, Col, Typography } from "antd";
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { Plus } from "lucide-react";

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CollectionFormProps {
  collection?: { id: string; name: string; slug: string; imageUrl?: string | null };
}

export default function CollectionForm({ collection }: CollectionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: collection
      ? {
          name: collection.name,
          slug: collection.slug,
          imageUrl: collection.imageUrl || "",
        }
      : { name: "", slug: "", imageUrl: "" },
  });

  const name = watch("name");
  const imageUrl = watch("imageUrl");

  const handleImageUpload = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info !== "object") {
      toast.error("Tidak ada gambar yang diunggah");
      return;
    }
    const info = result.info as { url?: string; secure_url?: string };
    const url = info.secure_url || info.url || "";
    if (url) {
      setValue("imageUrl", url);
      toast.success("Gambar berhasil diunggah");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      };
      const url = collection ? `/api/admin/collections/${collection.id}` : "/api/admin/collections";
      const method = collection ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(collection ? "Kategori berhasil diubah" : "Kategori berhasil ditambahkan");
      router.push("/admin/collections");
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
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama *</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Nama kategori" size="large" />}
                />
                {errors.name && (
                  <Typography.Text type="danger" className="text-xs mt-1">{errors.name.message}</Typography.Text>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Slug</label>
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="slug-otomatis" size="large" />}
                />
              </div>
            </Col>
          </Row>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Gambar Kategori</label>
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-slate-50 shrink-0">
                {imageUrl ? (
                  <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Belum ada</div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
                  <CldUploadButton
                    uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET!}
                    onSuccess={handleImageUpload}
                    options={{ maxFiles: 1, cropping: true, resourceType: "image" }}
                    className="flex flex-col items-center justify-center gap-1 w-full py-4 px-4 cursor-pointer"
                  >
                    <Plus className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Upload Gambar</span>
                  </CldUploadButton>
                </div>
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Atau paste URL gambar" size="large" />
                  )}
                />
              </div>
            </div>
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
