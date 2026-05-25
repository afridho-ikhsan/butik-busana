import apiClient from "@/lib/api/client";

export const cartService = {
  getCart: () => apiClient.get("/cart").then((r) => r.data),
  addItem: (data: {
    productId: string;
    variantId?: string;
    variantName?: string;
    quantity: number;
    productLink: string;
    product: { name?: string; price?: number; discountedPrice?: number; weight?: number; media?: { url?: string }[] };
  }) => apiClient.post("/cart", data).then((r) => r.data),
  removeItem: (itemId: string) =>
    apiClient.delete(`/cart?itemId=${encodeURIComponent(itemId)}`).then((r) => r.data),
  updateQuantity: (itemId: string, quantity: number) =>
    apiClient.patch("/cart", { itemId, quantity }).then((r) => r.data),
  deleteCart: () => apiClient.delete("/cart?all=true").then((r) => r.data),
};
