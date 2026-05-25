"use client";

import { useState } from "react";
import { Input, Button } from "antd";
import Link from "next/link";
import { rupiahFormatter } from "@/utils/number-formatter";
import { formatDate } from "@/utils/date-formatter";
import { LuSearch } from "react-icons/lu";

interface OrderResult {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  total: number;
  recipientName: string | null;
  recipientPhone: string | null;
}

export default function CariPesananPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneSuffix, setPhoneSuffix] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OrderResult[]>([]);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const on = orderNumber.trim();
    const ps = phoneSuffix.replace(/\D/g, "").trim();
    if (!on && !ps) return;
    if (ps.length > 0 && ps.length < 4) return;

    setLoading(true);
    setSearched(true);
    setResults([]);
    try {
      const params = new URLSearchParams();
      if (on) params.set("orderNumber", on);
      if (ps) params.set("phoneSuffix", ps);
      const res = await fetch(`/api/orders/lookup?${params}`);
      const data = await res.json();
      if (res.ok) setResults(Array.isArray(data) ? data : []);
      else setResults([]);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6 min-h-[70.7vh]">
      <h1 className="text-xl font-bold">Cari Pesanan</h1>
      <p className="text-slate-600 text-sm">
        Masukkan nomor pesanan (contoh: ORD-xxx) atau minimal 4 digit ujung
        nomor telepon Anda.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Nomor pesanan (ORD-...)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          onPressEnter={handleSearch}
          size="large"
          allowClear
        />
        <Input
          placeholder="Ujung nomor telepon (min 4 digit)"
          value={phoneSuffix}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(-10);
            setPhoneSuffix(v);
          }}
          onPressEnter={handleSearch}
          size="large"
          maxLength={10}
          allowClear
        />
        <Button
          type="primary"
          size="large"
          icon={<LuSearch />}
          loading={loading}
          onClick={handleSearch}
          className="sm:w-auto"
        >
          Cari
        </Button>
      </div>

      {searched && (
        <div className="flex flex-col gap-3">
          {results.length === 0 ? (
            <div className="bg-slate-100 p-6 rounded-lg text-center">
              <p className="font-medium">Tidak ada pesanan ditemukan</p>
              <p className="text-sm text-slate-600 mt-1">
                Pastikan nomor pesanan atau nomor telepon sudah benar.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {results.map((order) => (
                <li
                  key={order.id}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <Link
                    href={`/order/${order.id}`}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="text-sm text-slate-600">
                        {formatDate(new Date(order.createdAt).getTime())} •{" "}
                        {rupiahFormatter.format(order.total)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-200 text-green-800"
                          : "bg-amber-200 text-amber-800"
                      }`}
                    >
                      {order.paymentStatus === "PAID" ? "Lunas" : "Belum Dibayar"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
