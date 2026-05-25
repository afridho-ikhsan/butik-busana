"use client";

import { useRef, useEffect, useState } from "react";

interface MarqueeItem {
  id: string;
  text: string;
}

export default function Marquee({ items, durationSeconds = 10 }: { items: MarqueeItem[]; durationSeconds?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !items.length) return;

    const updateOffset = () => {
      const width = track.scrollWidth;
      setOffset(width / 2);
    };

    updateOffset();
    const ro = new ResizeObserver(updateOffset);
    ro.observe(track);

    return () => ro.disconnect();
  }, [items]);

  if (!items?.length) return null;

  const segment = (copy: MarqueeItem[], copyIdx: number) =>
    copy.map((item, i) => (
      <span key={`${copyIdx}-${item.id}-${i}`} className="marquee-segment inline-flex shrink-0 items-center">
        <span className="whitespace-nowrap">{item.text}</span>
        <span className="marquee-spacer shrink-0" style={{ width: "100vw", minWidth: "100vw" }} aria-hidden />
      </span>
    ));

  return (
    <div className="marquee mb-3 lg:mb-0 py-2 lg:py-3 text-xs md:text-base lg:text-lg font-semibold text-slate-50 bg-blue-500 overflow-hidden">
      <div
        ref={trackRef}
        className="marquee-track inline-flex w-max flex-nowrap items-center"
        style={
          offset > 0
            ? {
                animation: `marquee-px ${durationSeconds}s linear infinite`,
                ["--marquee-offset" as string]: `-${offset}px`,
              }
            : undefined
        }
      >
        {segment(items, 0)}
        {segment(items, 1)}
      </div>
    </div>
  );
}