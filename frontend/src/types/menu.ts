// Types cho menu — đồng bộ với backend schemas/menu.py

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id?: string;
  size: string;
  price: number;
  is_default: boolean;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
  is_available: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_available: boolean;
  has_sugar_option: boolean;
  has_ice_option: boolean;
  sort_order: number;
  created_at?: string;
  category?: Category | null;
  primary_image?: ProductImage | null;
  variants: ProductVariant[];
  toppings: Topping[];
}
