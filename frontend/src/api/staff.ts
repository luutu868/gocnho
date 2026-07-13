// API functions for staff dashboard

import api from "./client";
import type { StaffOrder } from "@/types/staff";

export async function staffLogin(staffCode: string, pin: string) {
  const { data } = await api.post("/auth/staff/login", {
    staff_code: staffCode,
    pin,
  });
  return data;
}

export async function staffLogout() {
  const { data } = await api.post("/auth/staff/logout");
  return data;
}

export async function fetchStaffOrders(params?: {
  since?: string;
  status?: string;
}): Promise<{ orders: StaffOrder[]; next_cursor: string | null; has_more: boolean }> {
  const { data } = await api.get("/staff/orders", { params });
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await api.patch(`/staff/orders/${orderId}/status`, { status });
  return data;
}

export async function updateItemStatus(itemId: string, status: string) {
  const { data } = await api.patch(`/staff/order-items/${itemId}/status`, { status });
  return data;
}
