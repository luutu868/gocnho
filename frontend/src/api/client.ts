// Axios API client with interceptors

import axios from "axios";
import { API_BASE_URL } from "@/lib/constants";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Request interceptor — auto attach admin JWT if available
api.interceptors.request.use((config) => {
  const session = localStorage.getItem("admin-session");
  if (session) {
    try {
      const { token } = JSON.parse(session);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      // Clear expired sessions
      localStorage.removeItem("admin-session");
      localStorage.removeItem("staff-session");
    }
    return Promise.reject(error);
  }
);

export default api;
