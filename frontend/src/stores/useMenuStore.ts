// Zustand menu store — cache menu data

import { create } from "zustand";
import type { Category, Product } from "@/types/menu";
import { fetchCategories, fetchProducts } from "@/api/menu";

interface MenuState {
  categories: Category[];
  products: Product[];
  selectedCategory: string | null; // slug, null = "Tất cả"
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  fetchMenu: () => Promise<void>;
  setCategory: (slug: string | null) => void;
  setSearch: (query: string) => void;
  filteredProducts: () => Product[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  products: [],
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  fetchMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const [categories, products] = await Promise.all([
        fetchCategories(),
        fetchProducts(),
      ]);
      set({ categories, products, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load menu",
        isLoading: false,
      });
    }
  },

  setCategory: (slug) => set({ selectedCategory: slug }),

  setSearch: (query) => set({ searchQuery: query }),

  filteredProducts: () => {
    const { products, selectedCategory, searchQuery } = get();
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category?.slug === selectedCategory
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(q)
      );
    }

    return filtered;
  },
}));
