"use client";

import { cn } from "@/utils/cn";
import { IoMdLogIn } from "react-icons/io";
import Link from "next/link";

function LoginButton({ className, onClick }: { className?: string, onClick?: () => void }) {
  return (
    <Link
      href="/login"
      onClick={onClick}
      className={cn(
        "bg-blue-500 px-5 py-3 flex justify-center items-center gap-3 rounded-full text-slate-50 transition-colors hover:bg-blue-700 h-max font-semibold text-sm lg:text-base",
        className,
        "bg-blue-500 text-slate-50 transition-all hover:bg-blue-400 gap-2 rounded-none lg:rounded-full"
      )}
    >
      <IoMdLogIn className="text-xl" />
      <span>Masuk</span>
    </Link>
  );
}

export default LoginButton;
