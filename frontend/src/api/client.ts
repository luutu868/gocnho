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
  // Staff requests no longer need Authorization header because they use HttpOnly cookie
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
      
      // Clear staff session on 401 from staff DATA endpoints
      if (url.includes("/api/v1/staff/") && !url.includes("/auth/")) {
        localStorage.removeItem("staff-storage");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
