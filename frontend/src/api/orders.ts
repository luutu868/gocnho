// API functions for orders

import api from "./client";
import type { OrderResponse } from "@/types/order";

export interface CreateOrderPayload {
  table_code: string | null;
  payment_method: "vietqr" | "cash";
  items: {
    product_id: string;
    variant_id: string;
    quantity: number;
    options: { option_id: string }[];
    toppings: { topping_id: string; quantity: number }[];
    note?: string;
  }[];
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  const { data } = await api.post("/orders", payload);
  return data;
}

export async function getOrder(orderCode: string) {
  const { data } = await api.get(`/orders/${orderCode}`);
  return data;
}

export async function confirmPayment(orderCode: string) {
  const { data } = await api.post(`/orders/${orderCode}/confirm-payment`);
  return data;
}

export async function confirmCash(orderCode: string) {
  const { data } = await api.post(`/orders/${orderCode}/confirm-cash`);
  return data;
}
