"use client";

import Link from "next/link";
import { IoMdHelpCircle } from "react-icons/io";

function HelpButton() {
  return (
    <Link
      href={"https://wa.me/6285719129137?text="}
      target="_blank"
      onClick={(e) => e.stopPropagation()}
    >
      <IoMdHelpCircle className="text-2xl cursor-pointer" />
    </Link>
  );
}

export default HelpButton;
