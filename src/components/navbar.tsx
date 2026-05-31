"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiPhoneCall } from "react-icons/bi";
import { LuGlasses, LuMenu, LuSearch } from "react-icons/lu";
import { RiHome6Line } from "react-icons/ri";
import CategorySheet from "./category-sheet";
import SearchProduct from "./search-product";
import HamburgerButton from "./hamburger-button";
import { Skeleton } from "./ui/skeleton";
import { Suspense } from "react";
import LoginElements from "./login-elements";
import PushNotificationPrompt from "./push-notification-prompt";
import { useAdminSidebar } from "@/contexts/admin-sidebar-context";

function Navbar() {
  const pathname = usePathname();
  const { openSidebar } = useAdminSidebar();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  return (
    <nav className="min-h-20 py-5 px-5 md:px-10 min-[1240px]:px-20 bg-slate-50/50 flex flex-col gap-3 sticky top-0 w-full z-20 shadow">
      <div className="flex-shrink-0 basis-full flex justify-between gap-3">
        <Link
          href={"/"}
          className="flex items-center gap-3 uppercase sm:text-xl"
        >
          <Image
            src="/logo-butik.png"
            alt="Butik Busana"
            width={36}
            height={36}
            className="rounded-full border-2 border-slate-300"
          />
          <h1 className="!mb-0">Butik Busana</h1>
        </Link>

        <div className="justify-between gap-3 min-[1240px]:gap-4 xl:gap-5 hidden min-[1240px]:flex">
          <Link
            href={"/"}
            className="flex items-center gap-1 xl:gap-3 w-max text-base xl:text-base"
          >
            <RiHome6Line className="text-lg" />
            <span>Home</span>
          </Link>
          <Link
            href={"/products"}
            className="flex items-center gap-1 xl:gap-3 w-max text-base xl:text-base"
          >
            <LuGlasses className="text-lg" />
            <span>Produk</span>
          </Link>
          <Link
            href={"/cari-pesanan"}
            className="flex items-center gap-1 xl:gap-3 w-max text-base xl:text-base"
          >
            <LuSearch className="text-lg" />
            <span>Cari Pesanan</span>
          </Link>
          <Link
            href={"/kontak"}
            className="flex items-center gap-1 xl:gap-3 w-max text-base xl:text-base"
          >
            <BiPhoneCall className="text-lg" />
            <span>Kontak Kami</span>
          </Link>
        </div>

        <div className="flex gap-3 justify-between items-center">
          <PushNotificationPrompt />
          {isAdmin ? (
            <button
              type="button"
              onClick={openSidebar}
              className="min-[1240px]:hidden p-2 rounded-lg bg-slate-50 border border-slate-200 shadow"
              aria-label="Buka menu admin"
            >
              <LuMenu className="text-xl" />
            </button>
          ) : (
            <>
              <HamburgerButton />
              <SearchProduct className="relative hidden min-[1240px]:block" />
              <Suspense
                fallback={
                  <Skeleton className="bg-slate-300 w-8 aspect-square rounded-full" />
                }
              >
                <CategorySheet />
              </Suspense>
            </>
          )}

          <LoginElements />
        </div>
      </div>

      {!isAdmin && (
        <SearchProduct className="relative block min-[1240px]:hidden w-full place-self-end opacity-50 focus:opacity-100 focus-within::opacity-100 focus-visible:opacity-100 hover:opacity-100 active:opacity-100" />
      )}
    </nav>
  );
}

export default Navbar;
