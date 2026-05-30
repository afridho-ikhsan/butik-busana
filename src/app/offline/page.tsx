import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">Anda sedang offline</h1>
      <p className="text-slate-600 max-w-md">
        Halaman ini belum tersimpan di perangkat. Buka katalog saat masih online dulu, lalu refresh bisa dipakai offline.
      </p>
      <Link
        href="/products"
        className="rounded-lg bg-slate-900 text-white px-5 py-2 text-sm"
      >
        Ke Daftar Produk
      </Link>
    </div>
  );
}
