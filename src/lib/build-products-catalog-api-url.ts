export function buildProductsCatalogApiUrl(
  searchParams: Record<string, string | undefined>
): string {
  const query = new URLSearchParams();
  query.set("limit", "9999");
  query.set("cat", searchParams.cat || "all-products");
  const sortDirection =
    searchParams.sort?.split(" ")[0] === "asc" ? "asc" : "desc";
  query.set("sort", sortDirection);
  if (searchParams.min) query.set("min", searchParams.min);
  if (searchParams.max) query.set("max", searchParams.max);
  if (searchParams.name) query.set("name", searchParams.name);
  return `/api/products?${query.toString()}`;
}
