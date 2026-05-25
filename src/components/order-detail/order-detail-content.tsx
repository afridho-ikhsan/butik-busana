"use client";

import DateLabel from "@/components/date-label";
import CopyButton from "@/components/copy-button";
import OrderItemList from "./order-item-list";
import { rupiahFormatter } from "@/utils/number-formatter";
import { metodePembayaranMap } from "@/constants/general";
import { ReactNode } from "react";

export interface OrderDetailOrder {
  orderNumber: string;
  createdAt: Date;
  lineItems: { productName?: string; price?: number; quantity?: number; image?: string }[];
  address: string;
  layananKurir: string | null;
  metodePembayaran: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  recipientName?: string | null;
  recipientPhone?: string | null;
  user?: { nickname?: string | null; email?: string | null };
}

interface OrderForDisplay {
  lineItems: { productName?: string; price?: number; quantity?: number; image?: string }[];
}

interface OrderDetailContentProps {
  variant: "customer" | "admin";
  order: OrderDetailOrder;
  orderForDisplay?: OrderForDisplay;
  footer?: ReactNode;
  className?: string;
  cardClassName?: string;
}

const defaultCardClass = "bg-slate-50";

export function OrderDetailContent({
  variant,
  order,
  orderForDisplay,
  footer,
  className = "",
  cardClassName = defaultCardClass,
}: OrderDetailContentProps) {
  const detailGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "1rem",
  };
  const shippingGridStyle = {
    gridTemplateColumns: "repeat(4, 1fr)",
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {variant === "admin" && (
        <div className={`${cardClassName} p-4 rounded-lg border border-slate-200`}>
          <h3 className="font-semibold mb-2">Pembeli</h3>
          <p>{order.recipientName || order.user?.nickname}</p>
          {order.recipientPhone && <p className="text-slate-600">{order.recipientPhone}</p>}
          {order.user?.email && <p className="text-slate-600">{order.user.email}</p>}
        </div>
      )}

      <div className={`${cardClassName} p-3 flex flex-col gap-2`}>
        {
          variant === "admin" && (
            <>
              <h1 className="text-base font-semibold">Detail Pesanan</h1>
              <hr className="w-full border-2" />
            </>
          )
        }
        <div className="gap-y-2 place-content-between" style={detailGridStyle}>
          <p>Nomor Order</p>
          <div className="flex gap-2 items-center justify-end">
            <span className="line-clamp-1 text-xl font-semibold">
              #{order.orderNumber}
            </span>
            <CopyButton copyObject="Nomor Order" text={order.orderNumber} size="1.2rem" />
          </div>
          <p>Tanggal Pembelian</p>
          <DateLabel date={order.createdAt} className="text-end" />
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${cardClassName} shadow p-3`}>
        <h3 className="text-base font-semibold">Detail Produk</h3>
        {orderForDisplay ? (
          <OrderItemList order={orderForDisplay} />
        ) : (
          <>
            <hr className="w-full border-2" />
            <ul className="space-y-2">
              {order.lineItems.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>{rupiahFormatter.format((item.price || 0) * (item.quantity || 0))}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={`flex flex-col gap-2 ${cardClassName} shadow p-3`}>
        <h3 className="text-base font-semibold">Info Pengiriman</h3>
        <div
          className="grid place-items-start gap-y-2"
          style={shippingGridStyle}
        >
          <p className="col-span-1">Kurir</p>
          <p className="col-span-3">{order.layananKurir || "-"}</p>
          <div className="flex gap-2 items-center col-span-1">
            <span className="line-clamp-1">Alamat</span>
            <CopyButton copyObject="Alamat" text={order.address} />
          </div>
          <div className="flex flex-col gap-1 col-span-3">
            <p>{order.address}</p>
          </div>
        </div>
      </div>

      <div className={`flex flex-col gap-2 ${cardClassName} shadow p-3`}>
        <h3 className="text-base font-semibold">Rincian Pembayaran</h3>
        <div className="grid grid-cols-2 gap-y-2">
          <p>Metode Pembayaran</p>
          <p className="text-end">
            {metodePembayaranMap.get(order.metodePembayaran || null)}
          </p>
          <hr className="col-span-2" />
          <p>Subtotal Harga Barang</p>
          <p className="text-end">{rupiahFormatter.format(order.subtotal)}</p>
          <p>Total Ongkos Kirim</p>
          <p className="text-end">{rupiahFormatter.format(order.shippingCost)}</p>
          <hr className="col-span-2" />
          <p className="text-base font-semibold">Total Belanja</p>
          <p className="text-base font-semibold text-end">
            {rupiahFormatter.format(order.total)}
          </p>
        </div>
        {footer}
      </div>
    </div>
  );
}
