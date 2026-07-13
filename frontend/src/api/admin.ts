// API functions for admin dashboard

import api from "./client";

// Auth
export async function adminLogin(username: string, password: string) {
  const { data } = await api.post("/auth/admin/login", { username, password });
  return data;
}

export async function adminRefresh() {
  const { data } = await api.post("/auth/admin/refresh");
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data } = await api.post("/auth/admin/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return data;
}

// Categories
export async function fetchAdminCategories() {
  const { data } = await api.get("/admin/categories");
  return data;
}

export async function createCategory(payload: Record<string, unknown>) {
  const { data } = await api.post("/admin/categories", payload);
  return data;
}

export async function updateCategory(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/admin/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string) {
  await api.delete(`/admin/categories/${id}`);
}

// Products
export async function fetchAdminProducts(params?: Record<string, unknown>) {
  const { data } = await api.get("/admin/products", { params });
  return data;
}

export async function createProduct(payload: Record<string, unknown>) {
  const { data } = await api.post("/admin/products", payload);
  return data;
}

export async function updateProduct(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/admin/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string) {
  await api.delete(`/admin/products/${id}`);
}

export async function toggleProductAvailable(id: string) {
  const { data } = await api.put(`/admin/products/${id}/toggle-available`);
  return data;
}

// Toppings
export async function fetchAdminToppings() {
  const { data } = await api.get("/admin/toppings");
  return data;
}

export async function createTopping(payload: Record<string, unknown>) {
  const { data } = await api.post("/admin/toppings", payload);
  return data;
}

export async function updateTopping(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/admin/toppings/${id}`, payload);
  return data;
}

export async function deleteTopping(id: string) {
  await api.delete(`/admin/toppings/${id}`);
}

// Tables
export async function fetchAdminTables() {
  const { data } = await api.get("/admin/tables");
  return data;
}

export async function createTable(payload: Record<string, unknown>) {
  const { data } = await api.post("/admin/tables", payload);
  return data;
}

export async function createTablesBatch(payload: Record<string, unknown>) {
  const { data } = await api.post("/admin/tables/batch", payload);
  return data;
}

export async function updateTable(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/admin/tables/${id}`, payload);
  return data;
}

export async function deleteTable(id: string) {
  await api.delete(`/admin/tables/${id}`);
}

export async function generateTableQr(id: string) {
  const { data } = await api.post(`/admin/tables/${id}/generate-qr`);
  return data;
}

export async function generateAllQr() {
  const { data } = await api.post("/admin/tables/generate-all-qr");
  return data;
}

// Staff (nhân viên)
export async function fetchAdminStaff() {
  const { data } = await api.get("/admin/staff");
  return data;
}

export async function createStaff(payload: Record<string, unknown>) {
  const { data } = await api.post("/admin/staff", payload);
  return data;
}

export async function updateStaff(id: string, payload: Record<string, unknown>) {
  const { data } = await api.put(`/admin/staff/${id}`, payload);
  return data;
}

export async function deactivateStaff(id: string) {
  await api.delete(`/admin/staff/${id}`);
}

export async function resetStaffPin(id: string, pin: string) {
  const { data } = await api.put(`/admin/staff/${id}/reset-pin`, { pin });
  return data;
}

// Orders
export async function fetchAdminOrders(params?: Record<string, unknown>) {
  const { data } = await api.get("/admin/orders", { params });
  return data;
}

// Settings
export async function fetchSettings() {
  const { data } = await api.get("/admin/settings");
  return data;
}

export async function updateSettings(payload: Record<string, unknown>) {
  const { data } = await api.put("/admin/settings", payload);
  return data;
}

// Upload
export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/admin/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
