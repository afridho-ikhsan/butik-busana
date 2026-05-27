"use client";

import { CiSearch } from "react-icons/ci";
import { Dropdown } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useProductSearchSuggestions } from "@/hooks/useProducts";

export default function SearchProduct({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const { data: products = [], isFetching } = useProductSearchSuggestions(value);

  const goToSearch = (q: string) => {
    const trimmed = (q || "").trim();
    if (trimmed) {
      setOpen(false);
      const nextQuery = `name=${encodeURIComponent(trimmed)}`;
      if (pathname === "/products") {
        const params = new URLSearchParams(window.location.search);
        params.set("name", trimmed);
        const queryString = params.toString();
        window.history.replaceState(
          null,
          "",
          `/products${queryString ? `?${queryString}` : ""}`
        );
        window.dispatchEvent(new Event("butik-busana-products-search-update"));
        return;
      }
      router.push(`/products?${nextQuery}`);
    }
  };

  const dropdownContent = (
    <div className="bg-white rounded-lg shadow-lg py-1 min-w-[200px] max-h-60 overflow-auto border border-slate-200">
      {isFetching ? (
        <div className="px-3 py-2 text-slate-500 text-sm">Memuat...</div>
      ) : value.length < 2 ? (
        <div className="px-3 py-2 text-slate-400 text-sm">Ketik minimal 2 karakter</div>
      ) : products.length === 0 ? (
        <div className="px-3 py-2 text-slate-500 text-sm">Tidak ada hasil</div>
      ) : (
        products.map((p: { name: string }) => (
          <button
            key={p.name}
            type="button"
            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
            onClick={() => goToSearch(p.name)}
          >
            {p.name}
          </button>
        ))
      )}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        popupRender={() => dropdownContent}
        trigger={[]}
        placement="bottomLeft"
        getPopupContainer={() => containerRef.current ?? document.body}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToSearch(value);
          }}
          className="relative flex items-center rounded-full border-2 border-slate-400 bg-white w-full overflow-hidden"
        >
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(e.target.value.length >= 2);
            }}
            onFocus={() => value.length >= 2 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder="Cari Produk"
            className="flex-1 min-w-0 py-2 pl-5 pr-12 border-0 bg-transparent outline-none text-sm"
          />
          {value ? (
            <button
              type="button"
              onClick={() => setValue("")}
              className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500"
              aria-label="Clear"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          ) : null}
          <button
            type="submit"
            className="shrink-0 m-1.5 p-1.5 rounded-full bg-slate-950 flex items-center justify-center"
          >
            <CiSearch className="text-white text-xl" />
          </button>
        </form>
      </Dropdown>
    </div>
  );
}
