import Filter from "@/components/filter";
import { ProductsCatalogClient } from "@/components/products-catalog-client";
import { CatalogOfflineBar } from "@/components/products-catalog-pwa";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Daftar Produk",
};

async function ListPage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 relative py-3">
      <CatalogOfflineBar />
      <div className="hidden bg-pink-50 px-4 sm:flex justify-between h-64 mb-12">
        <div className="w-2/3 flex flex-col items-center justify-center gap-8">
          <h1 className="text-3xl text-center font-semibold leading-[48px] text-gray-700">
            Dapatkan produk menarik dengan harga yang lebih terjangkau
          </h1>
          <Link
            href="#daftar-produk"
            className="rounded-3xl bg-slate-900 text-white w-max py-2 px-5 text-sm"
          >
            Cek Sekarang
          </Link>
        </div>
        <div className="relative w-1/3">
          <Image src="/woman.png" alt="" fill className="object-contain" />
        </div>
      </div>

      <Filter />

      <ProductsCatalogClient initialSearchParams={searchParams} />
    </div>
  );
}

export default ListPage;
