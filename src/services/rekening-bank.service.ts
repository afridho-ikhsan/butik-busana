import apiClient from "@/lib/api/client";

export const rekeningBankService = {
  getRekeningBank: () => apiClient.get("/rekening-bank").then((r) => r.data),
};
