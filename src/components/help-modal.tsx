"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

function HelpModal() {
  const params = useParams();

  if (!params?.orderId) return null;

  return (
    <div className="sticky lg:hidden bottom-0 p-3 shadow-sm z-30 bg-slate-50 w-[100vw]">
      <Link
        href={"https://wa.me/6285719129137?text="} target="_blank"
        className="w-full p-2 text-lg text-slate-500 border-2 border-slate-400 rounded-lg font-semibold inline-block text-center"
      >
        Bantuan
      </Link>
    </div>
  );
}

export default HelpModal;
