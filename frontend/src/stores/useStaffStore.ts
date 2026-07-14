// Zustand staff store — auth + orders + polling state

import { create } from "zustand";
import type { StaffOrder } from "@/types/staff";
import * as staffApi from "@/api/staff";

interface StaffState {
  isAuthenticated: boolean;
  staffCode: string;
  staffName: string;
  orders: StaffOrder[];
  lastPollTime: string | null;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lockedUntil: number;

  login: (staffCode: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchOrders: (since?: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateItemStatus: (itemId: string, status: string) => Promise<void>;
}

const getInitialState = () => {
  const saved = localStorage.getItem("staff-session");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.expiresAt > Date.now()) {
        return {
          isAuthenticated: true,
          staffCode: parsed.staffCode || "",
          staffName: parsed.staffName || "",
        };
      }
    } catch {
      localStorage.removeItem("staff-session");
    }
  }
  return {
    isAuthenticated: false,
    staffCode: "",
    staffName: "",
  };
};

const initialState = getInitialState();

export const useStaffStore = create<StaffState>((set, get) => ({
  isAuthenticated: initialState.isAuthenticated,
  staffCode: initialState.staffCode,
  staffName: initialState.staffName,
  orders: [],
  lastPollTime: null,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lockedUntil: 0,

  login: async (staffCode, pin) => {
    try {
      const result = await staffApi.staffLogin(staffCode, pin);
      const session = {
        staffCode: result.staff_code,
        staffName: result.name,
        token: result.session_token,           // ← save token for Bearer auth
        expiresAt: Date.now() + 8 * 60 * 60 * 1000,
      };
      localStorage.setItem("staff-session", JSON.stringify(session));
      set({
        isAuthenticated: true,
        staffCode: result.staff_code,
        staffName: result.name,
        loginAttempts: 0,
        error: null,
      });
      return true;
    } catch {
      const attempts = get().loginAttempts + 1;
      if (attempts >= 5) {
        set({
          loginAttempts: attempts,
          lockedUntil: Date.now() + 15 * 60 * 1000,
          error: "Tài khoản tạm khóa 15 phút do nhập sai PIN quá 5 lần",
        });
      } else {
        set({
          loginAttempts: attempts,
          error: `Sai mã nhân viên hoặc PIN. Còn ${5 - attempts} lần thử`,
        });
      }
      return false;
    }
  },

  logout: async () => {
    try {
      await staffApi.staffLogout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem("staff-session");
    set({
      isAuthenticated: false,
      staffCode: "",
      staffName: "",
      orders: [],
      lastPollTime: null,
    });
  },

  fetchOrders: async (since) => {
    set({ isLoading: true });
    try {
      const result = await staffApi.fetchStaffOrders({
        since,
        status: "confirmed,preparing",
      });
      if (since) {
        // Merge: update existing + add new
        set((state) => {
          const existingMap = new Map(state.orders.map((o) => [o.id, o]));
          for (const order of result.orders) {
            existingMap.set(order.id, order);
          }
          return {
            orders: Array.from(existingMap.values()),
            lastPollTime: new Date().toISOString(),
            isLoading: false,
            error: null,
          };
        });
      } else {
        set({
          orders: result.orders,
          lastPollTime: new Date().toISOString(),
          isLoading: false,
          error: null,
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Không thể tải đơn mới",
      });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    await staffApi.updateOrderStatus(orderId, status);
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: status as StaffOrder["status"] } : o
      ),
    }));
  },

  updateItemStatus: async (itemId, status) => {
    await staffApi.updateItemStatus(itemId, status);
    // Optimistic update handled by next poll
  },
}));
