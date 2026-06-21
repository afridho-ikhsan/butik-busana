"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { BiPhoneCall } from "react-icons/bi";
import { LuGlasses, LuSearch } from "react-icons/lu";
import { RiHome6Line } from "react-icons/ri";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";
import LoginButton from "./login-button";
import useCurrentMember from "@/hooks/useCurrentMember";
import Image from "next/image";
import { CiSettings } from "react-icons/ci";
import { TbNotes } from "react-icons/tb";
import { HiOutlineCog } from "react-icons/hi";

function HamburgerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { member, isLoggedIn } = useCurrentMember();

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleToggle() {
    setIsOpen((val) => !val);
  }

  const userSlug = member?.profile?.slug || member?._id;

  return (
    <>
      <button
        className={`transition-all space-y-1 w-6 aspect-square relative lg:hidden`}
        onClick={handleToggle}
        aria-label="Buka menu navigasi"
      >
        <div
          className={`transition-all h-1 w-full rounded-full bg-slate-700 ${
            isOpen
              ? "absolute -left-0 bottom-1/2 translate-y-1/2 -rotate-45"
              : ""
          }`}
        />
        <div
          className={`transition-all h-1 rounded-full bg-slate-700 ${
            isOpen ? "w-0" : "w-full"
          }`}
        />
        <div
          className={`transition-all h-1 w-full rounded-full bg-slate-700 ${
            isOpen
              ? "absolute -right-0 bottom-1/2 translate-y-1/2 rotate-45"
              : ""
          }`}
        />
      </button>
      {mounted && createPortal(
        <>
          <div
            className={`delay-100 fixed left-0 top-0 right-0 bottom-0 z-20 bg-slate-700/30 cursor-pointer lg:hidden ${
              isOpen ? "" : "hidden w-max"
            }`}
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`duration-500 ease-out delay-100 fixed bg-slate-50 w-52 h-screen lg:hidden ${
              isOpen ? "translate-x-0" : "translate-x-96"
            } right-0 top-0 z-30 rounded-l-lg py-16 space-y-3`}
          >
            <button
              type="button"
              className="absolute top-3 left-3 text-3xl cursor-pointer text-slate-800 p-1 rounded-full hover:bg-slate-200"
              onClick={() => setIsOpen(false)}
              aria-label="Tutup menu navigasi"
            >
              <IoClose />
            </button>

            {isLoggedIn ? (
              <>
                <div className="flex justify-between gap-3 px-2">
                  <div className="flex gap-3 items-center">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={
                          member?.profile?.photo?.url ||
                          "https://res.cloudinary.com/dmc0cvmf5/image/upload/v1721879584/empty-profile_d7fhjp.webp"
                        }
                        alt="profile"
                        className="rounded-full"
                        fill
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold line-clamp-1">
                        {member?.profile?.nickname}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {member?.loginEmail}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/user/${userSlug}`}
                  className={`p-3 w-full flex justify-center items-center gap-1 transition-all hover:bg-slate-300 bg-slate-100 ${
                    !userSlug ? "hidden" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <CiSettings className="text-2xl" />
                  Profil
                </Link>
                <Link
                  href={`/user/${userSlug}/transactions`}
                  className={`p-3 w-full flex justify-center items-center gap-1 transition-all hover:bg-slate-300 bg-slate-100 ${
                    !userSlug ? "hidden" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <TbNotes className="text-lg" /> Transaksi
                </Link>
                {(member?.role === "admin" || member?.role === "owner") && (
                  <Link
                    href="/admin"
                    className="p-3 w-full flex justify-center items-center gap-1 transition-all hover:bg-slate-300 bg-slate-100"
                    onClick={() => setIsOpen(false)}
                  >
                    <HiOutlineCog className="text-lg" /> Admin
                  </Link>
                )}
                <LogoutButton className="p-3 w-full flex justify-center items-center gap-2" />
              </>
            ) : (
              <LoginButton className="p-3 w-full flex items-center justify-center gap-2" onClick={() => setIsOpen(false)} />
            )}

            <hr className="border-2 w-[95%] mx-auto" />

            <ul className="flex flex-col gap-2 text-slate-700 px-2.5">
              <li>
                <Link
                  className={`w-full p-5 ${
                    pathname === "/" ? "bg-slate-200" : "bg-slate-100"
                  } transition-all hover:bg-slate-200 flex gap-2 items-center`}
                  href="/"
                  onClick={() => setIsOpen(false)}
                >
                  <RiHome6Line /> Home
                </Link>
              </li>
              <li>
                <Link
                  className={`w-full p-5 ${
                    pathname === "/products" ? "bg-slate-200" : "bg-slate-100"
                  } transition-all hover:bg-slate-200 flex gap-2 items-center`}
                  href="/products"
                  onClick={() => setIsOpen(false)}
                >
                  <LuGlasses /> Product
                </Link>
              </li>
              <li>
                <Link
                  className={`w-full p-5 ${
                    pathname === "/cari-pesanan" ? "bg-slate-200" : "bg-slate-100"
                  } transition-all hover:bg-slate-200 flex gap-2 items-center`}
                  href="/cari-pesanan"
                  onClick={() => setIsOpen(false)}
                >
                  <LuSearch /> Cari Pesanan
                </Link>
              </li>
              <li>
                <Link
                  className={`w-full p-5 ${
                    pathname === "/kontak" ? "bg-slate-200" : "bg-slate-100"
                  } transition-all hover:bg-slate-200 flex gap-2 items-center`}
                  href="/kontak"
                  onClick={() => setIsOpen(false)}
                >
                  <BiPhoneCall /> Kontak
                </Link>
              </li>
            </ul>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

export default HamburgerButton;
