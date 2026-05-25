"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Tulis deskripsi...",
  className = "",
  readOnly = false,
}: RichTextEditorProps) {
  const quillModules = useMemo(() => modules, []);

  return (
    <div className={`rich-text-editor [&_.ql-container]:min-h-[200px] [&_.ql-editor]:min-h-[200px] ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={quillModules}
        placeholder={placeholder}
        readOnly={readOnly}
        className="bg-white rounded"
      />
    </div>
  );
}
