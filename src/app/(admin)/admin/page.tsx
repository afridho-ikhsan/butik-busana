import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi";
import { MdCategory } from "react-icons/md";
import { TbNotes } from "react-icons/tb";
import { RiUserLine } from "react-icons/ri";

export default async function AdminDashboard() {
  const [productCount, collectionCount, orderCount, userCount] = await Promise.all([
    prisma.product.count(),
    prisma.collection.count(),
    prisma.order.count(),
    prisma.user.count(),
  ]);

  const stats = [
    { label: "Produk", count: productCount, href: "/admin/products", icon: HiOutlineShoppingBag },
    { label: "Kategori", count: collectionCount, href: "/admin/collections", icon: MdCategory },
    { label: "Pesanan", count: orderCount, href: "/admin/orders", icon: TbNotes },
    { label: "Pengguna", count: userCount, href: "/admin/users", icon: RiUserLine },
  ];

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="bg-slate-50 p-6 rounded-lg shadow border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-600">{stat.label}</span>
              <stat.icon className="text-2xl text-slate-400" />
            </div>
            <p className="text-3xl font-bold mt-2">{stat.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
