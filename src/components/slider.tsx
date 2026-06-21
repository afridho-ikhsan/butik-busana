"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef, MouseEvent, TouchEvent } from "react";
import banner1 from "../../public/banner1.webp";
import banner2 from "../../public/banner2.webp";
import banner3 from "../../public/banner3.webp";
import banner4 from "../../public/banner4.webp";
import { useWindowDimensions } from "@/hooks/useWindowDimention";

const FALLBACK_SLIDES: { id: string; imageUrl: string; linkUrl: string }[] = [
  { id: "1", imageUrl: banner1.src, linkUrl: "https://www.butik-busana.com/products/tag-heuer-aquaracer-calibre-7-gmt-way201f-pepsi-mens" },
  { id: "2", imageUrl: banner2.src, linkUrl: "https://www.butik-busana.com/products/oakley-badman-006020-03-polarized-fire-lenses-outdoor-sports-glasses" },
  { id: "3", imageUrl: banner3.src, linkUrl: "https://www.butik-busana.com/products/kacamata-original-rayban-caravan-rb3136-gold-frame-black-lens" },
  { id: "4", imageUrl: banner4.src, linkUrl: "https://www.butik-busana.com/products/kacamata-original-rayban-rb4195-scuderia-ferrari-black-doff" },
];

interface SliderSlide {
  id: string;
  imageUrl: string;
  linkUrl?: string | null;
}

const DEFAULT_DURATION = 5;

function Slider({ slides = [], durationSeconds = DEFAULT_DURATION }: { slides?: SliderSlide[]; durationSeconds?: number }) {
  const items = slides.length > 0 ? slides : FALLBACK_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const { width } = useWindowDimensions();
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<null | NodeJS.Timeout>(null);
  const isExternalUrl = (url: string) => url.startsWith("http") || url.startsWith("//");
  const intervalMs = Math.max(1000, (durationSeconds || DEFAULT_DURATION) * 1000);

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, intervalMs);
  };

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    startInterval();
    return () => stopInterval();
  }, [items.length, intervalMs]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
    stopInterval();
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (offsetX > 100) {
      setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    } else if (offsetX < -100) {
      setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }
    setOffsetX(0);
    startInterval();
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    stopInterval();
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (offsetX > 50) {
      setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    } else if (offsetX < -50) {
      setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }
    setOffsetX(0);
    startInterval();
  };

  if (!items.length) return null;

  return (
    <div
      className="w-full max-w-[90vw] md:max-w-[80vw] rounded-lg mx-auto overflow-hidden relative bg-slate-300/50"
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-all ease-in-out duration-1000"
        style={{
          transform: `translateX(-${current * (width < 768 ? 90 : 80)}vw)`,
        }}
      >
        {items.map((slide) => {
          const linkUrl = slide.linkUrl || "#";
          const content = (
            <div
              className="w-[90vw] md:w-[80vw] min-w-[90vw] md:min-w-[80vw] flex justify-center items-center shrink-0"
              key={slide.id}
            >
              <div
                className="w-full relative lg:rounded-lg aspect-[16/9] min-h-[200px] md:min-h-[280px]"
              >
                <Image
                  src={slide.imageUrl}
                  alt={`Banner Promo ${slide.id}`}
                  fill
                  draggable={false}
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 80vw"
                  priority={items.indexOf(slide) === 0}
                />
              </div>
            </div>
          );

          return linkUrl && linkUrl !== "#" ? (
            <Link
              href={linkUrl}
              key={slide.id}
              className="block w-full"
              draggable={false}
              aria-label={`Banner Promo ${slide.id}`}
            >
              {content}
            </Link>
          ) : (
            <div key={slide.id} className="w-full block">
              {content}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 absolute m-auto left-1/2 -translate-x-1/2 bottom-3 lg:bottom-8 z-10">
        {items.map((slide, i) => (
          <button
            type="button"
            className={`w-3 aspect-square rounded-full ring-1 ring-gray-600 cursor-pointer flex items-center justify-center z-10 ${current === i ? "scale-150" : ""
              } relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
            key={slide.id}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            aria-current={current === i ? "true" : "false"}
          >
            {current === i && (
              <span className="w-[6px] aspect-square bg-gray-600 rounded-full block" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Slider;
