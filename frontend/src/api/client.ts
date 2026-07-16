// Axios API client with interceptors

import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const url = config.url || "";

  // If requesting an admin endpoint, use admin token
  if (url.includes("/admin/")) {
    const adminAuth = localStorage.getItem("admin-auth");
    if (adminAuth) {
      try {
        const { state } = JSON.parse(adminAuth);
        if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
      } catch {
        /* ignore */
      }
    }
  } 
  // If requesting a staff endpoint, use staff token
  else if (url.includes("/staff/")) {
    const staffSession = localStorage.getItem("staff-session");
    if (staffSession) {
      try {
        const { token, expiresAt } = JSON.parse(staffSession);
        if (token && expiresAt > Date.now()) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        /* ignore */
      }
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
