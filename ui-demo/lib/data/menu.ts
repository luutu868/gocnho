import type { MenuItem, Category, CategoryId, SugarLevel, IceLevel } from '@/lib/types';
import { ALL_SUGAR_LEVELS, REDUCED_SUGAR_LEVELS, ALL_ICE_LEVELS } from '@/lib/types';

// ============================================================
// 22 món - seed data từ PRD v3.0
// ============================================================
export const menuData: MenuItem[] = [
  // ── Cà phê (5) ──
  { id: 1,  name: 'Cà phê đen',         category: 'cafe',     prices: { S: 25000, M: 30000, L: 35000 }, desc: 'Cà phê phin nguyên chất, đậm đà. Dành cho tín đồ cafe truyền thống.', available: true },
  { id: 2,  name: 'Cà phê sữa',         category: 'cafe',     prices: { S: 28000, M: 33000, L: 38000 }, desc: 'Cà phê phin + sữa đặc, vị đắng hậu ngọt — best seller của quán.', available: true },
  { id: 3,  name: 'Bạc xỉu',            category: 'cafe',     prices: { S: 28000, M: 33000, L: 38000 }, desc: 'Sữa nhiều, cà phê ít — dành cho người thích vị nhẹ nhàng, béo thơm.', available: true },
  { id: 4,  name: 'Cà phê trứng',       category: 'cafe',     prices: { M: 38000 },                      desc: 'Cà phê phin phủ kem trứng đánh bông. Không có tùy chọn đá.', available: true },
  { id: 5,  name: 'Cà phê cốt dừa',     category: 'cafe',     prices: { M: 35000, L: 40000 },            desc: 'Cà phê đen + nước cốt dừa béo ngậy, lắc đều trước khi uống.', available: true },
  // ── Trà (5) ──
  { id: 6,  name: 'Trà đào',            category: 'tra',      prices: { M: 35000, L: 40000 },            desc: 'Trà đen + đào ngâm, thanh mát, thơm dịu.', available: true },
  { id: 7,  name: 'Trà vải',            category: 'tra',      prices: { M: 35000, L: 40000 },            desc: 'Trà xanh + vải ngâm, ngọt thanh tự nhiên.', available: true },
  { id: 8,  name: 'Trà chanh mật ong',  category: 'tra',      prices: { M: 30000, L: 35000 },            desc: 'Trà đen + chanh tươi + mật ong. Chỉ 3 mức đường — không có 70%, 100%.', available: true },
  { id: 9,  name: 'Trà sữa ô long',     category: 'tra',      prices: { S: 32000, M: 38000, L: 42000 },  desc: 'Trà ô long + sữa tươi, thơm tự nhiên, không dùng bột pha sẵn.', available: true },
  { id: 10, name: 'Trà sữa matcha',     category: 'tra',      prices: { M: 40000, L: 45000 },            desc: 'Matcha Nhật + sữa tươi, màu xanh đẹp, vị chát nhẹ hậu ngọt.', available: true },
  // ── Sinh tố (3) ──
  { id: 11, name: 'Sinh tố bơ',         category: 'sinhto',   prices: { M: 40000, L: 45000 },            desc: 'Bơ sáp + sữa đặc + đá xay mịn. Chỉ chọn size, không chọn đường/đá.', available: true },
  { id: 12, name: 'Sinh tố xoài',       category: 'sinhto',   prices: { M: 38000, L: 43000 },            desc: 'Xoài chín tươi + sữa chua + đá xay.', available: true },
  { id: 13, name: 'Sinh tố dâu',        category: 'sinhto',   prices: { M: 40000, L: 45000 },            desc: 'Dâu tây Đà Lạt + sữa đặc + đá xay.', available: true },
  // ── Đá xay (3) ──
  { id: 14, name: 'Đá xay cà phê',      category: 'daxay',    prices: { M: 42000, L: 47000 },            desc: 'Cà phê + đá xay như đá bào, uống mát lạnh ngày nóng.', available: true },
  { id: 15, name: 'Đá xay trà xanh',    category: 'daxay',    prices: { M: 42000, L: 47000 },            desc: 'Trà xanh matcha + sữa + đá xay mịn.', available: true },
  { id: 16, name: 'Đá xay socola',      category: 'daxay',    prices: { M: 42000, L: 47000 },            desc: 'Socola đen + sữa + đá xay, vị đắng nhẹ của cacao.', available: true },
  // ── Nước ép (3) ──
  { id: 17, name: 'Nước ép cam tươi',   category: 'nuocep',   prices: { M: 35000, L: 40000 },            desc: 'Cam tươi vắt nguyên chất, không đường, không nước pha.', available: true },
  { id: 18, name: 'Nước ép ổi',         category: 'nuocep',   prices: { M: 30000, L: 35000 },            desc: 'Ổi ruột đỏ tươi ép lấy nước, thơm mát.', available: true },
  { id: 19, name: 'Nước ép dưa hấu',    category: 'nuocep',   prices: { M: 30000, L: 35000 },            desc: 'Dưa hấu tươi ép nguyên chất, ngọt tự nhiên.', available: true },
  // ── Bánh ngọt (2) ──
  { id: 20, name: 'Bánh flan',          category: 'banhngot', prices: { '1 size': 15000 },               desc: 'Caramel flan béo mịn, làm từ trứng + sữa tươi.', available: true },
  { id: 21, name: 'Tiramisu',           category: 'banhngot', prices: { '1 size': 30000 },               desc: 'Tiramisu chuẩn vị Ý: cà phê + mascarpone + bột cacao.', available: true },
  // ── Ăn nhẹ (1) ──
  { id: 22, name: 'Bánh mì nướng muối ớt', category: 'annhe', prices: { '1 size': 20000 },             desc: 'Bánh mì giòn tan phết bơ + muối ớt, nướng nóng hổi.', available: true },
];

// ============================================================
// Màu placeholder theo đúng PRD (Section Feature 1 - bảng màu)
// ============================================================
export const categoryColors: Record<CategoryId, string> = {
  cafe:     '#6F4E37',  // nâu cafe
  tra:      '#C8A951',  // vàng trà
  sinhto:   '#4CAF50',  // xanh lá
  daxay:    '#00BCD4',  // xanh cyan
  nuocep:   '#FF9800',  // cam
  banhngot: '#E91E63',  // hồng
  annhe:    '#FFC107',  // vàng hổ phách
};

// Category list cho UI (màu trong này là màu cho category badge, không phải placeholder)
export const categories: Category[] = [
  { id: 'all',      name: 'Tất cả',     color: '#D97706' },
  { id: 'cafe',     name: 'Cà phê',     color: '#6F4E37' },
  { id: 'tra',      name: 'Trà',        color: '#C8A951' },
  { id: 'sinhto',   name: 'Sinh tố',    color: '#4CAF50' },
  { id: 'daxay',    name: 'Đá xay',     color: '#00BCD4' },
  { id: 'nuocep',   name: 'Nước ép',    color: '#FF9800' },
  { id: 'banhngot', name: 'Bánh ngọt',  color: '#E91E63' },
  { id: 'annhe',    name: 'Ăn nhẹ',     color: '#FFC107' },
];

// ============================================================
// Quy tắc tùy chỉnh theo danh mục (PRD Section Feature 1)
// ============================================================

export interface CustomizationRule {
  hasSugar: boolean;
  sugarLevels: SugarLevel[];       // danh sách mức đường khả dụng
  hasIce: boolean;
  iceLevels: IceLevel[];           // danh sách mức đá khả dụng
  hasTopping: boolean;             // tổng thể: danh mục này có hỗ trợ topping không
}

// Định nghĩa quy tắc mặc định cho từng danh mục
const categoryRules: Record<CategoryId, CustomizationRule> = {
  // Cà phê, Trà: luôn có Đường + Đá (trừ Cà phê trứng không đá → override theo item)
  cafe:     { hasSugar: true,  sugarLevels: ALL_SUGAR_LEVELS,  hasIce: true,  iceLevels: ALL_ICE_LEVELS, hasTopping: false },
  tra:      { hasSugar: true,  sugarLevels: ALL_SUGAR_LEVELS,  hasIce: true,  iceLevels: ALL_ICE_LEVELS, hasTopping: false },
  // Sinh tố: không có tùy chọn Đường/Đá
  sinhto:   { hasSugar: false, sugarLevels: [],                hasIce: false, iceLevels: [],              hasTopping: false },
  // Đá xay: không có tùy chọn Đá (luôn có đá), có Đường
  daxay:    { hasSugar: true,  sugarLevels: ALL_SUGAR_LEVELS,  hasIce: false, iceLevels: [],              hasTopping: false },
  // Nước ép: tùy món (cam, dưa hấu — không đường; ổi — có đường) → override theo item
  nuocep:   { hasSugar: false, sugarLevels: [],                hasIce: true,  iceLevels: ALL_ICE_LEVELS,  hasTopping: false },
  // Bánh ngọt, Ăn nhẹ: không tùy chỉnh gì, chỉ 1 size
  banhngot: { hasSugar: false, sugarLevels: [],                hasIce: false, iceLevels: [],              hasTopping: false },
  annhe:    { hasSugar: false, sugarLevels: [],                hasIce: false, iceLevels: [],              hasTopping: false },
};

// Item-level overrides (cho các món đặc biệt)
interface ItemOverride {
  hasSugar?: boolean;
  sugarLevels?: SugarLevel[];
  hasIce?: boolean;
  iceLevels?: IceLevel[];
  hasTopping?: boolean;
}

const itemOverrides: Record<number, ItemOverride> = {
  // Cà phê trứng: không có tùy chọn đá
  4:  { hasIce: false, iceLevels: [] },
  // Cà phê cốt dừa: có topping (Kem béo)
  5:  { hasTopping: true },
  // Trà chanh mật ong: chỉ 3 mức đường (0/30/50)
  8:  { sugarLevels: REDUCED_SUGAR_LEVELS },
  // Trà sữa ô long: có topping
  9:  { hasTopping: true },
  // Trà sữa matcha: có topping
  10: { hasTopping: true },
  // Nước ép cam: không đường
  17: { hasSugar: false, sugarLevels: [] },
  // Nước ép dưa hấu: không đường
  19: { hasSugar: false, sugarLevels: [] },
  // Đá xay cà phê: có topping
  14: { hasTopping: true },
  // Đá xay trà xanh: có topping
  15: { hasTopping: true },
  // Đá xay socola: có topping (Kem béo)
  16: { hasTopping: true },
};

export function getCustomizationRule(item: MenuItem): CustomizationRule {
  const base = categoryRules[item.category];
  const override = itemOverrides[item.id] || {};
  return {
    hasSugar: override.hasSugar ?? base.hasSugar,
    sugarLevels: override.sugarLevels ?? base.sugarLevels,
    hasIce: override.hasIce ?? base.hasIce,
    iceLevels: override.iceLevels ?? base.iceLevels,
    hasTopping: override.hasTopping ?? base.hasTopping,
  };
}

// ============================================================
// Topping (PRD: mỗi loại +7,000đ)
// ============================================================
export interface ToppingOption {
  name: string;
  price: number;
}

export const TOPPING_OPTIONS: ToppingOption[] = [
  { name: 'Trân châu đen', price: 7000 },
  { name: 'Kem béo',       price: 7000 },
  { name: 'Thạch cà phê',  price: 7000 },
  { name: 'Đào miếng',     price: 7000 },
  { name: 'Thạch dừa',     price: 7000 },
  { name: 'Kem cheese',    price: 7000 },
];
