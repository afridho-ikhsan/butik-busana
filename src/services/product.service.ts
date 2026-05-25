import apiClient from "@/lib/api/client";

export const productService = {
  getProducts: (params?: {
    limit?: number;
    collectionId?: string;
    sort?: string;
    min?: number;
    max?: number;
    name?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.collectionId) searchParams.set("collectionId", params.collectionId);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.min) searchParams.set("min", String(params.min));
    if (params?.max) searchParams.set("max", String(params.max));
    if (params?.name) searchParams.set("name", params.name.toLowerCase());
    return apiClient.get(`/products?${searchParams.toString()}`).then((r) => r.data);
  },
  getProductBySlug: (slug: string) =>
    apiClient.get(`/products/${encodeURIComponent(slug)}`).then((r) => r.data),
};
