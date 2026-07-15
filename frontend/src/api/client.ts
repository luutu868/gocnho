// Axios API client with interceptors

import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor — attach staff or admin JWT token
api.interceptors.request.use((config) => {
  // Staff token takes priority (staff pages)
  const staffSession = localStorage.getItem("staff-session");
  if (staffSession) {
    try {
      const { token, expiresAt } = JSON.parse(staffSession);
      if (token && expiresAt > Date.now()) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    } catch {
      /* ignore */
    }
  }

  // Fall back to admin JWT (from Zustand persisted store key "admin-auth")
  const adminAuth = localStorage.getItem("admin-auth");
  if (adminAuth) {
    try {
      const { state } = JSON.parse(adminAuth);
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? "";
      // Only clear admin session on 401 from admin DATA endpoints (not auth endpoints)
      // Pattern: /api/v1/admin/ but NOT /api/v1/auth/admin/
      if (url.includes("/api/v1/admin/") && !url.includes("/auth/")) {
        localStorage.removeItem("admin-auth");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
