import { ProductItemType } from "@/types/product-item";
import ProductItem from "./product-item";

function ListProductScroll({
  productItem,
}: {
  productItem: ProductItemType[];
}) {
  if (!productItem) return null;

  return (
    <div className="px-2 overflow-x-auto flex gap-3 scrollbar-hide pb-2">
      {productItem.map((product, i) => (
        <ProductItem
          className="w-40 min-w-[10rem] sm:w-44 sm:min-w-[11rem]"
          imageObj={product.imageObj}
          price={product.price}
          title={product.title}
          slug={product.slug}
          quantity={product.quantity}
          key={i}
          identifier="list-scroll"
          uploadedDate={product.uploadedDate}
        />
      ))}
    </div>
  );
}

export default ListProductScroll;
