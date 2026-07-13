// API functions for menu

import api from "./client";
import type { Category, Product } from "@/types/menu";

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get("/menu/categories");
  return data;
}

export async function fetchProducts(params?: {
  category_slug?: string;
  search?: string;
  available_only?: boolean;
}): Promise<Product[]> {
  const { data } = await api.get("/menu/products", { params });
  return data;
}

export async function fetchProduct(slug: string): Promise<Product> {
  const { data } = await api.get(`/menu/products/${slug}`);
  return data;
}
