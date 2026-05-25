"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; // Jika menggunakan Next.js, atau bisa menggunakan <img> di React biasa
import { useWindowDimensions } from "@/hooks/useWindowDimention";

const testimonials = [
  {
    id: 1,
    image: "/fotografer.webp", // Ganti dengan path gambar yang sesuai
    name: "@OpticalFan92",
    testimonial:
      "Saya membeli kacamata di sini dan kualitasnya luar biasa! Frame-nya sangat nyaman dan lensa tajam.",
  },
  {
    id: 2,
    image: "/pecinta_alam.webp", // Ganti dengan path gambar yang sesuai
    name: "@TimeLover_22",
    testimonial:
      "Jam tangan yang saya beli sangat stylish dan pas banget di tangan saya. Pengirimannya juga cepat!",
  },
  {
    id: 3,
    image: "/penulis_perjalanan.webp", // Ganti dengan path gambar yang sesuai
    name: "@LensExpert_07",
    testimonial:
      "Kacamata yang saya beli sangat fashionable, cocok banget untuk aktivitas sehari-hari. Highly recommended!",
  },
];

function CustomerTestimoni() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const [maxCard, setMaxCard] = useState(() => {
    if (width >= 640) {
      return 3;
    } else {
      return 1;
    }
  });
  const [totalDots, setTotalDots] = useState(
    Math.ceil(testimonials.length / maxCard)
  );

  // Fungsi untuk mengubah index setiap 3 detik, hanya jika diperlukan
  useEffect(() => {
    setTotalDots(Math.ceil(testimonials.length / maxCard)); // Pastikan totalDots selalu diperbarui
    setCurrentIndex(0); // Reset currentIndex saat lebar jendela berubah

    const interval = setInterval(() => {
      if (totalDots <= 1) return;

      setCurrentIndex((prevIndex) => {
        return prevIndex + 1 === totalDots ? 0 : prevIndex + 1;
      });
    }, 3000); // Ganti 3000 untuk mengatur interval dalam milidetik (3 detik)

    return () => clearInterval(interval);
  }, [maxCard, totalDots]); // Pastikan dependensi ter-update jika maxCard atau totalDots berubah

  useEffect(() => {
    if (width >= 640) {
      setMaxCard(3);
    } else {
      setMaxCard(1);
    }
  }, [width]);

  return (
    <div className="py-5 flex flex-col gap-6">
      <div className="px-3 flex items-center justify-center gap-2">
        <div className="h-1 rounded-full flex-grow bg-slate-400" />
        <h3 className="ml-2 font-bold text-lg sm:text-xl shrink-0">Testimoni Customer</h3>
        <div className="h-1 rounded-full flex-grow bg-slate-400" />
      </div>

      <div className="relative overflow-hidden w-[90vw] mx-auto flex justify-center items-center">
        <div
          className="flex justify-center sm:gap-3 transition-transform duration-700 w-full"
          style={{
            transform: `translateX(-${currentIndex * (100 / maxCard)}%)`,
          }}
        >
          {testimonials.map((testimonial) => (
            <div className="w-full sm:w-[33%] sm:max-w-[27rem] shrink-0 flex flex-col items-center bg-white shadow-lg rounded-lg p-4" key={testimonial.id}>
              <div className="mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
              <h4 className="font-semibold text-lg">{testimonial.name}</h4>
              <p className="text-center text-gray-600 mt-2 text-sm lg:text-base">
                {testimonial.testimonial}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Optional: Dots pagination (Jika diperlukan) */}
      {totalDots > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalDots }, (_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${
                currentIndex === index ? "bg-blue-500" : "bg-gray-300"
              } cursor-pointer`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerTestimoni;
