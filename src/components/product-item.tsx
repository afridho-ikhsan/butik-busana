"use client";

import { ProductItemType } from "@/types/product-item";
import { cn } from "@/utils/cn";
import { rupiahFormatter } from "@/utils/number-formatter";
import Image from "next/image";
import Link from "next/link";
import { Card } from "antd";

function ProductItem({
  className,
  imageObj,
  price,
  title,
  slug,
  identifier,
  uploadedDate,
}: {
  className?: string;
} & ProductItemType) {
  const isNew =
    uploadedDate &&
    +new Date(uploadedDate) > Date.now() - 24 * 60 * 60 * 1000;
  const hasDiscount = price.normalPrice !== price.discountPrice;

  return (
    <Link href={`/products/${slug}`} className={cn("block h-full", className)}>
      <Card
        hoverable
        className="min-h-[290px] overflow-hidden rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        styles={
          {
            body: {
              padding: "12px 14px"
            }
          }
        }
        cover={
          <div className="relative aspect-square overflow-hidden bg-slate-50">
            {imageObj?.imageUrl && imageObj?.imageAlt ? (
              <Image
                src={imageObj.imageUrl}
                alt={imageObj.imageAlt}
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm">
                No image
              </div>
            )}
            {isNew && (
              <span className="absolute top-2 left-2 z-10 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
                NEW
              </span>
            )}
            {hasDiscount && price.normalPrice > 0 && (
              <span className="absolute top-2 right-2 z-10 rounded bg-red-700 px-2 py-0.5 text-[10px] font-medium text-white">
                -{Math.round(((price.normalPrice - price.discountPrice) / price.normalPrice) * 100)}%
              </span>
            )}
          </div>
        }
      >
        <p
          className={cn(
            "text-sm text-slate-700 mb-2",
            identifier === "list-scroll" ? "line-clamp-2" : "line-clamp-3"
          )}
        >
          {title}
        </p>
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold text-slate-900">
            {rupiahFormatter.format(price.discountPrice)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-slate-600 line-through">
              {rupiahFormatter.format(price.normalPrice)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default ProductItem;
