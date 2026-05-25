"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { useState } from "react";
import { Card, Input, Button, Typography } from "antd";
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { Plus } from "lucide-react";
import { isValidUrl } from "@/utils/general";

const schema = z.object({
  imageUrl: z.string().min(1),
  linkUrl: z.string().optional(),
  sortOrder: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

interface SliderFormProps {
  slide?: { id: string; imageUrl: string; linkUrl?: string | null; sortOrder: number };
}

export default function SliderForm({ slide }: SliderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: slide
      ? { imageUrl: slide.imageUrl, linkUrl: slide.linkUrl || "", sortOrder: slide.sortOrder }
      : { imageUrl: "", linkUrl: "", sortOrder: 0 },
  });

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
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        sortOrder: data.sortOrder,
      };
      const url = slide ? `/api/admin/slider/${slide.id}` : "/api/admin/slider";
      const method = slide ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(slide ? "Slider berhasil diubah" : "Slider berhasil ditambahkan");
      router.push("/admin/slider");
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(isValidUrl(imageUrl), 'isValidUrl', imageUrl);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="shadow-sm mb-6">
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Gambar *</label>
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative w-48 h-28 rounded-lg overflow-hidden border bg-slate-50 shrink-0">
                {imageUrl ? (
                  <Image src={isValidUrl(imageUrl) || imageUrl.startsWith("/") ? imageUrl : ''} alt="Preview" fill className="object-cover" sizes="192px" unoptimized={imageUrl.startsWith("http")} />
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
                {errors.imageUrl && (
                  <Typography.Text type="danger" className="text-xs mt-1">{errors.imageUrl.message}</Typography.Text>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Link URL</label>
            <Controller
              name="linkUrl"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="https://www.toserbanet.com/products/..."
                  size="large"
                />
              )}
            />
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
