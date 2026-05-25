import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/utils/date-formatter";
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { RiShoppingBagFill } from "react-icons/ri";
import Link from "next/link";
import NotFoundInfo from "@/components/not-found-info";
import HelpButton from "@/components/buttons/help-button";
import PayButton from "@/components/buttons/pay-button";

async function TransactionList() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { slug: true },
  });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  console.log(orders, 'orders');

  const userSlug = user?.slug || session.user.id;

  return (
    <div className="mt-5 px-3 overflow-hidden h-full">
      {!orders || orders.length < 1 ? (
        <NotFoundInfo
          description="Pesanan anda akan tampil disini, saat sudah melakukan pemesanan nanti"
          object="Pesanan"
          customIconUrl="/order-delivery.svg"
          customTitle="Anda belum memiliki pesanan saat ini"
        />
      ) : (
        <>
          <h1 className="text-xl font-semibold mb-3">Daftar Transaksi</h1>

          <div
            className="grid gap-2"
            style={{
              gridTemplateRows: "auto",
              gridTemplateColumns: "repeat(4, 1fr) repeat(2, max-content)",
            }}
          >
            <div className="w-full flex justify-between items-center gap-3 flex-wrap rounded-full bg-slate-50 border-2 border-slate-500 overflow-hidden relative sm:max-w-[15rem] mx-auto sm:mx-0 col-span-6 sm:col-span-4">
              <input
                type="text"
                placeholder="Cari berdasarkan invoice"
                className="w-full h-full bg-transparent border-slate-50 ring-slate-50 ring-0 border-0 p-2 text-sm"
              />
              <button className="text-2xl absolute right-3 top-1/2 -translate-y-1/2">
                <CiSearch />
              </button>
            </div>

            <select
              name=""
              id=""
              className="bg-slate-300 rounded-full p-2 text-xs w-[135px] col-span-3 sm:col-span-1"
            >
              <option value="">Semua Status</option>
              <option value="">Belum Bayar</option>
              <option value="">Sedang diproses</option>
              <option value="">Selesai</option>
            </select>
            <select
              name=""
              id=""
              className="bg-slate-300 rounded-full p-2 text-xs w-[135px] col-span-3 sm:col-span-1"
            >
              <option value="">Semua Tanggal</option>
              <option value="">30 Hari Terakhir</option>
              <option value="">90 Hari Terakhir</option>
              <option value="">Pilih Tanggal Sendiri</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 text-xs lg:max-h-[38rem] my-5 px-3 overflow-y-auto scrollbar">
            {orders.map((order) => {
              const lineItems = (order.lineItems as { productName?: string; image?: string; quantity?: number }[]) || [];
              const firstItem = lineItems[0];
              const tomorrow = new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000;

              const isCanceled = Date.now() >= order.createdAt.getTime() + 24 * 60 * 60 * 1000 && order.paymentStatus !== "PAID";

              return (
                <div className="flex flex-col" key={order.id}>
                  {(order.paymentStatus === "NOT_PAID" && order.status !== "CANCELED" && !isCanceled) && (
                    <div className="bg-red-100 text-red-500 p-2 rounded-t-lg text-sm flex justify-center text-center">
                      Lakukan pembayaran sebelum {formatDate(tomorrow)}
                    </div>
                  )}
                  <Link
                    href={`/user/${userSlug}/transactions/${order.id}`}
                    className="flex flex-col gap-2 bg-slate-50 shadow p-3 rounded-b-lg"
                  >
                    <div className="flex justify-between gap-3 flex-wrap">
                      <div className="flex gap-2 items-center">
                        <RiShoppingBagFill className="text-2xl" />
                        <div>
                          <p className="font-semibold text-xs sm:text-base">
                            Pesanan #{order.orderNumber}
                          </p>
                          <p className="text-slate-500">
                            {formatDate(new Date(order.createdAt))}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        {(order.paymentStatus === "PAID") && (
                          <div className="rounded-lg p-2 bg-green-300 text-green-700 cursor-default">
                            Sudah Bayar
                          </div>
                        )}

                        {(order.paymentStatus === "NOT_PAID" && order.status !== "CANCELED" && !isCanceled) && (
                          <PayButton
                            orderId={order.id}
                            orderNumber={order.orderNumber}
                            buttonText="Belum Bayar"
                            className="rounded-lg p-2 bg-red-100 text-red-500 hover:bg-red-500 hover:text-red-100 cursor-pointer z-10"
                          />
                        )}

                        {((order.paymentStatus === "NOT_PAID" && order.status === "CANCELED" || isCanceled)) && (
                          <div className="rounded-lg p-2 bg-gray-300 text-gray-700 cursor-default">
                            Dibatalkan
                          </div>
                        )}

                        <HelpButton />
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="relative row-span-2 w-16 aspect-square rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={firstItem?.image || "/product.png"}
                          alt=""
                          fill
                          sizes="33vw"
                          style={{ objectFit: "cover" }}
                        />
                      </div>

                      <div>
                        <p className="font-semibold">
                          {firstItem?.productName || ""}
                        </p>
                        <p className="text-slate-500">
                          {(firstItem?.quantity || 0)} Barang
                        </p>
                      </div>
                    </div>

                    {lineItems.length > 1 && (
                      <p className="mt-2">+{lineItems.length - 1} produk lainnya</p>
                    )}

                    <div>
                      <p className="text-slate-500">Total Belanja</p>
                      <p className="font-semibold text-sm">
                        Rp {order.total.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default TransactionList;
