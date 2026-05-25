"use client";

import OrderItem from "./order-item";
import { rupiahFormatter } from "@/utils/number-formatter";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useState } from "react";

interface LineItem {
  _id?: string;
  productName?: string | { original?: string };
  price?: number | { formattedAmount?: string; amount?: string };
  quantity?: number;
  image?: string;
  catalogReference?: {
    appId?: string;
    catalogItemId?: string;
    options?: { productLink?: string; variantName?: string };
  };
}

interface OrderType {
  lineItems: LineItem[];
}

function OrderItemList({ order }: { order: OrderType }) {
  const [isToggleOpen, setIsToggleOpen] = useState(false);

  function handleToggle() {
    setIsToggleOpen((val) => !val);
  }

  const items = order.lineItems || [];
  if (items.length === 0) return null;

  const firstItem = items[0];
  const itemName = typeof firstItem.productName === "string"
    ? firstItem.productName
    : firstItem.productName?.original || "";
  const price = typeof firstItem.price === "number"
    ? firstItem.price
    : parseFloat((firstItem.price as { amount?: string })?.amount || "0");

  return (
    <>
      <hr className="w-full border-2" />
      <div
        key={firstItem._id || 0}
        className={`space-y-2 duration-500 delay-75 overflow-hidden ${isToggleOpen ? "h-max" : "max-h-[10rem]"}`}
      >
        <OrderItem
          key={firstItem._id || 0}
          itemImage={firstItem.image || "/product.png"}
          itemName={itemName}
          price={typeof firstItem.price === "number"
            ? rupiahFormatter.format(firstItem.price)
            : (firstItem.price as { formattedAmount?: string })?.formattedAmount || rupiahFormatter.format(price)}
          quantity={firstItem.quantity || 0}
          catalogReference={{
            appId: firstItem.catalogReference?.appId || "",
            catalogItemId: firstItem.catalogReference?.catalogItemId || "",
            options: firstItem.catalogReference?.options,
          }}
        />
        <hr className="w-full border-2" />
      </div>
      {isToggleOpen && items.length > 1 && items.slice(1).map((item, idx) => {
        const name = typeof item.productName === "string"
          ? item.productName
          : item.productName?.original || "";
        const p = typeof item.price === "number"
          ? item.price
          : parseFloat((item.price as { amount?: string })?.amount || "0");
        return (
          <OrderItem
            key={item._id || idx}
            itemImage={item.image || "/product.png"}
            itemName={name}
            price={typeof item.price === "number"
              ? rupiahFormatter.format(item.price)
              : (item.price as { formattedAmount?: string })?.formattedAmount || rupiahFormatter.format(p)}
            quantity={item.quantity || 0}
            catalogReference={{
              appId: item.catalogReference?.appId || "",
              catalogItemId: item.catalogReference?.catalogItemId || "",
              options: item.catalogReference?.options,
            }}
          />
        );
      })}
      {items.length > 1 && (
        <button
          className="bg-transparent p-2 text-blue-500 w-max mx-auto flex items-center gap-2 font-medium z-10"
          onClick={handleToggle}
        >
          {isToggleOpen ? (
            <>
              <span>Lihat Lebih Sedikit</span>
              <IoIosArrowUp className="text-xl" />
            </>
          ) : (
            <>
              <span>Lihat Semua Barang</span>
              <IoIosArrowDown className="text-xl" />
            </>
          )}
        </button>
      )}
    </>
  );
}

export default OrderItemList;
