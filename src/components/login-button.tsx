"use client";

import { cn } from "@/utils/cn";
import { IoMdLogIn } from "react-icons/io";
import PrimaryButton from "./primary-button";
import Link from "next/link";

function LoginButton({ className, onClick }: { className?: string, onClick?: () => void }) {
  return (
    <Link href="/login" onClick={onClick}>
      <PrimaryButton
        className={cn(
          className,
          "bg-blue-500 text-slate-50 transition-all hover:bg-blue-400 gap-2 rounded-none lg:rounded-full"
        )}
      >
        <IoMdLogIn className="text-xl" />
        <span>Masuk</span>
      </PrimaryButton>
    </Link>
  );
}

export default LoginButton;
