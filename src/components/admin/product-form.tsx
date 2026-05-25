"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import {
  Card,
  Input,
  InputNumber,
  Button,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Switch,
  Flex,
} from "antd";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import RichTextEditor from "@/components/form/rich-text-editor";
import { AdminMediaPreview } from "./admin-media-preview";

type MediaItem = { type: "image" | "video"; url: string };

export type ProductVariant = {
  name: string;
  price: number;
  weight: number;
  quantity: number;
  imageUrl?: string;
  discountType?: "percent" | "amount";
  discountValue?: number;
};

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0),
  discountType: z.enum(["percent", "amount"]).optional(),
  discountValue: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : val),
    z.number().min(0)
  ),
  quantity: z.number().min(0),
  weight: z.number().min(0).optional(),
  collectionIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const MARKETPLACE_KEYS = ["tokopedia", "shopee", "tiktok"] as const;
type MarketplaceKey = (typeof MARKETPLACE_KEYS)[number];

function parseMarketplaceFromAdditionalInfo(
  additionalInfo: { title?: string; value?: string }[] | null | undefined
): Record<MarketplaceKey, string> {
  const list = additionalInfo || [];
  const getUrl = (key: string) => {
    const item = list.find((i) => (i.title || "").toLowerCase() === key);
    const v = item?.value || "";
    return v.replace(/<[^>]*>/g, "").trim();
  };
  return {
    tokopedia: getUrl("tokopedia"),
    shopee: getUrl("shopee"),
    tiktok: getUrl("tiktok"),
  };
}

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    price: number;
    discountedPrice?: number | null;
    quantity: number;
    weight: number;
    media?: unknown[];
    variants?: ProductVariant[];
    additionalInfo?: { title?: string; value?: string }[];
    collectionIds: string[];
  };
  collections: { id: string; name: string }[];
}

const emptyVariant: ProductVariant = {
  name: "",
  price: 0,
  weight: 0,
  quantity: 0,
  discountType: "amount",
  discountValue: 0,
};

function getVariantSalePrice(v: ProductVariant): number {
  const base = Number(v.price) || 0;
  const type = v.discountType ?? "amount";
  const val = Number(v.discountValue ?? 0) || 0;
  if (val <= 0) return base;
  return type === "percent" ? base * (1 - val / 100) : Math.max(0, base - val);
}

export default function ProductForm({ product, collections }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVariants, setHasVariants] = useState(
    !!product?.variants?.length
  );
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    const v = (product?.variants as ProductVariant[] | undefined) || [];
    return v.length > 0
      ? v.map((x) => ({
        ...emptyVariant,
        ...x,
        imageUrl: x.imageUrl || "",
        discountType: x.discountType ?? "amount",
        discountValue: x.discountValue ?? 0,
      }))
      : [{ ...emptyVariant }];
  });
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => {
    const existing = (product?.media as { type?: string; url?: string }[] | undefined) || [];
    return existing.map((m) => ({
      type: (m.type === "video" ? "video" : "image") as "image" | "video",
      url: m.url || "",
    }));
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [variantErrors, setVariantErrors] = useState<Record<number, { name?: string; price?: string; quantity?: string; weight?: string }>>({});
  const variantCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [marketplaceLinks, setMarketplaceLinks] = useState<Record<MarketplaceKey, string>>(() =>
    parseMarketplaceFromAdditionalInfo(product?.additionalInfo as { title?: string; value?: string }[] | undefined)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? (() => {
        const price = product.price;
        const discountedPrice = product.discountedPrice ?? 0;
        const hasDiscount = discountedPrice > 0 && discountedPrice < price;
        const discountAmount = hasDiscount ? price - discountedPrice : 0;
        return {
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: product.price,
          discountType: "amount" as const,
          discountValue: discountAmount,
          quantity: product.quantity,
          weight: product.weight,
          collectionIds: (product.collectionIds || []).map((id) => String(id)),
        };
      })()
      : {
        name: "",
        slug: "",
        description: "",
        price: 0,
        discountType: "percent" as const,
        discountValue: 0,
        quantity: 0,
        weight: 0,
        collectionIds: [],
      },
  });

  const name = watch("name");
  const price = watch("price");
  const discountType = watch("discountType");
  const discountValue = watch("discountValue") ?? 0;
  const salePrice = discountType === "percent"
    ? price * (1 - (discountValue || 0) / 100)
    : Math.max(0, price - (discountValue || 0));

  useEffect(() => {
    const t = setTimeout(() => {
      const slug = (name ?? "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setValue("slug", slug);
    }, 400);
    return () => clearTimeout(t);
  }, [name, setValue]);

  const clearScrollLock = () => {
    const clear = () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.documentElement.style.overflow = "";
    };
    requestAnimationFrame(clear);
    setTimeout(clear, 100);
    setTimeout(clear, 300);
  };

  const handleMediaUpload = (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info !== "object") {
      toast.error("Tidak ada file yang diunggah");
      return;
    }
    const info = result.info as { url?: string; secure_url?: string; resource_type?: string };
    const url = info.secure_url || info.url || "";
    if (url) {
      const type = info.resource_type === "video" ? "video" : "image";
      setMediaList((prev) => {
        if (type === "video" && prev.some((m) => m.type === "video")) {
          toast.error("Hanya boleh mengunggah satu video per produk");
          return prev;
        }
        toast.success("File berhasil diunggah");
        return [...prev, { type, url }];
      });
      clearScrollLock();
    }
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const moveMedia = (from: number, to: number) => {
    if (to < 0 || to >= mediaList.length) return;
    setMediaList((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragEnd = () => setDraggedIndex(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null) return;
    moveMedia(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const addVariant = () => setVariants((prev) => [...prev, { ...emptyVariant }]);
  const removeVariant = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== idx));
    setVariantErrors({});
  };
  const updateVariant = (idx: number, field: keyof ProductVariant, value: string | number) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
    setVariantErrors((prev) => {
      const next = { ...prev };
      if (next[idx]) {
        const nextIdx = { ...next[idx] };
        delete nextIdx[field as keyof typeof nextIdx];
        if (Object.keys(nextIdx).length === 0) delete next[idx];
        else next[idx] = nextIdx;
      }
      return next;
    });
  };
  const handleVariantImageUpload = (idx: number, result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info !== "object") return;
    const info = result.info as { secure_url?: string; url?: string };
    const url = info.secure_url || info.url || "";
    if (url) {
      setVariants((prev) =>
        prev.map((v, i) => (i === idx ? { ...v, imageUrl: url } : v))
      );
      toast.success("Gambar variant berhasil diunggah");
      clearScrollLock();
    }
  };

  const onSubmit = async (data: FormData) => {
    if (hasVariants) {
      const errors: Record<number, { name?: string; price?: string; quantity?: string; weight?: string }> = {};
      variants.forEach((v, idx) => {
        const e: { name?: string; price?: string; quantity?: string; weight?: string } = {};
        if (!String(v.name ?? "").trim()) e.name = "Nama variant wajib diisi";
        if (Number(v.price) <= 0) e.price = "Harga harus lebih dari 0";
        if (Number(v.quantity) < 0) e.quantity = "Stok tidak boleh negatif";
        if (Number(v.weight) <= 0) e.weight = "Berat harus lebih dari 0";
        if (Object.keys(e).length) errors[idx] = e;
      });
      if (Object.keys(errors).length > 0) {
        setVariantErrors(errors);
        const firstIdx = Math.min(...Object.keys(errors).map(Number));
        setTimeout(() => {
          variantCardRefs.current[firstIdx]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
        return;
      }
      setVariantErrors({});
    }

    setIsSubmitting(true);
    try {
      const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, "-");
      const media = mediaList.map((m) => ({ type: m.type, url: m.url }));

      let price: number;
      let quantity: number;
      let weight: number;
      let discountedPrice: number | undefined;
      const variantsPayload = hasVariants
        ? variants
          .filter((v) => v.name.trim())
          .map((v) => ({
            name: v.name.trim(),
            price: Number(v.price) || 0,
            weight: Number(v.weight) || 0,
            quantity: Math.max(0, Math.floor(Number(v.quantity) || 0)),
            imageUrl: v.imageUrl?.trim() || undefined,
            discountType: v.discountType ?? "amount",
            discountValue: Number(v.discountValue ?? 0) || 0,
          }))
        : [];

      if (hasVariants && variantsPayload.length > 0) {
        const salePrices = variantsPayload.map((v) =>
          getVariantSalePrice({ ...v, discountType: v.discountType, discountValue: v.discountValue })
        );
        price = Math.min(...variantsPayload.map((v) => v.price));
        const minSale = Math.min(...salePrices);
        discountedPrice = minSale < price ? minSale : data.price;
        quantity = variantsPayload.reduce((s, v) => s + v.quantity, 0);
        weight = variantsPayload[0].weight;
      } else {
        const dv = (data.discountValue ?? 0) > 0
          ? data.discountType === "percent"
            ? data.price * (1 - (data.discountValue ?? 0) / 100)
            : Math.max(0, data.price - (data.discountValue ?? 0))
          : undefined;
        price = data.price;
        discountedPrice = dv && dv < data.price ? dv : data.price;
        quantity = data.quantity;
        weight = data.weight ?? 0;
      }

      const additionalInfo = MARKETPLACE_KEYS.filter((k) => (marketplaceLinks[k] || "").trim())
        .map((title) => ({ title, value: (marketplaceLinks[title] || "").trim() }));

      const payload = {
        name: data.name,
        description: data.description,
        slug,
        price,
        discountedPrice,
        quantity,
        weight,
        media,
        variants: variantsPayload,
        additionalInfo,
        collectionIds: data.collectionIds || [],
      };

      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(product ? "Produk berhasil diubah" : "Produk berhasil ditambahkan");
      router.push("/admin/products");
    } catch (error) {
      console.error("Admin product submit:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 w-full max-w-full overflow-x-hidden">
      <Card className="shadow-sm mb-6 min-w-0 overflow-hidden">
        <Space direction="vertical" size="middle" className="w-full min-w-0" style={{ maxWidth: "100%" }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama *</label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Nama produk" size="large" status={errors.name ? "error" : undefined} />}
                />
                {errors.name && <Typography.Text type="danger" className="text-xs mt-1">{errors.name.message}</Typography.Text>}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Slug</label>
                <Controller
                  name="slug"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder={"Masukkan slug custom disini (opsional)"} size="large" status={errors.slug ? "error" : undefined} />}
                />
              </div>
            </Col>
          </Row>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Deskripsi produk"
                />
              )}
            />
          </div>

          <div className="mb-4 min-w-0 max-w-full">
            <label className="block text-sm font-medium mb-2">Media Produk *</label>
            <Space direction="vertical" size="middle" className="w-full min-w-0" style={{ maxWidth: "100%" }}>
              {mediaList.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {mediaList.map((item, index) => (
                    <div
                      key={`${item.url}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className={`flex items-center gap-2 p-2 rounded-lg border bg-white cursor-grab active:cursor-grabbing transition-opacity ${draggedIndex === index ? "opacity-50" : ""}`}
                    >
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />
                      <AdminMediaPreview
                        url={item.url}
                        type={item.type}
                        thumbnailClassName="relative w-16 h-16 rounded overflow-hidden bg-slate-100 shrink-0"
                        imageSizes="64px"
                        unoptimized={item.url.startsWith("http")}
                      />
                      <span className="text-xs text-slate-500 shrink-0">{index + 1}</span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => removeMedia(index)}
                        className="shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-400 transition-colors min-w-0 max-w-full">
                <CldUploadButton
                  uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET!}
                  onSuccess={handleMediaUpload}
                  options={{
                    multiple: true,
                    maxFiles: 20,
                    resourceType: "auto",
                    cropping: false,
                  }}
                  className="flex flex-col items-center justify-center gap-2 w-full py-8 px-6 cursor-pointer"
                >
                  <Plus className="w-8 h-8 text-slate-400" />
                  <span className="font-medium text-slate-700">Upload Gambar atau Video</span>
                  <span className="text-xs text-slate-500">Seret file atau klik (multiple, gambar & video)</span>
                </CldUploadButton>
              </div>
            </Space>
          </div>

          <div className="mb-4 min-w-0 max-w-full">
            <label className="block text-sm font-medium mb-2">Link Marketplace (opsional)</label>
            <Row gutter={[16, 16]}>
              {MARKETPLACE_KEYS.map((key) => (
                <Col xs={24} sm={24} md={8} key={key}>
                  <label className="text-xs text-slate-500 capitalize block mb-1">{key}</label>
                  <Input
                    value={marketplaceLinks[key]}
                    onChange={(e) => setMarketplaceLinks((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`URL ${key}`}
                    size="large"
                  />
                </Col>
              ))}
            </Row>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium mb-2">Produk memiliki variant</label>
              <Switch
                checked={hasVariants}
                onChange={(checked) => {
                  setHasVariants(checked);
                  if (checked && variants.length === 0) {
                    setVariants([{ ...emptyVariant }]);
                  }
                  if (!checked) {
                    setVariants([{ ...emptyVariant }]);
                    setVariantErrors({});
                  }
                }}
              />
            </div>
            <Typography.Text type="secondary" className="text-xs">
              Aktifkan jika produk punya pilihan (warna, ukuran, dll) dengan harga/stok berbeda per variant
            </Typography.Text>
          </div>

          {hasVariants ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Daftar Variant *</label>
              <Space direction="vertical" size="middle" className="w-full" style={{ width: "100%" }}>
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    ref={(el) => {
                      variantCardRefs.current[idx] = el;
                    }}
                  >
                    <Card size="small" className="bg-slate-50">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-medium text-slate-600">Variant {idx + 1}</span>
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => removeVariant(idx)}
                          disabled={variants.length <= 1}
                        />
                      </div>
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={12}>
                          <label className="text-xs text-slate-500">Nama variant *</label>
                          <Input
                            value={v.name}
                            onChange={(e) => updateVariant(idx, "name", e.target.value)}
                            placeholder="Contoh: Merah - L"
                            className="mt-1"
                            status={variantErrors[idx]?.name ? "error" : undefined}
                          />
                          {variantErrors[idx]?.name && (
                            <Typography.Text type="danger" className="text-xs block mt-1">
                              {variantErrors[idx].name}
                            </Typography.Text>
                          )}
                        </Col>
                        <Col flex={'auto'}/>
                        <Col xs={24} sm={8} md={4}>
                          <label className="text-xs text-slate-500">Stok *</label>
                          <InputNumber
                            value={v.quantity}
                            onChange={(val) => updateVariant(idx, "quantity", val ?? 0)}
                            min={0}
                            className="w-full mt-1"
                            style={{ width: "100%" }}
                            status={variantErrors[idx]?.quantity ? "error" : undefined}
                          />
                          {variantErrors[idx]?.quantity && (
                            <Typography.Text type="danger" className="text-xs block mt-1">
                              {variantErrors[idx].quantity}
                            </Typography.Text>
                          )}
                        </Col>
                        <Col xs={24} sm={8} md={4}>
                          <label className="text-xs text-slate-500">Berat (kg) *</label>
                          <InputNumber
                            value={v.weight}
                            onChange={(val) => updateVariant(idx, "weight", val ?? 0)}
                            min={0}
                            step={0.01}
                            className="w-full mt-1"
                            style={{ width: "100%" }}
                            status={variantErrors[idx]?.weight ? "error" : undefined}
                          />
                          {variantErrors[idx]?.weight && (
                            <Typography.Text type="danger" className="text-xs block mt-1">
                              {variantErrors[idx].weight}
                            </Typography.Text>
                          )}
                        </Col>
                      </Row>
                      <Row gutter={[16, 8]} className="mt-2">
                        <Col xs={24} sm={12} md={10}>
                          <label className="text-xs text-slate-500">Harga (Rp) *</label>
                          <InputNumber
                            value={v.price}
                            onChange={(val) => updateVariant(idx, "price", val ?? 0)}
                            min={0}
                            className="w-full mt-1"
                            style={{ width: "100%" }}
                            status={variantErrors[idx]?.price ? "error" : undefined}
                          />
                          {variantErrors[idx]?.price && (
                            <Typography.Text type="danger" className="text-xs block mt-1">
                              {variantErrors[idx].price}
                            </Typography.Text>
                          )}
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                          <label className="text-xs text-slate-500">Diskon</label>
                          <div className="flex gap-0 rounded-lg overflow-hidden border border-[var(--ant-color-primary-border)] mt-1">
                            <InputNumber
                              min={0}
                              max={(v.discountType ?? "amount") === "percent" ? 100 : undefined}
                              value={(v.discountValue ?? 0) || undefined}
                              onChange={(val) => updateVariant(idx, "discountValue", val ?? 0)}
                              className="flex-1 border-0 rounded-none"
                              controls={false}
                              size="small"
                            />
                            <div className="flex border-l border-[var(--ant-color-primary-border)]">
                              <button
                                type="button"
                                onClick={() => updateVariant(idx, "discountType", "percent")}
                                className={`px-2 py-1 text-xs font-medium transition-colors ${(v.discountType ?? "amount") === "percent" ? "bg-[var(--ant-color-primary)] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                              >
                                %
                              </button>
                              <button
                                type="button"
                                onClick={() => updateVariant(idx, "discountType", "amount")}
                                className={`px-2 py-1 text-xs font-medium transition-colors ${(v.discountType ?? "amount") === "amount" ? "bg-[var(--ant-color-primary)] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                              >
                                Rp
                              </button>
                            </div>
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={10}>
                          <Space className="w-full" size="small" orientation="vertical">
                            <label className="text-xs text-slate-500 block">Harga Jual</label>
                            <Flex className="mt-1 w-full" vertical>
                              <InputNumber
                                value={getVariantSalePrice(v)}
                                readOnly
                                addonBefore="Rp"
                                disabled
                                className="flex-grow flex-shrink-0"
                                size="small"
                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              />
                            </Flex>
                          </Space>
                        </Col>
                      </Row>
                      <div className="mt-3">
                        <label className="text-xs text-slate-500 block mb-1">Gambar (opsional)</label>
                        <div className="flex items-center gap-2">
                          {v.imageUrl ? (
                            <div className="relative">
                              <AdminMediaPreview
                                url={v.imageUrl}
                                type="image"
                                thumbnailClassName="w-16 h-16 rounded overflow-hidden border"
                                imageSizes="64px"
                                unoptimized={v.imageUrl.startsWith("http")}
                              />
                              <Button
                                type="text"
                                danger
                                size="small"
                                className="absolute -top-1 -right-1"
                                onClick={() => updateVariant(idx, "imageUrl", "")}
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <CldUploadButton
                              uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET!}
                              onSuccess={(r) => handleVariantImageUpload(idx, r)}
                              options={{ resourceType: "image", cropping: false }}
                              className="border-2 border-dashed border-slate-200 rounded p-4 text-xs hover:border-blue-400"
                            >
                              Upload gambar
                            </CldUploadButton>
                          )}
                          <Typography.Text type="secondary" className="text-xs">
                            Kosongkan = pakai gambar utama
                          </Typography.Text>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
                <Button type="dashed" onClick={addVariant} icon={<Plus className="w-4 h-4" />} className="w-full">
                  Tambah variant
                </Button>
              </Space>
            </div>
          ) : null}

          {!hasVariants && (
            <>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Harga *</label>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <InputNumber {...field} min={0} addonBefore="Rp" className="w-full" style={{ width: "100%" }} size="large" status={errors.price ? "error" : undefined} />
                      )}
                    />
                    {errors.price && <Typography.Text type="danger" className="text-xs mt-1">{errors.price.message}</Typography.Text>}
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Diskon</label>
                    <div className="flex gap-0 rounded-lg overflow-hidden border border-[var(--ant-color-primary-border)]">
                      <Controller
                        name="discountValue"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            max={discountType === "percent" ? 100 : undefined}
                            className="flex-1 border-0 rounded-none"
                            controls={false}
                            size="large"
                          />
                        )}
                      />
                      <Controller
                        name="discountType"
                        control={control}
                        render={({ field }) => (
                          <div className="flex border-l border-[var(--ant-color-primary-border)]">
                            <button
                              type="button"
                              onClick={() => field.onChange("percent")}
                              className={`px-3 py-1 text-sm font-medium transition-colors ${field.value === "percent" ? "bg-[var(--ant-color-primary)] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange("amount")}
                              className={`px-3 py-1 text-sm font-medium transition-colors ${field.value === "amount" ? "bg-[var(--ant-color-primary)] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                            >
                              Rp
                            </button>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={6}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Harga Jual</label>
                    <InputNumber
                      value={salePrice}
                      readOnly
                      addonBefore="Rp"
                      disabled
                      className="w-full"
                      style={{ width: "100%" }}
                      size="large"
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    />
                  </div>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Stok *</label>
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field }) => <InputNumber {...field} min={0} className="w-full" style={{ width: "100%" }} size="large" status={errors.quantity ? "error" : undefined} />}
                    />
                    {errors.quantity && <Typography.Text type="danger" className="text-xs mt-1">{errors.quantity.message}</Typography.Text>}
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Berat (kg)</label>
                    <Controller
                      name="weight"
                      control={control}
                      render={({ field }) => (
                        <InputNumber {...field} min={0} step={0.01} className="w-full" style={{ width: "100%" }} size="large" />
                      )}
                    />
                  </div>
                </Col>
              </Row>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <Controller
              name="collectionIds"
              control={control}
              render={({ field }) => (
                <Select
                  mode="multiple"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pilih kategori"
                  className="w-full"
                  size="large"
                  options={collections.map((c) => ({ label: c.name, value: c.id }))}
                />
              )}
            />
          </div>
        </Space>
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
