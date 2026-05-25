"use client";

import { useState } from "react";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.register({ email, password, nickname });
      toast.success("Pendaftaran berhasil. Silakan login.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || "Terjadi kesalahan saat pendaftaran");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[71vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-50 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center">Daftar Akun</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              required
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              required
              placeholder="nama@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
              required
              minLength={6}
              placeholder="Min. 6 karakter"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Memuat..." : "Daftar"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
