"use client";

import React, { useContext, useEffect, useState } from "react";
import CopyButton from "@/components/copy-button";
import { rupiahFormatter } from "@/utils/number-formatter";
import { CldUploadButton, CloudinaryUploadWidgetResults } from "next-cloudinary";
import Image from "next/image";
import { useMutatePaymentEvidence } from "@/hooks/useMutatePaymentEvidence";
import { toast } from "react-toastify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import { getBuktiPembayaranById } from "@/lib/order";
import PrimaryButton from "./primary-button";
import { ModalContext } from "./modal";
import { useGetRekingBank } from "@/hooks/useRekeningBank";
import { orderService } from "@/services/order.service";
import useCurrentMember from "@/hooks/useCurrentMember";
import { redirectToCheckout } from "@/lib/redirect-to-checkout";
import type { CheckoutLineItemType, CheckoutDataType } from "@/types/checkout-types";

function PaymentPage({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const [namaFotoBuktiTf, setNamaFotoBuktiTf] = useState<string | null>(null);
  const [linkFotoBuktiPembayaran, setLinkFotoBuktiPembayaran] = useState<string | null>(null);
  const { mutatePaymentEvidence, mutatePaymentEvidencePending } = useMutatePaymentEvidence();
  const { isOpen } = useContext(ModalContext);
  const { rekeningBank, getRekeningBankLoading } = useGetRekingBank(isOpen);
  const { member, isLoggedIn } = useCurrentMember();

  const { data: orderData, isLoading } = useQuery({
    queryKey: [orderId, "currentOrder"],
    queryFn: () => orderService.getOrder(orderId),
    enabled: isOpen,
  });

  const { data: buktiPembayaran, isLoading: getBuktiPembayaranLoading } = useQuery({
    queryKey: [orderId, "buktiPembayaran", mutatePaymentEvidencePending],
    queryFn: async () => {
      try {
        const result = await getBuktiPembayaranById(orderId);
        if (!result?.namaFoto || !result?.linkBuktiPembayaran) return null;
        return result;
      } catch {
        return null;
      }
    },
    staleTime: 0,
    enabled: isOpen,
  });

  useEffect(() => {
    if (buktiPembayaran?.namaFoto && buktiPembayaran?.linkBuktiPembayaran) {
      setNamaFotoBuktiTf(buktiPembayaran.namaFoto);
      setLinkFotoBuktiPembayaran(buktiPembayaran.linkBuktiPembayaran);
    } else {
      setNamaFotoBuktiTf(null);
      setLinkFotoBuktiPembayaran(null);
    }
  }, [buktiPembayaran, isOpen]);

  useEffect(() => {
    if (!isOpen) setNamaFotoBuktiTf(null);
  }, [isOpen]);

  const handlePhotoChange = async (result: CloudinaryUploadWidgetResults) => {
    if (typeof result.info !== "object")
      return toast.error("Tidak ada gambar yang diunggah");

    const link = result.info.url;
    const nama = `${result.info.original_filename}.${result.info.format}`;

    if (link && nama) {
      setNamaFotoBuktiTf(nama);
      setLinkFotoBuktiPembayaran(link);
    }
  };

  async function handleSavePaymentEvidence(
    orderId: string,
    linkFotoBuktiPembayaran: string,
    namaFoto: string,
    orderNumber: string
  ) {
    try {
      await mutatePaymentEvidence({
        orderId,
        linkFotoBuktiPembayaran,
        namaFoto,
        orderNumber,
      });
      toast.success("Bukti pembayaran berhasil dikirim");
    } catch {
      toast.error("Terdapat kesalahan saat mengirim bukti pembayaran");
    }
  }

  const totalAmount = orderData?.priceSummary?.total?.amount
    ? parseFloat(orderData.priceSummary.total.amount)
    : orderData?.total ?? 0;

  const { mutate: payWithMidtrans, isPending: payWithMidtransPending } = useMutation({
    mutationKey: ["pay-with-midtrans", orderId],
    mutationFn: async () => {
      if (!isLoggedIn) {
        toast.error("Untuk melanjutkan, silahkan login terlebih dahulu");
        return;
      }
      if (!orderData) {
        toast.error("Data pesanan belum tersedia");
        return;
      }

      const lineItems = ((orderData.lineItems || []) as any[]).map((item) => {
        const productName =
          typeof item.productName === "string"
            ? item.productName
            : item.productName?.original || "";
        const sentItem: CheckoutLineItemType = {
          id: item.id || "",
          itemType: item.itemType || "PHYSICAL",
          price: Number(item.price) || 0,
          productName,
          quantity: item.quantity || 0,
          image: item.image || "",
          weight: Number(item.weight) || 0,
          catalogReference: item.catalogReference || {
            appId: "toserbanet",
            catalogItemId: "",
            options: {},
          },
        };
        return sentItem;
      });

      const checkoutData: CheckoutDataType & { orderId: string } = {
        informasiPembeli: {
          memberId: member?._id || "",
          contactId: member?.contactId || "",
          nama:
            member?.profile?.nickname ||
            member?.loginEmail ||
            "",
          nomorHp:
            (member?.contact?.phones && member.contact.phones[0]) ||
            "",
          email: member?.loginEmail || "",
        },
        alamat: orderData.address || "",
        catatan: orderData.catatan || "",
        lineItems,
        ongkir: Number(orderData.shippingCost) || 0,
        layananKurir: orderData.layananKurir || "",
        orderId,
      };

      await redirectToCheckout(checkoutData, member?.contactId || "", true);
    },
  });

  return (
    <div className="mt-3 space-y-3 w-full min-h-72 relative overflow-y-auto max-h-[90vh] scrollbar pr-1">
      {getBuktiPembayaranLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="loader" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 max-h-52 overflow-y-auto scrollbar pr-1 pb-5">
            {getRekeningBankLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  className="shrink-0 grid grid-cols-8 items-center gap-y-2 bg-slate-200/50 rounded-lg p-3 shadow-md"
                  key={i}
                >
                  <Skeleton className="w-12 rounded-full aspect-square row-span-3 col-span-2 place-self-center bg-slate-300/50" />
                  <Skeleton className="col-span-5 h-4 bg-slate-300/50 shrink-0" />
                  <Skeleton className="col-span-5 h-4 bg-slate-300/50 shrink-0" />
                  <Skeleton className="col-span-5 h-4 bg-slate-300/50 shrink-0" />
                </div>
              ))
            ) : !rekeningBank || rekeningBank.length < 1 ? (
              <p>Rekening sedang tidak tersedia.</p>
            ) : (
              rekeningBank.map((rekeningItem: { jenisBank?: string; nomorRekening?: string; namaPenerima?: string; gambarBank?: string }, i: number) => (
                <div
                  className="shrink-0 grid grid-cols-8 items-center gap-x-1 bg-slate-200/50 rounded-lg p-3 shadow-md"
                  key={i}
                >
                  <Image
                    width={0}
                    height={0}
                    className="row-span-3 col-span-2 place-self-center rounded-full border-2 border-slate-500 w-12 aspect-square"
                    src={rekeningItem?.gambarBank || "/broken-image.png"}
                    alt=""
                    sizes="33vw"
                  />
                  <p className="col-span-5">{rekeningItem?.jenisBank}</p>
                  <div className="col-span-5 flex gap-2 items-center">
                    <p className="font-semibold text-sm">{rekeningItem?.nomorRekening}</p>
                    <CopyButton
                      copyObject={`Rekening ${rekeningItem?.jenisBank}`}
                      text={rekeningItem?.nomorRekening || ""}
                    />
                  </div>
                  <p className="col-span-5 font-semibold text-sm">
                    an. {rekeningItem?.namaPenerima}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center">
                Total:{" "}
                {isLoading ? (
                  <Skeleton className="w-16 h-4 bg-slate-300/50 shrink-0" />
                ) : (
                  <div className="flex gap-1 items-center">
                    <span className="text-green-700">
                      {rupiahFormatter.format(totalAmount)}
                    </span>
                    <CopyButton
                      text={String(totalAmount)}
                      copyObject="Nominal Transfer"
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs font-semibold">
              Pastikan nominal transfer sesuai dengan yang tertera di atas
            </p>
          </div>

          <CldUploadButton
            className="flex flex-col justify-center items-center p-16 border-2 border-dashed border-slate-700 rounded-lg bg-slate-200 cursor-pointer w-full"
            uploadPreset={process.env.NEXT_PUBLIC_UPLOAD_PRESET!}
            onSuccess={handlePhotoChange}
            options={{
              maxFiles: 1,
              cropping: true,
              resourceType: "image",
              clientAllowedFormats: ["pdf", "png", "jpg"],
            }}
          >
            <p className="line-clamp-1">
              {namaFotoBuktiTf && namaFotoBuktiTf !== ""
                ? namaFotoBuktiTf
                : "Upload Bukti Transfer"}
            </p>
            {namaFotoBuktiTf && namaFotoBuktiTf !== "" && (
              <p className="underline">Upload ulang bukti transfer</p>
            )}
          </CldUploadButton>

          {!!buktiPembayaran?.namaFoto && !!buktiPembayaran?.linkBuktiPembayaran && (
            <p className="text-slate-500 text-xs font-semibold text-center lg:text-start">
              Bukti pembayaran anda sudah terkirim. Mohon tunggu hingga proses review selesai.
            </p>
          )}

          <PrimaryButton
            className="w-full rounded-lg disabled:cursor-not-allowed disabled:bg-slate-300 relative text-xs"
            disabled={
              !namaFotoBuktiTf ||
              !linkFotoBuktiPembayaran ||
              mutatePaymentEvidencePending ||
              getBuktiPembayaranLoading
            }
            onClick={() => {
              if (!linkFotoBuktiPembayaran || !namaFotoBuktiTf)
                return toast.error(
                  "Anda belum mengunggah bukti pembayaran, silahkan unggah terlebih dahulu sebelum kirim"
                );

              if (
                namaFotoBuktiTf === buktiPembayaran?.namaFoto ||
                linkFotoBuktiPembayaran === buktiPembayaran?.linkBuktiPembayaran
              ) {
                return toast.error("Mohon untuk mengunggah gambar yang berbeda");
              }

              handleSavePaymentEvidence(
                orderId,
                linkFotoBuktiPembayaran,
                namaFotoBuktiTf,
                orderNumber
              );
            }}
          >
            {mutatePaymentEvidencePending || getBuktiPembayaranLoading ? (
              <div className="loader-white w-[25px]" />
            ) : !buktiPembayaran?.namaFoto || !buktiPembayaran?.linkBuktiPembayaran ? (
              "Kirim"
            ) : (
              "Upload ulang"
            )}
          </PrimaryButton>

          <div className="mt-4 space-y-2 w-full">
            <p className="text-xs text-slate-600 text-center lg:text-start">
              Atau, kamu juga bisa membayar otomatis lewat Virtual Account / QRIS tanpa upload bukti transfer.
            </p>
            <div id="snap-container" className="w-full" />
            <PrimaryButton
              className="w-full rounded-lg text-xs"
              disabled={payWithMidtransPending}
              onClick={() => payWithMidtrans()}
            >
              {payWithMidtransPending ? "Membuka pembayaran..." : "Bayar Virtual Account / QRIS"}
            </PrimaryButton>
          </div>
        </>
      )}
    </div>
  );
}

export default PaymentPage;
