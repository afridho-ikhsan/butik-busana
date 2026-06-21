import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: 'Tentang Kami',
};


const Halamanabout = () => {
  return (
    <div className="bg-gray-100 text-gray-800 min-h-[65vh] flex justify-center items-center">
      <main className="container mx-auto px-7 md:px-5 py-12 text-center w-full flex flex-col justify-center items-center max-w-[700px] h-full">
        <h1 className="text-2xl font-bold">Tentang Butik Busana</h1>
        <hr className="bg-black border-black my-4 border w-[70%] mx-auto" />
        <p className="text-gray-600 mb-4">Butik Busana adalah situs belanja online yang menyediakan aneka pakaian dan busana fashion berkualitas dengan desain modis dan kekinian.</p>
        <p className="text-gray-600 mb-4">Komitmen kami adalah memberikan pengalaman belanja online yang menyenangkan, mudah, dan terpercaya untuk memuaskan pelanggan dengan harga terjangkau dan penawaran spesial setiap harinya, serta beragam keuntungan seperti kemudahan pengembalian produk hingga 7 hari setelah barang diterima, layanan bayar di tempat.</p>
      </main>
    </div>
  );
};

export default Halamanabout;
