"use client";

import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { HiOutlineCog } from "react-icons/hi";
import { useEffect, useState } from "react";
import AdminNav from "@/components/admin/admin-nav";
import { useAdminSidebar } from "@/contexts/admin-sidebar-context";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { register } = useAdminSidebar();

  useEffect(() => {
    const unregister = register(() => setSidebarOpen(true));
    return unregister;
  }, [register]);

  useEffect(() => {
    const handler = () => setSidebarOpen(false);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 lg:top-[80px] h-screen lg:h-[calc(100vh-80px)] w-64 bg-slate-50 shadow-lg border-r border-slate-200 flex flex-col z-50 transition-transform duration-200 ease-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineCog className="text-xl" />
            Admin Panel
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded hover:bg-slate-200"
            aria-label="Tutup menu"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          <AdminNav onNavigate={() => setSidebarOpen(false)} />
        </nav>
        <div className="p-3 border-t border-slate-200">
          <Link
            href="/"
            className="flex items-center gap-2 p-3 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
            onClick={() => setSidebarOpen(false)}
          >
            <CgProfile />
            Kembali ke Toko
          </Link>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 sm:p-6 min-h-screen w-full lg:max-w-[calc(100vw-16rem)] overflow-x-auto">
        {children}
      </main>
    </div>
  );
}
