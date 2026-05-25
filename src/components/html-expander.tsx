"use client";

import { useMemo, useState } from "react";

function normalizeHtml(html: string): string {
  if (!html) return "";
  return html.replace(/&nbsp;/g, " ");
}

function htmlToPlainText(html: string): string {
  const normalized = normalizeHtml(html);
  const withoutLineBreakTags = normalized
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div)>/gi, " ");
  const withoutTags = withoutLineBreakTags.replace(/<[^>]+>/g, " ");
  return withoutTags.replace(/\s+/g, " ").trim();
}

function HTMLExpander({
  children,
  max,
  maxWords,
  className = "",
}: {
  children: string;
  max?: number;
  maxWords?: number;
  className?: string;
}) {
  const limit = maxWords ?? max ?? 40;
  const fullHtml = normalizeHtml(children || "");

  const plainText = useMemo(() => htmlToPlainText(children || ""), [children]);
  const words = plainText ? plainText.split(" ") : [];
  const needsExpand = words.length > limit;
  const summary = needsExpand
    ? words.slice(0, limit).join(" ") + "..."
    : plainText;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={className}>
      {isExpanded || !needsExpand ? (
        <div
          className="[&_p]:my-2 [&_strong]:font-semibold [&_p:first-child]:mt-0 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: fullHtml }}
        />
      ) : (
        <p className="leading-relaxed text-slate-700">{summary}</p>
      )}
      {needsExpand && (
        <button
          type="button"
          className="text-blue-500 border-none leading-3 py-2 rounded-md bg-transparent hover:bg-transparent hover:text-blue-600 px-0 mt-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Lihat lebih sedikit" : "Baca selengkapnya"}
        </button>
      )}
    </div>
  );
}

export default HTMLExpander;
