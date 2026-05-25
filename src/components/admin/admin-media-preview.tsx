"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "antd";
import { Eye } from "lucide-react";

interface AdminMediaPreviewProps {
  url: string;
  type: "image" | "video";
  thumbnailClassName?: string;
  imageSizes?: string;
  unoptimized?: boolean;
}

export function AdminMediaPreview({
  url,
  type,
  thumbnailClassName = "relative w-16 h-16 rounded overflow-hidden bg-slate-100 shrink-0",
  imageSizes = "64px",
  unoptimized = false,
}: AdminMediaPreviewProps) {
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <div
        className={`group cursor-pointer ${thumbnailClassName}`}
        onClick={handleClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {type === "image" ? (
          <Image
            src={url}
            alt=""
            fill
            className="object-cover"
            sizes={imageSizes}
            unoptimized={unoptimized || url.startsWith("http")}
          />
        ) : (
          <video src={url} className="w-full h-full object-cover" muted />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
          <Eye className="w-6 h-6 text-white" />
        </div>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={type === "video" ? 720 : 640}
        centered
        styles={{ body: { padding: 0 } }}
      >
        {type === "image" ? (
          <div className="relative w-full aspect-[4/3] bg-slate-100">
            <Image
              src={url}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 100vw, 640px"
              unoptimized={unoptimized || url.startsWith("http")}
            />
          </div>
        ) : (
          <video src={url} className="w-full rounded" controls autoPlay />
        )}
      </Modal>
    </>
  );
}
