import { getProducts } from "@/lib/data/products";
import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { ProductItemType } from "@/types/product-item";
import ProductListGrid from "./product-list-grid";
import { ImportOutlined } from "@ant-design/icons";

async function NewReleaseProduct() {
  const products = await getProducts({
    limit: 18,
    sort: "desc",
  });

  const productItems: ProductItemType[] = products.map((prod: any) => {
    const media = (prod.media as { type?: string; url?: string; width?: number; height?: number }[] | null) || [];
    const mainImg = media.find((m) => m.type === "image" || m.url) || media[0];
    return {
      title: prod.name,
      imageObj: {
        imageAlt: prod.name,
        imageUrl: mainImg?.url || "",
        width: mainImg?.width || 0,
        height: mainImg?.height || 0,
      },
      price: {
        discountPrice: prod.discountedPrice || 0,
        normalPrice: prod.price,
      },
      slug: prod.slug,
      quantity: prod.quantity,
      uploadedDate: prod.updatedAt?.toISOString() || "",
    };
  });

  return (
    <div className="pb-3 flex flex-col gap-3">
      <div className="flex items-center">
        <div className="bg-blue-600 flex gap-1 items-center justify-center rounded-r-full p-2 pr-4 text-white w-max shrink-0 grow-0 text-xs md:text-sm">
          <ImportOutlined className="text-xl" />
          Produk Terbaru
        </div>
        <hr className="flex-1 h-0.5 bg-slate-200" />
      </div>

      <Suspense
        fallback={
          <div className="grid max-[400px]:grid-cols-1 max-lg:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 place-items-center gap-x-2 md:gap-x-5 gap-y-5 container mx-auto px-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                className="bg-slate-50 rounded-lg h-max shrink-0 bg-slate-300/50"
                key={i}
              />
            ))}
          </div>
        }
      >
        <ProductListGrid productItems={productItems} />
      </Suspense>

      <Link
        href="/products"
        className="border-2 text-slate-700 border-blue-500 rounded-full px-5 py-2 w-max flex items-center gap-2 text-md mx-auto mt-2 lg:mt-5 transition-all hover:bg-blue-500 hover:text-slate-50"
      >
        Produk Lainnya ↓
      </Link>
    </div>
  );
}

export default NewReleaseProduct;
