import { cn } from "@/utils/cn";
import React from "react";

function SecondaryButton({
  children = "Action",
  className,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <button
      className={cn(
        "border-2 border-blue-500 px-5 py-3 flex justify-center items-center gap-3 rounded-full text-blue-500 transition-colors bg-slate-50 hover:bg-blue-500 hover:text-slate-50 h-max",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default SecondaryButton;
