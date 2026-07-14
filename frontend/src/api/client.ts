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

  // Fall back to admin JWT
  const adminSession = localStorage.getItem("admin-session");
  if (adminSession) {
    try {
      const { token } = JSON.parse(adminSession);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

// Response interceptor — handle 401 (do NOT auto-clear valid sessions)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only clear admin session on 401 from admin endpoints
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? "";
      if (url.includes("/admin/")) {
        localStorage.removeItem("admin-session");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
