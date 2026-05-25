import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data/products";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "18", 10);
    const collectionIdFromRequest = searchParams.get("collectionId") || undefined;
    const categorySlugFromRequest = searchParams.get("cat");
    const collectionSlugForQuery = collectionIdFromRequest
      ? undefined
      : !categorySlugFromRequest || categorySlugFromRequest === "all-products"
        ? undefined
        : categorySlugFromRequest;
    const rawSort = searchParams.get("sort") || "desc";
    const sort =
      rawSort === "asc" || rawSort.split(" ")[0] === "asc" ? "asc" : "desc";
    const min = searchParams.get("min")
      ? parseFloat(searchParams.get("min") as string)
      : 0;
    const max = searchParams.get("max")
      ? parseFloat(searchParams.get("max") as string)
      : 999999999;
    const name = searchParams.get("name") || undefined;

    let products = await getProducts({
      limit,
      collectionId: collectionIdFromRequest,
      collectionSlug: collectionSlugForQuery,
      sort,
      min,
      max,
      search: name,
    });

    if (name) {
      products = products.filter((item) =>
        name
          .toLowerCase()
          .split(" ")
          .some((queryWord) => item.name.toLowerCase().includes(queryWord))
      );
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
