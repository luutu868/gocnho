// Zustand admin auth store — JWT token management with localStorage persistence

import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      isAuthenticated: false,
      mustChangePassword: false,
      error: null,

      login: async (username, password) => {
        set({ error: null });
        try {
          const result = await adminApi.adminLogin(username, password);
          set({
            token: result.access_token,
            username,
            isAuthenticated: true,         // always true after successful login
            mustChangePassword: result.must_change_password || false,
            error: null,
          });
          return true;
        } catch (err: unknown) {
          let message = "Sai tên đăng nhập hoặc mật khẩu";
          if (err && typeof err === "object" && "response" in err) {
            const axiosErr = err as { response?: { data?: { detail?: string } } };
            message = axiosErr.response?.data?.detail || message;
          }
          set({ error: message });
          return false;
        }
      },

      logout: () => {
        set({
          token: null,
          username: null,
          isAuthenticated: false,
          mustChangePassword: false,
          error: null,
        });
      },

      refreshToken: async () => {
        // Token refresh not implemented — user must re-login after token expires
        get().logout();
      },

      changePassword: async (oldPassword, newPassword) => {
        set({ error: null });
        try {
          await adminApi.changePassword(oldPassword, newPassword);
          set({ mustChangePassword: false });
          return true;
        } catch (err: unknown) {
          let message = "Đổi mật khẩu thất bại";
          if (err && typeof err === "object" && "response" in err) {
            const axiosErr = err as { response?: { data?: { detail?: string } } };
            message = axiosErr.response?.data?.detail || message;
          }
          set({ error: message });
          return false;
        }
      },
    }),
    {
      name: "admin-auth",          // localStorage key
      partialize: (state) => ({    // only persist these fields
        token: state.token,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
        mustChangePassword: state.mustChangePassword,
      }),
    }
  )
);
