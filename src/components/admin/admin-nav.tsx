"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineCog, HiOutlineShoppingBag } from "react-icons/hi";
import { MdCategory, MdAccountBalance, MdViewCarousel } from "react-icons/md";
import { TbNotes } from "react-icons/tb";
import { RiUserLine } from "react-icons/ri";
import { LuScrollText } from "react-icons/lu";

const items = [
  { href: "/admin", label: "Dashboard", icon: HiOutlineCog },
  { href: "/admin/products", label: "Produk", icon: HiOutlineShoppingBag },
  { href: "/admin/collections", label: "Kategori", icon: MdCategory },
  { href: "/admin/marquee", label: "Marquee", icon: LuScrollText },
  { href: "/admin/slider", label: "Slider", icon: MdViewCarousel },
  { href: "/admin/orders", label: "Pesanan", icon: TbNotes },
  { href: "/admin/users", label: "Pengguna", icon: RiUserLine },
  { href: "/admin/rekening-bank", label: "Rekening Bank", icon: MdAccountBalance },
];

export default function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2 p-3 rounded-lg transition-colors mb-1 ${
              isActive ? "bg-blue-100 text-blue-700" : "hover:bg-slate-200"
            }`}
          >
            <item.icon className="text-xl" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
