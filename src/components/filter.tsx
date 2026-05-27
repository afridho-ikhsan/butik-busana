"use client";

import { IoIosArrowDown } from "react-icons/io";
import { useCategorySheetStore } from "@/hooks/useCategorySheetStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Filter() {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { toggleCategorySheet } = useCategorySheetStore();

  function handleChange(
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) {
    const { name, value } = e.target;

    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    const queryString = params.toString();
    if (pathname === "/products") {
      window.history.replaceState(
        null,
        "",
        `${pathname}${queryString ? `?${queryString}` : ""}`
      );
      window.dispatchEvent(new Event("butik-busana-products-search-update"));
      return;
    }
    replace(`${pathname}?${queryString}`);
  }

  return (
    <div className="flex flex-col md:flex-row items-center md:justify-between gap-3">
      <div className="flex justify-center md:justify-start gap-1 sm:gap-3 flex-wrap">
        <button
          className="py-2 px-4 rounded-2xl text-xs font-medium bg-slate-200 shrink-0 flex gap-2 items-center transition-colors hover:bg-slate-300 text-slate-700"
          onClick={toggleCategorySheet}
        >
          Kategori <IoIosArrowDown className="text-xl" />
        </button>

        <input
          type="text"
          name="min"
          placeholder="Min Harga"
          className="text-sm placeholder:text-xs rounded-2xl pl-2 w-24 h-8 ring-1 ring-gray-400 shrink-0"
          onChange={handleChange}
        />

        <input
          type="text"
          name="max"
          placeholder="Maks Harga"
          className="text-sm placeholder:text-xs rounded-2xl pl-2 w-24 h-8 ring-1 ring-gray-400 shrink-0"
          onChange={handleChange}
        />
      </div>
      <div className="">
        <select
          name="sort"
          id=""
          className="py-2 px-4 rounded-2xl text-xs font-medium bg-slate-200 transition-colors hover:bg-slate-300 text-slate-700 cursor-pointer"
          onChange={handleChange}
        >
          <option value="">Pengurutan</option>
          <option value="asc price">Harga (Rendah ke tinggi)</option>
          <option value="desc price">Harga (Tinggi ke rendah)</option>
          <option value="desc lastUpdated">Terbaru</option>
          <option value="asc lastUpdated">Terlama</option>
        </select>
      </div>
    </div>
  );
}

export default Filter;
