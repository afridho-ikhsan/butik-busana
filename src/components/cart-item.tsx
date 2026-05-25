import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { gramFormatter, rupiahFormatter } from "@/utils/number-formatter";
import { useUnifiedCart } from "@/hooks/useUnifiedCart";

interface CartItemType {
  _id?: string;
  productName?: string | { original?: string };
  quantity?: number;
  price?: number | { amount?: string };
  image?: string;
  physicalProperties?: { weight?: number };
  catalogReference?: { options?: { variantName?: string } };
}

function CartItem({ cartItem }: { cartItem: CartItemType }) {
  const { isLoading, updateQuantity, removeItem } = useUnifiedCart();

  if (!cartItem) return null;

  const productName = typeof cartItem.productName === "string"
    ? cartItem.productName
    : cartItem.productName?.original || "";
  const price = typeof cartItem.price === "number"
    ? cartItem.price
    : parseFloat((cartItem.price as { amount?: string })?.amount || "0");

  return (
    <div className="flex-1 flex gap-3 items-center relative bg-slate-200 rounded-lg px-3 py-2">
      <div className="relative w-[25%] max-w-32 aspect-square rounded-xl overflow-hidden shrink-0">
        {cartItem.image && (
          <Image
            fill
            src={cartItem.image}
            alt={productName}
          />
        )}
      </div>

      <div className="flex flex-col gap-1 max-w-[60%]">
        <p className="text-xs sm:text-sm line-clamp-2 font-semibold mb-1">
          {productName}
        </p>
        {cartItem.catalogReference?.options?.variantName && (
          <h4 className="font-medium text-xs sm:text-sm mb-0">
            Varian: {cartItem.catalogReference.options.variantName}
          </h4>
        )}

        <div className="flex justify-between items-center gap-2 w-max">
          <div
            className={`rounded-full p-2 w-3 h-3 border flex justify-center items-center ${
              isLoading
                ? "cursor-not-allowed text-slate-200"
                : "cursor-pointer border-slate-400"
            }`}
          >
            <FaMinus
              className={`shrink-0 text-xs sm:text-sm ${
                isLoading ? "text-slate-200" : "text-slate-400"
              }`}
              onClick={() => {
                if (cartItem.quantity === 1)
                  removeItem(cartItem._id!);
                else
                  updateQuantity(
                    cartItem._id!,
                    cartItem?.quantity ? cartItem.quantity - 1 : 0
                  );
              }}
            />
          </div>
          <p className="text-xs mb-0">{cartItem.quantity}</p>
          <div
            className={`rounded-full p-2 w-3 h-3 border flex justify-center items-center ${
              isLoading
                ? "cursor-not-allowed text-slate-200"
                : "cursor-pointer border-slate-400"
            }`}
          >
            <FaPlus
              className={`shrink-0 text-xs ${
                isLoading ? "text-slate-200" : "text-slate-400"
              }`}
              onClick={() =>
                updateQuantity(
                  cartItem._id!,
                  cartItem?.quantity ? cartItem.quantity + 1 : 0
                )
              }
            />
          </div>
        </div>

        <p className="text-xs md:text-sm">
          Berat:{" "}
          {gramFormatter.format(
            cartItem?.physicalProperties?.weight
              ? cartItem.physicalProperties.weight * 1000
              : 0
          )}
        </p>
        <p className="text-green-500 text-xs sm:text-sm font-medium">
          Sub Total{" "}
          {rupiahFormatter.format(
            price * (cartItem.quantity || 0)
          )}
        </p>
      </div>

      <MdDeleteForever
        className={`text-xl sm:text-3xl absolute top-3 md:top-1/2 md:-translate-y-1/2 right-1 ${
          isLoading
            ? "cursor-not-allowed text-slate-300"
            : "cursor-pointer text-slate-500"
        }`}
        onClick={() => removeItem(cartItem._id!)}
      />
    </div>
  );
}

export default CartItem;
