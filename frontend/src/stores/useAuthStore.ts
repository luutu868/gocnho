// Zustand admin auth store — JWT token management

import { create } from "zustand";
import * as adminApi from "@/api/admin";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  username: null,
  isAuthenticated: false,
  mustChangePassword: false,
  error: null,

  login: async (username, password) => {
    set({ error: null });
    try {
      const result = await adminApi.adminLogin(username, password);
      const session = {
        username,
        token: result.access_token,
        expiresAt: Date.now() + result.expires_in * 1000,
      };
      localStorage.setItem("admin-session", JSON.stringify(session));
      set({
        token: result.access_token,
        username,
        isAuthenticated: !result.must_change_password,
        mustChangePassword: result.must_change_password || false,
      });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sai tên đăng nhập hoặc mật khẩu";
      set({ error: message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("admin-session");
    set({
      token: null,
      username: null,
      isAuthenticated: false,
      mustChangePassword: false,
      error: null,
    });
  },

  refreshToken: async () => {
    try {
      const result = await adminApi.adminRefresh();
      set({ token: result.access_token });
      const session = JSON.parse(localStorage.getItem("admin-session") || "{}");
      session.token = result.access_token;
      localStorage.setItem("admin-session", JSON.stringify(session));
    } catch {
      get().logout();
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    set({ error: null });
    try {
      await adminApi.changePassword(oldPassword, newPassword);
      set({ mustChangePassword: false, isAuthenticated: true });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Đổi mật khẩu thất bại";
      set({ error: message });
      return false;
    }
  },
}));
