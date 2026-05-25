import apiClient from "@/lib/api/client";

export const collectionService = {
  getCollections: () => apiClient.get("/collections").then((r) => r.data),
  getCollectionBySlug: (slug: string) =>
    apiClient.get(`/collections/${encodeURIComponent(slug)}`).then((r) => r.data),
};
