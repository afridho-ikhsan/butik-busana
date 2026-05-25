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
  namaPenerima: z.string().min(1),
  jenisBank: z.string().min(1),
  nomorRekening: z.string().min(1),
  gambarBank: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RekeningFormProps {
  bank?: { id: string; namaPenerima: string; jenisBank: string; nomorRekening: string; gambarBank?: string | null };
}

export default function RekeningForm({ bank }: RekeningFormProps) {
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
    defaultValues: bank
      ? {
        namaPenerima: bank.namaPenerima,
        jenisBank: bank.jenisBank,
        nomorRekening: bank.nomorRekening,
        gambarBank: bank.gambarBank || "",
      }
      : { namaPenerima: "", jenisBank: "", nomorRekening: "", gambarBank: "" },
  });

  const logoUrl = watch("gambarBank");

  const handleLogoUpload = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info !== "object") {
      toast.error("Tidak ada gambar yang diunggah");
      return;
    }
    const info = result.info as { url?: string; secure_url?: string };
    const url = info.secure_url || info.url || "";
    if (url) {
      setValue("gambarBank", url);
      toast.success("Logo bank berhasil diunggah");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const url = bank ? `/api/admin/rekening-bank/${bank.id}` : "/api/admin/rekening-bank";
      const method = bank ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(bank ? "Rekening berhasil diubah" : "Rekening berhasil ditambahkan");
      router.push("/admin/rekening-bank");
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
                <label className="block text-sm font-medium mb-2">Atas Nama *</label>
                <Controller
                  name="namaPenerima"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Nama pemilik rekening" size="large" />}
                />
                {errors.namaPenerima && (
                  <Typography.Text type="danger" className="text-xs mt-1">{errors.namaPenerima.message}</Typography.Text>
                )}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Jenis Bank *</label>
                <Controller
                  name="jenisBank"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="BCA, BRI, Mandiri, dll" size="large" />}
                />
                {errors.jenisBank && (
                  <Typography.Text type="danger" className="text-xs mt-1">{errors.jenisBank.message}</Typography.Text>
                )}
              </div>
            </Col>
          </Row>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nomor Rekening *</label>
            <Controller
              name="nomorRekening"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Nomor rekening" size="large" />}
            />
            {errors.nomorRekening && (
              <Typography.Text type="danger" className="text-xs mt-1">{errors.nomorRekening.message}</Typography.Text>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Logo Bank</label>
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-slate-50 shrink-0">
                {logoUrl ? (
                  <Image src={logoUrl} alt="Logo bank" fill className="object-contain" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Belum ada</div>
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 transition-colors">
                  <CldUploadButton
                    uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET!}
                    onSuccess={handleLogoUpload}
                    options={{ maxFiles: 1, cropping: false, resourceType: "image" }}
                    className="flex flex-col items-center justify-center gap-1 w-full py-4 px-4 cursor-pointer"
                  >
                    <Plus className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Upload Logo</span>
                  </CldUploadButton>
                </div>
                <Controller
                  name="gambarBank"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Atau paste URL logo" size="large" />
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
