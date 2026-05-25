"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getGuestCart,
  addToGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
  clearGuestCart,
  GUEST_CART_UPDATED,
  type GuestCartLineItem,
} from "@/lib/guest-cart-storage";

export function useGuestCart() {
  const [cart, setCart] = useState(getGuestCart);

  const refresh = useCallback(() => {
    setCart(getGuestCart());
  }, []);

  useEffect(() => {
    const handler = () => setCart(getGuestCart());
    window.addEventListener("storage", handler);
    window.addEventListener(GUEST_CART_UPDATED, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(GUEST_CART_UPDATED, handler);
    };
  }, []);

  const addItem = useCallback(
    (data: {
      productId: string;
      variantId?: string;
      variantName?: string;
      quantity: number;
      product: { name?: string; price?: number; discountedPrice?: number; weight?: number; media?: { url?: string }[] };
    }) => {
      const item: Omit<GuestCartLineItem, "_id"> = {
        productId: data.productId,
        variantId: data.variantId,
        variantName: data.variantName,
        quantity: data.quantity,
        price: data.product?.discountedPrice ?? data.product?.price ?? 0,
        productName: data.product?.name ?? "",
        image: (data.product?.media?.[0] as { url?: string })?.url ?? "",
        physicalProperties: { weight: data.product?.weight ?? 0 },
        catalogReference: {
          appId: "toserbanet",
          catalogItemId: data.productId,
          options: { variantId: data.variantId, variantName: data.variantName },
        },
      };
      setCart(addToGuestCart(item));
      toast.success("Produk berhasil ditambahkan ke keranjang.");
    },
    []
  );

  const removeItem = useCallback((itemId: string) => {
    setCart(removeFromGuestCart(itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setCart(updateGuestCartQuantity(itemId, quantity));
  }, []);

  const deleteCart = useCallback(() => {
    clearGuestCart();
    setCart(getGuestCart());
  }, []);

  return {
    cart,
    counter: cart.lineItems.length,
    isLoading: false,
    getCart: refresh,
    addItem,
    removeItem,
    updateQuantity,
    deleteCart,
    isAddLoading: false,
  };
}
