"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { productService } from "@/services/product.service";

export function useProducts(params?: {
  limit?: number;
  collectionId?: string;
  sort?: string;
  min?: number;
  max?: number;
  name?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
  });
}

const DEBOUNCE_MS = 300;

export function useProductSearchSuggestions(query: string) {
  const [debounced, setDebounced] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);
  return useQuery({
    queryKey: ["products", "suggestions", debounced],
    queryFn: () => productService.getProducts({ name: debounced, limit: 10 }),
    enabled: debounced.length >= 2,
  });
}

export function useProduct(slug: string | null) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productService.getProductBySlug(slug!),
    enabled: !!slug,
  });
}
