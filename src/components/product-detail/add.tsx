"use client";

import { useUnifiedCart } from "@/hooks/useUnifiedCart";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

interface ProductData {
  id: string;
  name?: string;
  slug: string;
  price: number;
  discountedPrice?: number;
  weight?: number;
  media?: unknown[];
}

interface PropsType {
  productData: ProductData;
  variantId: string | null;
  variantName?: string | null;
  stockQuantity: number;
}

function Add({ stockQuantity, productData, variantId, variantName }: PropsType) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, isAddLoading } = useUnifiedCart();

  function handleQuantity(type: string) {
    if (type === "d" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
    if (type === "i" && quantity < stockQuantity) {
      setQuantity((prev) => prev + 1);
    }
  }

  function handleWhatsAppOrder(productData: { name?: string }) {
    const message = `Halo, apakah "${productData.name}" ada?`;
    const whatsappUrl = `https://wa.me/6285719129137?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  const handleAddToCart = () => {
    addItem({
      productId: productData.id,
      variantId: variantId || undefined,
      variantName: variantName || undefined,
      quantity,
      productLink: typeof window !== "undefined" ? `${window.location.origin}/products/${productData.slug}` : "",
      product: {
        name: variantName ? `${productData.name} (${variantName})` : productData.name,
        price: productData.price,
        discountedPrice: productData.discountedPrice,
        weight: productData.weight,
        media: (productData.media || []) as { url?: string }[],
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-medium">Kuantitas</h4>
      <div className="flex justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 border-2 border-slate-700 py-1 px-2 rounded-3xl flex items-center justify-between w-20">
            <button
              className={`text-xl ${quantity === 1 ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => handleQuantity("d")}
            >
              -
            </button>
            {quantity}
            <button
              className={`text-xl ${quantity === stockQuantity ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => handleQuantity("i")}
            >
              +
            </button>
          </div>
          <div className="text-xs md:text-base lg:text-sm text-slate-500 max-w-[20rem]">
            {stockQuantity < 1 && <p>Yahh, stok barang ini lagi <span className="text-red-500">habis</span>. Tambahkan barang ini ke wishlist, biar nanti kamu dapat notikasi jika barang sudah tersedia</p>}
            {stockQuantity > 1 && stockQuantity < 10 ? (
              <div>
                Stok tersisa <span className="text-orange-500">{stockQuantity}</span> lagi!
              </div>
            ) : (
              `Stok tersedia ${stockQuantity} barang`
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={handleAddToCart}
            disabled={isAddLoading || stockQuantity < 1}
            className="w-32 sm:w-fit text-xs sm:text-sm rounded-3xl ring-1 ring-blue-500 text-blue-500 py-2 px-3 hover:bg-blue-500 hover:text-white disabled:cursor-not-allowed disabled:bg-blue-200 disabled:text-white disabled:ring-0"
          >
            Tambahkan ke keranjang
          </button>
          <button
            onClick={() => handleWhatsAppOrder({ name: productData.name })}
            disabled={!productData}
            className="flex justify-center items-center text-xs sm:text-sm rounded-3xl ring-1 ring-green-800 text-green-800 py-2 px-3 hover:bg-green-800 hover:text-white disabled:cursor-not-allowed disabled:bg-green-200 disabled:text-white disabled:ring-0 w-fit gap-2 space-x-0"
          >
            <FaWhatsapp className="text-xl" />
            <div className="w-16 sm:w-fit">Order Via WhatsApp</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Add;
