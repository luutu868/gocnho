// Types cho Tiệm Cafe Góc Nhỏ - PRD v3.0

export interface MenuItem {
  id: number;
  name: string;
  category: CategoryId;
  prices: Record<string, number>; // { S: 25000, M: 30000, L: 35000 } hoặc { M: 15000 }
  desc: string;
  available: boolean;
}

export type CategoryId = 'cafe' | 'tra' | 'sinhto' | 'daxay' | 'nuocep' | 'banhngot' | 'annhe';

export interface CartItem {
  menuItemId: number;
  name: string;
  size: string;
  price: number;          // giá base theo size (chưa gồm topping)
  quantity: number;
  sugar?: string;         // "0%" | "30%" | "50%" | "70%" | "100%"
  ice?: string;           // "Không đá" | "Ít đá" | "Bình thường"
  toppings: string[];     // tên topping đã chọn
  toppingTotal: number;   // tổng tiền topping = số lượng * 7000
  note?: string;
}

export interface OrderInfo {
  code: string;           // "TC-YYYYMMDD-XXXX"
  table: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'vietqr' | 'cash' | null;
  createdAt: string;      // ISO string
}

export interface Category {
  id: CategoryId | 'all';
  name: string;
  color: string;          // PRD màu placeholder cho danh mục (nền đậm, chữ trắng)
}

// Staff types
export interface StaffAccount {
  code: string;
  name: string;
}

// Admin types
export interface AdminAccount {
  username: string;
  passwordChangedAt: string | null; // null → bắt buộc đổi password
}

// Customization rule bật/tắt cho từng nhóm món
export type SugarLevel = '0%' | '30%' | '50%' | '70%' | '100%';
export type IceLevel = 'Không đá' | 'Ít đá' | 'Bình thường';
export const ALL_SUGAR_LEVELS: SugarLevel[] = ['0%', '30%', '50%', '70%', '100%'];
export const REDUCED_SUGAR_LEVELS: SugarLevel[] = ['0%', '30%', '50%']; // VD: Trà chanh mật ong
export const ALL_ICE_LEVELS: IceLevel[] = ['Không đá', 'Ít đá', 'Bình thường'];
