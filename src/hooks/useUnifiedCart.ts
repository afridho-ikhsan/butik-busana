"use client";

import { useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";
import { useGuestCart } from "@/hooks/useGuestCart";

export function useUnifiedCart() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const apiCart = useCart();
  const guestCart = useGuestCart();

  if (isLoggedIn) {
    return apiCart;
  }
  return guestCart;
}