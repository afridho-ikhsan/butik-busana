"use client";

import { addBuktiPembayaran } from "@/lib/order";
import { useMutation } from "@tanstack/react-query";

export function useMutatePaymentEvidence() {
  const {
    mutateAsync: mutatePaymentEvidence,
    isPending: mutatePaymentEvidencePending,
  } = useMutation({
    mutationKey: ["fotoBuktiPembayaran"],
    mutationFn: async ({
      orderId,
      linkFotoBuktiPembayaran,
      namaFoto,
      orderNumber,
    }: {
      orderId: string;
      linkFotoBuktiPembayaran: string;
      namaFoto: string;
      orderNumber: string;
    }) => {
      // await updateBuktiPembayaran(orderId, linkFotoBuktiPembayaran);
      await addBuktiPembayaran(
        orderId,
        linkFotoBuktiPembayaran,
        namaFoto,
        orderNumber
      );
    },
  });

  return { mutatePaymentEvidence, mutatePaymentEvidencePending };
}
