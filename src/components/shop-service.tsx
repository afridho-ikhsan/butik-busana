import { ImDropbox } from "react-icons/im";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { RiLuggageCartLine } from "react-icons/ri";

function ShopService() {
  return (
    <div className="pt-2 flex flex-col gap-1">
      <div className="px-3 flex items-center justify-center gap-2">
        <div className="h-1 rounded-full flex-grow bg-slate-400" />
        <h2 className="ml-2 font-bold text-lg sm:text-xl shrink-0">
          Layanan Toko Kami
        </h2>
        <div className="h-1 rounded-full flex-grow bg-slate-400" />
      </div>

      <div className="w-full h-full flex items-center justify-center py-4 pb-7 top-0">
        <div className="flex gap-3 justify-center overflow-x-auto flex-wrap scrollbar-hide px-3">
          <div className="flex flex-col items-center gap-2 text-center w-[90%] max-w-96 bg-slate-200/80 py-10 px-5 rounded-lg">
            <ImDropbox className="text-5xl" />

            <div className="space-y-2">
              <h3 className="font-medium text-xl">Produk Berkwalitas</h3>
              <p>
                Kami menawarkan aneka produk berkwalitas dengan harga terjangkau
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center w-[90%] max-w-96 bg-slate-200/80 py-10 px-5 rounded-lg">
            <RiLuggageCartLine className="text-5xl" />

            <div className="space-y-2">
              <h3 className="font-medium text-xl">Easy Checkout</h3>
              <p>Pesanan Anda otomatis terhubung ke nomor WhatsApp admin kami</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center w-[90%] max-w-96 bg-slate-200/80 py-10 px-5 rounded-lg">
            <IoChatbubbleEllipsesOutline className="text-5xl" />

            <div className="space-y-2">
              <h3 className="font-medium text-xl">Tracking Pesanan</h3>
              <p>
                Anda dapat menghubungi CS kami untuk menanyakan proses 
                pesanan Anda
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShopService;
