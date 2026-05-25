"use client";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import ModalOverlay from "./modal-overlay";
import PayButton from "./buttons/pay-button";

function OrderDetailModal({
  children,
  data,
}: {
  children: React.ReactNode;
  data?: any;
}) {
  const router = useRouter();

  return (
    typeof window !== "undefined" &&
    createPortal(
      <>
        <ModalOverlay handleClose={() => router.back()} />
        <div
          className={`bg-slate-50 px-3 md:px-10 pb-5 py-16 min-[361px]:pt-10 md:pt-16 w-[90%] max-w-[535px] h-fit fixed top-[45%] left-1/2 -translate-x-1/2 rounded-xl flex flex-col gap-3 justify-center items-center max-h-[80vh] -translate-y-1/2 opacity-100 z-30 duration-500 delay-75`}
        >
          <div className="absolute top-3 flex justify-between gap-3 items-center w-full px-3 flex-wrap">
            <h1 className="text-lg font-semibold">Detail Pesanan</h1>
            <button
              className="rounded-full p-1 flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-slate-400 hover:bg-slate-500"
              onClick={() => {
                router.back();
              }}
            >
              <IoClose className="text-slate-50 text-5xl" />
            </button>
            <hr className="basis-[90%] justify-self-center shrink-0 border-2 mx-auto" />
          </div>
          {children}
          {
            data.orderStatus !== 'CANCELED' &&
            <div className="w-full">
              {data.paymentStatus !== "PAID" && (
                <PayButton
                  orderId={data.orderId || ""}
                  buttonText="Bayar"
                  className="w-full rounded-lg"
                  orderNumber={data.orderNumber || ""}
                />
              )}
            </div>
          }
        </div>
      </>,
      document.body
    )
  );
}

export default OrderDetailModal;
