import { ProductItemType } from "@/types/product-item";
import ProductItem from "./product-item";

function ProductListGrid({ productItems }: { productItems: ProductItemType[] }) {
  if (!productItems) return null;

  return (
    <div className="grid max-[315px]:grid-cols-1 min-[316px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 container mx-auto px-2">
      {productItems.map((product, i) => (
        <ProductItem
          imageObj={product.imageObj}
          price={{
            discountPrice: product.price.discountPrice,
            normalPrice: product.price.normalPrice
          }}
          title={product.title}
          slug={product.slug}
          quantity={product.quantity}
          uploadedDate={product.uploadedDate}
          key={i}
          className="w-full"
        />
      ))}
    </div>
  );
}

export default ProductListGrid;
