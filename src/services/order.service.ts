import apiClient from "@/lib/api/client";

export const orderService = {
  getOrders: () => apiClient.get("/orders").then((r) => r.data),
  getOrder: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`).then((r) => r.data),
  createOrder: (data: {
    alamat: string;
    lineItems: object[];
    catatan?: string;
    ongkir: number;
    layananKurir: string;
    informasiPembeli: { email: string; nama: string; nomorHp: string };
  }) => apiClient.post("/orders/create", data).then((r) => r.data),
};
