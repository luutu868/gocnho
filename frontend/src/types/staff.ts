// Types cho dashboard nhân viên

export interface StaffOrder {
  id: string;
  order_code: string;
  table_code: string;
  status: "confirmed" | "preparing" | "completed" | "done";
  payment_method: "vietqr" | "cash";
  total_amount: number;
  created_at: string;
  items: StaffOrderItem[];
}

export interface StaffOrderItem {
  id: string;
  product_name: string;
  variant: { size: string; price: number };
  quantity: number;
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
