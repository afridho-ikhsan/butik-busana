"use client";

import { LuSettings2 } from "react-icons/lu";
import Sheet from "./sheet";
import Link from "next/link";
import { useCollections } from "@/hooks/useCollections";
import { Skeleton } from "./ui/skeleton";
import { useCategorySheetStore } from "@/hooks/useCategorySheetStore";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function CategorySheet() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [currentCategory, setCurrentCategory] = useState("");

  useEffect(() => {
    setCurrentCategory(searchParams.get("cat") || "");
  }, [searchParams]);

  useEffect(() => {
    function syncCategoryFromLocation() {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      setCurrentCategory(params.get("cat") || "");
    }
    window.addEventListener("popstate", syncCategoryFromLocation);
    window.addEventListener(
      "toserbanet-products-search-update",
      syncCategoryFromLocation
    );
    return () => {
      window.removeEventListener("popstate", syncCategoryFromLocation);
      window.removeEventListener(
        "toserbanet-products-search-update",
        syncCategoryFromLocation
      );
    };
  }, []);

  const { data, isLoading } = useCollections();
  const { closeSheet, toggleCategorySheet, isOpen } = useCategorySheetStore();

  return (
    <Sheet
      button={<LuSettings2 className="text-3xl shrink-0" />}
      title="Kategori"
      description="Pilih kategori produk spesifik yang ingin anda cari."
      className="w-[300px] rounded-r-lg"
      open={isOpen}
      onOpenChange={toggleCategorySheet}
    >
      <div className="mt-3 flex flex-col gap-2 items-center py-3 pr-3 overflow-y-auto h-[90%] scrollbar">
        {isLoading
          ? Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                className="w-full h-8 bg-slate-300/50 shrink-0"
                key={i}
              />
            ))
            : (data || []).map((cat: { id: string; name?: string; slug?: string }) => {
                const slugPart = cat.slug || "";
                return pathname === "/products" ? (
                  <button
                    type="button"
                    className={`${
                      currentCategory === cat.slug ? "bg-slate-300" : "bg-slate-200"
                    } w-full text-base p-3 rounded-lg shrink-0 transition-all hover:bg-slate-300 text-left`}
                    key={cat.id}
                    onClick={() => {
                      window.history.replaceState(
                        null,
                        "",
                        `/products?cat=${encodeURIComponent(slugPart)}`
                      );
                      window.dispatchEvent(
                        new Event("toserbanet-products-search-update")
                      );
                      closeSheet();
                    }}
                  >
                    {cat.name}
                  </button>
                ) : (
                  <Link
                    className={`${
                      currentCategory === cat.slug ? "bg-slate-300" : "bg-slate-200"
                    } w-full text-base p-3 rounded-lg shrink-0 transition-all hover:bg-slate-300`}
                    href={`/products?cat=${slugPart}`}
                    key={cat.id}
                    onClick={closeSheet}
                  >
                    {cat.name}
                  </Link>
                );
              })}
      </div>
    </Sheet>
  );
}

export default CategorySheet;
