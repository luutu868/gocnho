// API functions for admin dashboard - aligned with backend routes

import api from "./client";

// Auth
export async function adminLogin(username: string, password: string) {
  const { data } = await api.post("/auth/admin/login", { username, password });
  return data as { access_token: string; token_type: string; expires_in: number; must_change_password: boolean };
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const { data } = await api.post("/auth/admin/change-password", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return data;
}

export async function getAdminMe() {
  const { data } = await api.get("/auth/admin/me");
  return data;
}

// Categories
export async function fetchAdminCategories() {
  const { data } = await api.get("/admin/categories");
  return data as Category[];
}

export async function createCategory(payload: CategoryPayload) {
  const { data } = await api.post("/admin/categories", payload);
  return data as Category;
}

export async function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  const { data } = await api.put(`/admin/categories/${id}`, payload);
  return data as Category;
}

export async function deleteCategory(id: string) {
  await api.delete(`/admin/categories/${id}`);
}

// Products
export async function fetchAdminProducts(params?: { category_id?: string }) {
  const { data } = await api.get("/admin/products", { params });
  return data as AdminProduct[];
}

export async function createProduct(payload: ProductPayload) {
  const { data } = await api.post("/admin/products", payload);
  return data as AdminProduct;
}

export async function updateProduct(id: string, payload: Partial<ProductPayload>) {
  const { data } = await api.put(`/admin/products/${id}`, payload);
  return data as AdminProduct;
}

export async function toggleProductAvailability(id: string) {
  const { data } = await api.patch(`/admin/products/${id}/availability`);
  return data as { id: string; is_available: boolean };
}

export async function deleteProduct(id: string) {
  await api.delete(`/admin/products/${id}`);
}

export async function uploadProductImage(productId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post(`/admin/upload/product-image/${productId}`, formData, {
    headers: { "Content-Type": undefined },
  });
  return data as { id: string; url: string; product_id: string };
}

// Toppings
export async function fetchAdminToppings() {
  const { data } = await api.get("/admin/toppings");
  return data as AdminTopping[];
}

export async function createTopping(payload: ToppingPayload) {
  const { data } = await api.post("/admin/toppings", payload);
  return data as AdminTopping;
}

export async function updateTopping(id: string, payload: Partial<ToppingPayload>) {
  const { data } = await api.put(`/admin/toppings/${id}`, payload);
  return data as AdminTopping;
}

export async function deleteTopping(id: string) {
  await api.delete(`/admin/toppings/${id}`);
}

// Tables
export async function fetchAdminTables() {
  const { data } = await api.get("/admin/tables");
  return data as AdminTable[];
}

export async function createTable(payload: { code: string }) {
  const { data } = await api.post("/admin/tables", payload);
  return data as AdminTable;
}

export async function createTablesBatch(payload: { prefix: string; start: number; end: number; padding: number }) {
  const { data } = await api.post("/admin/tables/batch", payload);
  return data as AdminTable[];
}

export async function updateTable(id: string, payload: { code?: string; is_active?: boolean }) {
  const { data } = await api.put(`/admin/tables/${id}`, payload);
  return data as AdminTable;
}

export async function deleteTable(id: string) {
  await api.delete(`/admin/tables/${id}`);
}

// Staff
export async function fetchAdminStaff() {
  const { data } = await api.get("/admin/staff");
  return data as AdminStaff[];
}

export async function createStaff(payload: { staff_code: string; name: string; pin: string }) {
  const { data } = await api.post("/admin/staff", payload);
  return data as AdminStaff;
}

export async function updateStaff(id: string, name: string) {
  const { data } = await api.put(`/admin/staff/${id}`, null, { params: { name } });
  return data as AdminStaff;
}

export async function toggleStaffActive(id: string) {
  const { data } = await api.patch(`/admin/staff/${id}/toggle-active`);
  return data as { id: string; is_active: boolean };
}

export async function resetStaffPin(id: string, pin: string) {
  const { data } = await api.post(`/admin/staff/${id}/reset-pin`, { pin });
  return data;
}

export async function deleteStaff(id: string) {
  await api.delete(`/admin/staff/${id}`);
}

// Orders
export async function fetchAdminOrders(params?: { status?: string; limit?: number; offset?: number }) {
  const { data } = await api.get("/admin/orders", { params });
  return data as { orders: AdminOrder[]; total: number };
}

// Settings
export async function fetchSettings() {
  const { data } = await api.get("/admin/settings");
  return data as Settings;
}

export async function updateSettings(payload: Partial<Settings>) {
  const { data } = await api.put("/admin/settings", payload);
  return data as Settings;
}

// ─── Types ───
export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryPayload {
  name: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface AdminProduct {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_available: boolean;
  has_sugar_option: boolean;
  has_ice_option: boolean;
  sort_order: number;
  primary_image_url: string | null;
  primary_image_id: string | null;
  variants: { id: string; size: string; price: number; is_default: boolean }[];
  toppings: { id: string; name: string }[];
  updated_at: string;
}

export interface ProductPayload {
  category_id: string;
  name: string;
  description?: string;
  is_available?: boolean;
  has_sugar_option?: boolean;
  has_ice_option?: boolean;
  variant_prices: Record<string, number>;
  topping_ids?: string[];
  sort_order?: number;
}

export interface AdminTopping {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
  updated_at: string;
}

export interface ToppingPayload {
  name: string;
  price: number;
  is_available?: boolean;
}

export interface AdminTable {
  id: string;
  code: string;
  is_active: boolean;
  qr_url?: string | null;
}

export interface AdminStaff {
  id: string;
  staff_code: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  order_code: string;
  table_code: string | null;
  status: string;
  payment_method: string;
  total_amount: number;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  item_count: number;
}

export interface Settings {
  shop_name: string;
  shop_phone: string;
  shop_address: string;
  bank_name: string;
  bank_bin: string;
  bank_account_no: string;
  bank_account_name: string;
  bank_branch: string;
}
