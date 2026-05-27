"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination } from "antd";
import ProductListGrid from "../product-list-grid";
import { ProductItemType } from "@/types/product-item";
import { CiSearch } from "react-icons/ci";
import NotFoundInfo from "../not-found-info";

const PRODUCT_PER_PAGE = 18;

interface ProductRecord {
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number | null;
  quantity: number;
  media: unknown;
  updatedAt: string | Date | null;
}

interface PropsType {
  limit?: number;
  products: ProductRecord[];
  controlledSearchParamsString?: string;
}

export default function ProductList({
  limit,
  products,
  controlledSearchParamsString,
}: PropsType) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParamsFromRouter = useSearchParams();
  const searchParamsString =
    controlledSearchParamsString !== undefined
      ? controlledSearchParamsString
      : (searchParamsFromRouter?.toString() ?? "");
  const urlSearchParams = new URLSearchParams(searchParamsString);
  const currentPage = urlSearchParams.get("page")
    ? parseInt(urlSearchParams.get("page")!, 10)
    : 1;
  const pageSize = limit ?? PRODUCT_PER_PAGE;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products
    .slice(startIndex, startIndex + pageSize)
    .filter((p) => p.quantity > 0);

  const productItems: ProductItemType[] = paginatedProducts.map((prod) => {
    const media = (prod.media as { type?: string; url?: string }[] | null) || [];
    const mainImg = media.find((m) => m.url) || media[0];
    return {
      title: prod.name,
      imageObj: {
        imageAlt: prod.name,
        imageUrl: mainImg?.url || "",
        width: 0,
        height: 0,
      },
      price: {
        discountPrice: prod.discountedPrice || 0,
        normalPrice: prod.price,
      },
      slug: prod.slug,
      quantity: prod.quantity,
      uploadedDate: typeof prod.updatedAt === "string" ? prod.updatedAt : prod.updatedAt?.toISOString?.() || "",
    };
  });

  const onChangePage = (page: number) => {
    const params = new URLSearchParams(searchParamsString);
    params.set("page", String(page));
    const queryString = params.toString();
    if (controlledSearchParamsString !== undefined) {
      window.history.replaceState(null, "", `/products?${queryString}`);
      window.dispatchEvent(new Event("toserbanet-products-search-update"));
      return;
    }
    router.push(`${pathname}?${queryString}`);
  };

  return (
    <div className="min-h-[30rem]" id="daftar-produk">
      {productItems.length > 0 && (
        <div className="ml-2 my-3 flex items-center gap-2">
          <CiSearch className="text-3xl font-semibold" />
          <h1 className="text-xl font-semibold">Hasil Pencarian</h1>
        </div>
      )}
      {productItems.length > 0 ? (
        <>
          <ProductListGrid productItems={productItems} />
          <div className="flex justify-center mt-10 mb-5">
            <Pagination
              current={currentPage}
              total={products.length}
              pageSize={pageSize}
              onChange={onChangePage}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <NotFoundInfo
          description="Coba kata kunci lain atau sesuaikan pengaturan filter"
          object="Produk"
        />
      )}
    </div>
  );
}
