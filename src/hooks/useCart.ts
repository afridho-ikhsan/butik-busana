"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { cartService } from "@/services/cart.service";
import { toast } from "react-toastify";

export function useCart() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: () => cartService.getCart(),
    retry: false,
    enabled: isLoggedIn,
  });

  const cart = data || { lineItems: [], subtotal: { amount: "0" } };
  const counter = (cart.lineItems as object[]).length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const addItem = useMutation({
    mutationFn: cartService.addItem,
    onSuccess: () => {
      invalidate();
      toast.success("Produk berhasil ditambahkan ke keranjang.");
    },
  });

  const removeItem = useMutation({
    mutationFn: cartService.removeItem,
    onSuccess: invalidate,
  });

  const updateQuantity = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateQuantity(itemId, quantity),
    onSuccess: invalidate,
  });

  const deleteCart = useMutation({
    mutationFn: cartService.deleteCart,
    onSuccess: invalidate,
  });

  return {
    cart,
    counter,
    isLoading,
    getCart: refetch,
    addItem: addItem.mutateAsync,
    removeItem: (itemId: string) => removeItem.mutateAsync(itemId),
    updateQuantity: (itemId: string, quantity: number) =>
      updateQuantity.mutateAsync({ itemId, quantity }),
    deleteCart: deleteCart.mutateAsync,
    isAddLoading: addItem.isPending,
  };
}
