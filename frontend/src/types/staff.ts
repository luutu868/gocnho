// Types cho dashboard nhân viên

export interface StaffOrder {
  id: string;
  order_code: string;
  table_code: string | null;
  status: "confirmed" | "preparing" | "completed" | "done";
  payment_method: "vietqr" | "cash";
  total_amount: number;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  items: StaffOrderItem[];
}

export interface StaffOrderItem {
  id: string;
  product_name: string;
  variant: { size: string; price: number } | null;
  quantity: number;
  unit_price?: number;
  options: { group: string; value: string }[];
  toppings: { name: string; quantity: number; price: number }[];
  note: string | null;
  status: "pending" | "preparing" | "done";
}

export interface StaffSession {
  staff_code: string;
  name: string;
  expiresAt: number;
}
