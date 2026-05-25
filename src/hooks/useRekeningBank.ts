"use client";

import { useQuery } from "@tanstack/react-query";
import { rekeningBankService } from "@/services/rekening-bank.service";

export function useRekeningBank() {
  return useQuery({
    queryKey: ["rekening-bank"],
    queryFn: () => rekeningBankService.getRekeningBank(),
  });
}

export function useGetRekingBank(enabled = true) {
  const { data: rekeningBank, isLoading: getRekeningBankLoading } = useQuery({
    queryKey: ["rekening-bank"],
    queryFn: () => rekeningBankService.getRekeningBank(),
    enabled,
  });
  return { rekeningBank: rekeningBank || [], getRekeningBankLoading };
}
