import { cn } from "@/utils/cn";
import React from "react";

function PrimaryButton({
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
        "bg-blue-500 px-5 py-3 flex justify-center items-center gap-3 rounded-full text-slate-50 transition-colors hover:bg-blue-700 h-max ",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default PrimaryButton;
