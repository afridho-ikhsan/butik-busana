"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getOrders(),
  });
}

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrder(orderId!),
    enabled: !!orderId,
  });
}
