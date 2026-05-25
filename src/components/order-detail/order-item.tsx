"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { rupiahFormatter } from "@/utils/number-formatter";

function OrderItem({
  itemImage,
  itemName,
  price,
  quantity,
  catalogReference: { options },
  className,
}: {
  itemImage: string;
  itemName: string;
  quantity: number;
  price: string | number;
  catalogReference: {
    appId?: string;
    catalogItemId?: string;
    options?: { productLink?: string; variantName?: string };
  };
  className?: string;
}) {
  const priceStr = typeof price === "number" ? rupiahFormatter.format(price) : price;

  return (
    <Link
      href={options?.productLink || "#"}
      className={cn("flex gap-2 items-center", className)}
    >
      <div className="relative row-span-2 w-16 aspect-square rounded-lg overflow-hidden shrink-0">
        <Image
          src={itemImage || "/product.png"}
          alt=""
          fill
          sizes="33vw"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="flex flex-col gap-1">
        <p className="font-semibold">{itemName.split("(Varian: ")[0]}</p>
        <p className="text-slate-700">{`${quantity} x ${priceStr}`}</p>
        {options?.variantName && <p>{options.variantName}</p>}
      </div>
    </Link>
  );
}

export default OrderItem;
