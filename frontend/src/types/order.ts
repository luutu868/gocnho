// Types cho giỏ hàng & đơn hàng

export interface CartItemOption {
  group_id: string;
  group_name: string;
  option_id: string;
  value: string;
}

export interface CartItemTopping {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;               // unique cart item id (nanoid)
  productId: string;
  productName: string;
  variantId: string;
  variantSize: string;      // "S" | "M" | "L"
  basePrice: number;
  options: CartItemOption[];
  toppings: CartItemTopping[];
  quantity: number;
  note: string;
  totalPrice: number;       // computed: (basePrice + toppings) * quantity
}

export interface OrderInfo {
  code: string;             // "TC-YYYYMMDD-XXXX"
  table: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: "vietqr" | "cash" | null;
  createdAt: string;        // ISO string
}

export interface OrderResponse {
  order_code: string;
  total_amount: number;
  qr_code_data: string | null;
  expires_at: string;
  bank_info: {
    bank_name: string;
    account_no: string;
    account_name: string;
    amount: number;
    description: string;
  } | null;
}
