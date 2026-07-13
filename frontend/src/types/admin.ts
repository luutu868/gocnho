// Types cho admin dashboard

export interface AdminSession {
  username: string;
  token: string;
  expiresAt: number;
}

// Settings (key-value pairs from DB)
export interface ShopSettings {
  shop_name: string;
  shop_phone: string;
  shop_address: string;
  bank_name: string;
  bank_bin: string;
  bank_account_no: string;
  bank_account_name: string;
  bank_branch: string;
}
