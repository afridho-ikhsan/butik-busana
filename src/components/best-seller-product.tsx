import { getProducts } from "@/lib/data/products";
import ListProductScroll from "./list-product-scroll";
import { ProductItemType } from "@/types/product-item";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { LineChartOutlined } from "@ant-design/icons";

async function BestSellerProduct() {
  const products = await getProducts({ limit: 10 });

  const productItem: ProductItemType[] = products.map((prod) => {
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
      uploadedDate: prod.createdAt?.toISOString() || "",
    };
  });

  return (
    <div className="py-5 flex flex-col gap-2">
      <div className="flex items-center">
        <div className="bg-blue-600 flex gap-1 items-center justify-center rounded-r-full p-2 pr-4 text-white w-max shrink-0 grow-0 text-xs md:text-sm">
          <LineChartOutlined className="text-2xl" />
          Produk Terlaris
        </div>
        <hr className="flex-1 h-0.5 bg-slate-200" />
      </div>

      <Suspense
        fallback={
          <div className="px-2 overflow-x-auto flex gap-2 scrollbar-hide">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                className="bg-slate-50 rounded-lg h-max shrink-0 bg-slate-300/50"
                key={i}
              />
            ))}
          </div>
        }
      >
        <ListProductScroll productItem={productItem} />
      </Suspense>
    </div>
  );
}

export default BestSellerProduct;
