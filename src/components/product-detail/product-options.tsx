"use client";

import { useState } from "react";
import Add from "./add";
import { rupiahFormatter } from "@/utils/number-formatter";

export type ProductVariant = {
  name: string;
  price: number;
  weight: number;
  quantity: number;
  imageUrl?: string;
  discountType?: "percent" | "amount";
  discountValue?: number;
};

function getVariantSalePrice(v: ProductVariant): number {
  const base = Number(v.price) || 0;
  const type = v.discountType ?? "amount";
  const val = Number(v.discountValue ?? 0) || 0;
  if (val <= 0) return base;
  return type === "percent" ? base * (1 - val / 100) : Math.max(0, base - val);
}

interface ProductData {
  id: string;
  name?: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  weight?: number;
  media?: unknown[];
  variants?: ProductVariant[];
}

function ProductOptions({
  product,
  onVariantSelect,
}: {
  product: ProductData;
  onVariantSelect?: (variant: ProductVariant | null, index: number) => void;
}) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const selectedVariant = hasVariants && product.variants![selectedIndex]
    ? product.variants![selectedIndex]
    : null;

  const displayPrice = selectedVariant
    ? getVariantSalePrice(selectedVariant)
    : product.price;
  const displayBasePrice = selectedVariant ? selectedVariant.price : product.price;
  const displayDiscountedPrice = selectedVariant
    ? (getVariantSalePrice(selectedVariant) < displayBasePrice ? getVariantSalePrice(selectedVariant) : undefined)
    : product.discountedPrice;
  const hasDiscount = displayDiscountedPrice != null && displayDiscountedPrice < displayBasePrice;

  const stockQuantity = selectedVariant ? selectedVariant.quantity : product.quantity;
  const variantId = hasVariants ? String(selectedIndex) : null;
  const variantName = selectedVariant?.name ?? null;

  const productForAdd = {
    ...product,
    price: displayPrice,
    discountedPrice: displayDiscountedPrice,
    weight: selectedVariant ? selectedVariant.weight : product.weight,
    media: selectedVariant?.imageUrl
      ? [{ type: "image" as const, url: selectedVariant.imageUrl }]
      : product.media,
  };

  const handleSelectVariant = (idx: number) => {
    setSelectedIndex(idx);
    onVariantSelect?.(product.variants![idx] ?? null, idx);
  };

  return (
    <>
      {hasVariants && (
        <div className="mb-3">
          <h4 className="font-medium mb-2">Pilih Varian</h4>
          <div className="flex flex-wrap gap-2">
            {product.variants!.map((v, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectVariant(idx)}
                disabled={v.quantity < 1}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedIndex === idx
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : v.quantity < 1
                      ? "border-slate-200 text-slate-400 cursor-not-allowed"
                      : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                {v.name}
                {v.quantity < 1 && " (habis)"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-lg md:text-xl">
        {hasDiscount ? (
          <>
            <h3 className="text-base text-gray-500 line-through">
              {rupiahFormatter.format(displayBasePrice)}
            </h3>
            <h2 className="font-medium text-xl">
              {rupiahFormatter.format(displayDiscountedPrice ?? displayPrice)}
            </h2>
          </>
        ) : (
          <h2 className="font-medium text-xl">
            {rupiahFormatter.format(displayPrice)}
          </h2>
        )}
      </div>

      <div className="h-[2px] bg-gray-100" />
      <Add
        stockQuantity={stockQuantity}
        productData={productForAdd}
        variantId={variantId}
        variantName={variantName}
      />
    </>
  );
}

export default ProductOptions;
