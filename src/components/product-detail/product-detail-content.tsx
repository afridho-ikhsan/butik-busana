"use client";

import { useState } from "react";
import HTMLExpander from "@/components/html-expander";
import ProductImages from "./product-images";
import ProductOptions from "./product-options";
import MarketplaceList from "./marketplace-list";
import type { ProductVariant } from "./product-options";

type MediaItem = { type?: string; url?: string };
type MarketplaceLink = { title?: string; value?: string };

interface ProductDetailContentProps {
  productName: string;
  productDescription: string;
  mediaItems: MediaItem[];
  marketplaceLinks: MarketplaceLink[];
  productData: {
    id: string;
    name?: string;
    slug: string;
    price: number;
    discountedPrice?: number;
    quantity: number;
    weight?: number;
    media?: unknown[];
    variants?: ProductVariant[];
  };
}

export default function ProductDetailContent({
  productName,
  productDescription,
  mediaItems,
  marketplaceLinks,
  productData,
}: ProductDetailContentProps) {
  const hasVariants = productData.variants && productData.variants.length > 0;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const variantImg = hasVariants && productData.variants![selectedIndex]?.imageUrl;
  const effectiveMedia: MediaItem[] = variantImg
    ? [{ type: "image", url: variantImg }, ...mediaItems.filter((m) => m.url !== variantImg)]
    : mediaItems;

  return (
    <>
      <div className="w-full lg:w-1/2 lg:sticky top-28 h-max">
        <ProductImages productName={productName} mediaItems={effectiveMedia} />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col gap-2 lg:gap-3 text-sm md:text-base">
        <h1 className="font-semibold md:text-lg">{productName}</h1>
        <HTMLExpander max={80}>{productDescription}</HTMLExpander>
        <div className="h-[2px] bg-gray-100" />
        <ProductOptions
          product={productData}
          onVariantSelect={(_v, idx) => setSelectedIndex(idx)}
        />
        {marketplaceLinks.length > 0 && (
          <>
            <div className="h-[2px] bg-gray-200 rounded-full" />
            <div className="flex flex-col gap-3">
              <h3 className="text-sm md:text-base font-semibold">Belanja Via Marketplace:</h3>
              <MarketplaceList marketplaceLinks={marketplaceLinks} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
