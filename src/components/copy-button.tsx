'use client'

import { cn } from "@/utils/cn";
import { handleCopy } from "@/utils/handle-copy";
import { IconBaseProps } from "react-icons/lib";
import { MdOutlineContentCopy } from "react-icons/md";

function CopyButton({
  className,
  text,
  copyObject,
  size
}: {
  text: string | undefined | null;
  copyObject: string;
  className?: string;
  size?: IconBaseProps["size"];
}) {
  return (
    <button
      className={cn("flex justify-between items-center shrink-0", className)}
      onClick={() => {
        handleCopy(text, copyObject);
      }}
    >
      <MdOutlineContentCopy className="flex-shrink-0" size={size} />
    </button>
  );
}

export default CopyButton;
