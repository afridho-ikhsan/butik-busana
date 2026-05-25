"use client";

import Dropdown from "./dropdown";
import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { TbNotes } from "react-icons/tb";
import { HiOutlineCog } from "react-icons/hi";
import LogoutButton from "./logout-button";
import { useState } from "react";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import useCurrentMember from "@/hooks/useCurrentMember";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const modal = useOutsideClick(() => setIsOpen(false), false);
  const { member, isLoading } = useCurrentMember();

  function onToggle() {
    setIsOpen((val) => !val);
  }

  function onClose() {
    setIsOpen(false);
  }

  return (
    <Dropdown isOpen={isOpen} toggleFn={onToggle}>
      <Dropdown.Icon className="hidden lg:block">
        {isLoading ? (
          <Skeleton className="w-8 aspect-square bg-slate-500/50 rounded-full" />
        ) : (
          <Image
            src={
              member?.profile?.photo?.url ||
              "https://res.cloudinary.com/dmc0cvmf5/image/upload/v1721879584/empty-profile_d7fhjp.webp"
            }
            alt=""
            className="rounded-full border-2 border-slate-500 overflow-hidden"
            width={32}
            height={32}
          />
        )}
      </Dropdown.Icon>
      <Dropdown.OpenedModal
        className="hidden lg:flex flex-col divide-y-2 divide-slate-300 p-0"
        ref={modal}
      >
        <div className={`flex flex-col items-start gap-1 p-5 text-slate-700`}>
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-full bg-slate-300/50 rounded-lg" />
              <Skeleton className="h-8 w-full bg-slate-300/50 rounded-lg" />
            </>
          ) : (
            <>
              <p>{member?.loginEmail || "toserbanet.loading@example.com"}</p>
              <p>{member?.profile?.nickname || "undefined"}</p>
            </>
          )}
        </div>
        <Link
          href={`/user/${member?.profile?.slug || ""}`}
          className={`flex items-center gap-1 p-5 transition-colors hover:bg-slate-200 ${
            member && member.profile
              ? ""
              : "pointer-events-none cursor-not-allowed"
          }`}
          onClick={onClose}
        >
          <CgProfile className="text-xl" /> Profil
        </Link>
        <Link
          href={`/user/${member?.profile?.slug || ""}/transactions`}
          className={`flex items-center gap-1 p-5 transition-colors hover:bg-slate-200 ${
            member && member.profile
              ? ""
              : "pointer-events-none cursor-not-allowed"
          }`}
          onClick={onClose}
        >
          <TbNotes className="text-xl" /> Transaksi
        </Link>

        {(member?.role === "admin" || member?.role === "owner") && (
          <Link
            href="/admin"
            className="flex items-center gap-1 p-5 transition-colors hover:bg-slate-200"
            onClick={onClose}
          >
            <HiOutlineCog className="text-xl" /> Admin
          </Link>
        )}

        <LogoutButton onLogout={onClose} className="p-5" />
      </Dropdown.OpenedModal>
    </Dropdown>
  );
}

export default UserDropdown;
