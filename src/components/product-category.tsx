"use client";

import Link from "next/link";
import Image from "next/image";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "./ui/skeleton";

function ProductCategory() {
  const { data: category, isLoading } = useCollections();

  if (!category || !Array.isArray(category)) return null;

  return (
    <div className="flex gap-4 lg:gap-8 py-5 overflow-x-auto w-[85%] lg:w-[80%] mx-auto scrollbar">
      {isLoading ? (
        <Skeleton className="w-48 h-72" />
      ) : (
        category
          .filter((cat: { numberOfProducts?: number }) => (cat.numberOfProducts || 0) >= 1)
          .map((cat: { id: string; name?: string; slug?: string; imageUrl?: string }) => (
            <Link
              className="relative aspect-square w-20 md:w-24 lg:w-36 overflow-hidden rounded-lg shrink-0 group"
              aria-label={`Kategori ${cat.name}`}
              href={`/products?cat=${cat.slug}`}
              key={cat.id}
            >
              <div className="relative w-full h-full group-hover:scale-100 scale-125 duration-500 ease-out">
                <Image
                  fill
                  src={cat.imageUrl || "/default.jpg"}
                  alt={cat.name || ""}
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 80px, (max-width: 1024px) 96px, 144px"
                />
              </div>
              <div className="bg-black/30 group-hover:bg-black/50 transition-all absolute top-0 left-0 right-0 bottom-0" />
              <p className="text-center text-xs lg:text-base bottom-1 left-1/2 -translate-x-1/2 absolute text-slate-50 z-10 group-hover:text-white group-hover:font-semibold transition-all">
                {cat.name}
              </p>
            </Link>
          ))
      )}
    </div>
  );
}

export default ProductCategory;
