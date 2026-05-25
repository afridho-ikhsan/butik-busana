"use client";

import Image from "next/image";
import { IoIosArrowForward, IoIosArrowBack, IoMdClose } from "react-icons/io";
import { useState, useEffect, MouseEvent, TouchEvent, useRef } from "react";
import { createPortal } from "react-dom";
import { FaPlay } from "react-icons/fa";

interface MediaItem {
  type?: string;
  url?: string;
  width?: number;
  height?: number;
}

function getVideoThumbnailUrl(url: string): string {
  if (!url?.includes("cloudinary.com")) return url;
  return url.replace("/video/upload/", "/video/upload/so_0,w_200,h_200,c_fill,f_jpg/");
}

function ProductImages({
  mediaItems,
  productName,
}: {
  mediaItems: MediaItem[];
  productName: string;
}) {
  const sortedItems = [...(mediaItems?.filter((item) => item.url) || [])].sort(
    (a, b) => (a.type === "video" ? -1 : b.type === "video" ? 1 : 0)
  );

  const [index, setIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [mediaOpenIndex, setMediaOpenIndex] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = sortedItems[index];

  useEffect(() => {
    const item = sortedItems[index];
    if (item?.width && item?.height) {
      setAspectRatio(item.width / item.height);
    } else {
      setAspectRatio(16 / 9);
    }
  }, [index, sortedItems]);

  useEffect(() => {
    if (mediaOpenIndex === null && videoRef.current) {
      videoRef.current.pause();
    }
  }, [mediaOpenIndex]);

  useEffect(() => {
    setPlayingIndex(null);
  }, [index]);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - startX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (offsetX > 100) {
      setIndex((prev) => (prev === 0 ? sortedItems.length - 1 : prev - 1));
    } else if (offsetX < -100) {
      setIndex((prev) => (prev === sortedItems.length - 1 ? 0 : prev + 1));
    }
    setOffsetX(0);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setOffsetX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (offsetX > 50) {
      setIndex((prev) => (prev === 0 ? sortedItems.length - 1 : prev - 1));
    } else if (offsetX < -50) {
      setIndex((prev) => (prev === sortedItems.length - 1 ? 0 : prev + 1));
    }
    setOffsetX(0);
  };

  if (!sortedItems.length) return null;

  return (
    <div>
      <div
        className="relative w-full max-w-[400px] cursor-pointer mx-auto flex justify-center items-center"
        onClick={() => setMediaOpenIndex(index)}
      >
        <div
          className="shadow-lg overflow-hidden w-full h-fit bg-slate-200 rounded-lg"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-full flex h-96 transition-all"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {sortedItems.map((mediaObj, i) => (
              <div className="relative w-full h-full shrink-0 bg-slate-900" key={i}>
                {mediaObj.type === "video" ? (
                  <>
                    <video
                      src={mediaObj.url}
                      className="w-full h-full object-contain"
                      controls={playingIndex === i}
                      playsInline
                      preload="metadata"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (playingIndex === i) return;
                        setPlayingIndex(i);
                        const vid = e.currentTarget;
                        vid.play().catch(() => {});
                      }}
                      onEnded={() => setPlayingIndex(null)}
                      onPause={() => setPlayingIndex(null)}
                    />
                    {playingIndex !== i && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayingIndex(i);
                          const vid = e.currentTarget.parentElement?.querySelector("video");
                          vid?.play().catch(() => {});
                        }}
                      >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                          <FaPlay className="w-8 h-8 text-slate-800 ml-2"/>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Image
                    src={mediaObj.url || "/product.png"}
                    alt={`Gambar dari ${productName}`}
                    fill
                    sizes="30vw"
                    className="object-contain rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 mt-1 lg:mt-3 overflow-auto w-full sm:w-[80%] mx-auto scrollbar">
        {sortedItems.map((mediaObj, i) => (
          <div
            className="w-1/5 aspect-square relative gap-4 mt-3 cursor-pointer shrink-0 rounded-md overflow-hidden bg-slate-200"
            key={i}
            onClick={() => setIndex(i)}
          >
            {mediaObj.type === "video" ? (
              <>
                <Image
                  src={getVideoThumbnailUrl(mediaObj.url || "")}
                  alt={`Video ${productName}`}
                  fill
                  sizes="15vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <IoIosArrowForward className="w-5 h-5 text-slate-800 rotate-90 ml-0.5" style={{ transform: "rotate(90deg)" }} />
                  </div>
                </div>
              </>
            ) : (
              <Image
                src={mediaObj.url || "/product.png"}
                alt={`Gambar dari ${productName}`}
                fill
                sizes="15vw"
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {typeof window !== "undefined" &&
        mediaOpenIndex !== null &&
        createPortal(
          <div className="fixed top-0 right-0 bottom-0 left-0 z-30">
            <div
              className="w-full h-full bg-slate-900/50 cursor-pointer"
              onClick={() => setMediaOpenIndex(null)}
            />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center z-20">
              <div
                className="relative w-[100vw] sm:w-[80vw] md:w-[35rem] cursor-default bg-slate-900 min-h-96 flex justify-center items-center rounded-lg overflow-hidden"
                style={{ aspectRatio: `${aspectRatio}` }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="absolute right-4 top-3 z-30 rounded-full p-1 bg-slate-800/80 hover:bg-slate-700"
                  onClick={() => setMediaOpenIndex(null)}
                >
                  <IoMdClose className="text-white text-2xl" />
                </button>
                {sortedItems[mediaOpenIndex]?.type === "video" ? (
                  <video
                    ref={videoRef}
                    src={sortedItems[mediaOpenIndex]?.url}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={sortedItems[mediaOpenIndex]?.url || "/product.png"}
                    alt="Main Product Image"
                    fill
                    sizes="50vw"
                    className="object-contain rounded-md"
                  />
                )}
              </div>
            </div>
            <button
              className="fixed left-0 rounded-r-lg bg-slate-900/50 hover:bg-slate-900/80 py-10 top-1/2 -translate-y-1/2 transition-all z-20"
              onClick={(e) => {
                e.stopPropagation();
                setMediaOpenIndex(mediaOpenIndex === 0 ? sortedItems.length - 1 : mediaOpenIndex - 1);
              }}
            >
              <IoIosArrowBack className="text-3xl md:text-5xl text-slate-50" />
            </button>
            <button
              className="fixed right-0 rounded-l-lg bg-slate-900/50 hover:bg-slate-900/80 py-10 top-1/2 -translate-y-1/2 transition-all z-20"
              onClick={(e) => {
                e.stopPropagation();
                setMediaOpenIndex(mediaOpenIndex + 1 === sortedItems.length ? 0 : mediaOpenIndex + 1);
              }}
            >
              <IoIosArrowForward className="text-3xl md:text-5xl text-slate-50" />
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}

export default ProductImages;
