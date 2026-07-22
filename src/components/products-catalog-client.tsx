"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductList from "@/components/product-list/product-list";
import ProductListSkeletons from "@/components/product-list/product-list-skeletons";
import { buildProductsCatalogApiUrl } from "@/lib/build-products-catalog-api-url";

const CATALOG_SNAPSHOT_STORAGE_PREFIX = "butik-busana-catalog:v1:";

type SearchRecord = Record<string, string | undefined>;

function parseLocationSearch(): SearchRecord {
  const output: SearchRecord = {};
  if (typeof window === "undefined") return output;
  const params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    output[key] = value;
  });
  return output;
}

function readSnapshotFromStorage(catalogApiUrl: string): unknown[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      CATALOG_SNAPSHOT_STORAGE_PREFIX + catalogApiUrl
    );
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSnapshotToStorage(catalogApiUrl: string, products: unknown[]) {
  try {
    window.localStorage.setItem(
      CATALOG_SNAPSHOT_STORAGE_PREFIX + catalogApiUrl,
      JSON.stringify(products)
    );
  } catch {
    return;
  }
}

function controlledQueryFromRecord(record: SearchRecord): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  return params.toString();
}

export function ProductsCatalogClient({
  initialSearchParams,
}: {
  initialSearchParams: SearchRecord;
}) {
  const [liveSearchParams, setLiveSearchParams] =
    useState<SearchRecord>(initialSearchParams);

  useEffect(() => {
    function syncFromLocation() {
      setLiveSearchParams(parseLocationSearch());
    }

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(
      "butik-busana-products-search-update",
      syncFromLocation
    );
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(
        "butik-busana-products-search-update",
        syncFromLocation
      );
    };
  }, []);

  const catalogApiUrl = useMemo(
    () => buildProductsCatalogApiUrl(liveSearchParams),
    [liveSearchParams]
  );

  const controlledSearchParamsString = useMemo(
    () => controlledQueryFromRecord(liveSearchParams),
    [liveSearchParams]
  );

  const [listState, setListState] = useState<
    | { status: "loading" }
    | {
      status: "ready";
      items: Array<{
        name: string;
        slug: string;
        price: number;
        discountedPrice?: number | null;
        quantity: number;
        media: unknown;
        updatedAt: string | Date | null;
      }>;
    }
    | { status: "empty" }
  >({ status: "loading" });

  const loadCatalog = useCallback(async () => {
    setListState({ status: "loading" });

    const applyItems = (raw: unknown): boolean => {
      if (!Array.isArray(raw) || raw.length === 0) return false;
      setListState({
        status: "ready",
        items: raw as Array<{
          name: string;
          slug: string;
          price: number;
          discountedPrice?: number | null;
          quantity: number;
          media: unknown;
          updatedAt: string | Date | null;
        }>,
      });
      return true;
    };

    try {
      const response = await fetch(catalogApiUrl, {
        credentials: "same-origin",
      });
      if (response.ok) {
        const data: unknown = await response.json();
        if (Array.isArray(data)) {
          writeSnapshotToStorage(catalogApiUrl, data);
          if (data.length === 0) {
            setListState({ status: "empty" });
            return;
          }
          applyItems(data);
          return;
        }
      }
    } catch {
      /* empty */
    }

    const cachedSnapshot = readSnapshotFromStorage(catalogApiUrl);
    if (cachedSnapshot && applyItems(cachedSnapshot)) return;
    setListState({ status: "empty" });
  }, [catalogApiUrl]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  if (listState.status === "loading") return <ProductListSkeletons />;

  if (listState.status === "empty") {
    return (
      <div className="min-h-[30rem] py-12 text-center text-slate-600">
        Belum ada katalog tersimpan untuk tampilan ini.
      </div>
    );
  }

  return (
    <ProductList
      products={listState.items}
      controlledSearchParamsString={controlledSearchParamsString}
    />
  );
}
