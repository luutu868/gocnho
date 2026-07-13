// Menu data & rules — đồng bộ với PRD Section ① Feature 1
// Category colors for placeholder images
export const CATEGORY_COLORS: Record<string, string> = {
  'ca-phe': '#6F4E37',
  'tra': '#C8A951',
  'sinh-to': '#4CAF50',
  'da-xay': '#00BCD4',
  'nuoc-ep': '#FF9800',
  'banh-ngot': '#E91E63',
  'an-nhe': '#FFC107',
};

export const CATEGORY_NAMES: Record<string, string> = {
  'ca-phe': 'Cà phê',
  'tra': 'Trà',
  'sinh-to': 'Sinh tố',
  'da-xay': 'Đá xay',
  'nuoc-ep': 'Nước ép',
  'banh-ngot': 'Bánh ngọt',
  'an-nhe': 'Ăn nhẹ',
};

export const TOPPING_OPTIONS = [
  { name: 'Trân châu đen', price: 7000 },
  { name: 'Kem béo', price: 7000 },
  { name: 'Thạch cà phê', price: 7000 },
  { name: 'Đào miếng', price: 7000 },
  { name: 'Thạch dừa', price: 7000 },
  { name: 'Kem cheese', price: 7000 },
] as const;

import type { SugarLevel, IceLevel } from './constants';
import { ALL_SUGAR_LEVELS, REDUCED_SUGAR_LEVELS, ALL_ICE_LEVELS } from './constants';

export interface CustomizationRule {
  hasSugar: boolean;
  sugarLevels: readonly SugarLevel[];
  hasIce: boolean;
  iceLevels: readonly IceLevel[];
  hasTopping: boolean;
}

// Per-category default rules (from PRD)
const categoryRules: Record<string, CustomizationRule> = {
  'ca-phe': { hasSugar: true, sugarLevels: ALL_SUGAR_LEVELS, hasIce: true, iceLevels: ALL_ICE_LEVELS, hasTopping: false },
  'tra': { hasSugar: true, sugarLevels: ALL_SUGAR_LEVELS, hasIce: true, iceLevels: ALL_ICE_LEVELS, hasTopping: false },
  'sinh-to': { hasSugar: false, sugarLevels: [], hasIce: false, iceLevels: [], hasTopping: false },
  'da-xay': { hasSugar: true, sugarLevels: ALL_SUGAR_LEVELS, hasIce: false, iceLevels: [], hasTopping: false },
  'nuoc-ep': { hasSugar: false, sugarLevels: [], hasIce: true, iceLevels: ALL_ICE_LEVELS, hasTopping: false },
  'banh-ngot': { hasSugar: false, sugarLevels: [], hasIce: false, iceLevels: [], hasTopping: false },
  'an-nhe': { hasSugar: false, sugarLevels: [], hasIce: false, iceLevels: [], hasTopping: false },
};

// Per-product overrides (by product slug)
interface ItemOverride {
  hasSugar?: boolean;
  sugarLevels?: readonly SugarLevel[];
  hasIce?: boolean;
  iceLevels?: readonly IceLevel[];
  hasTopping?: boolean;
}

const itemOverrides: Record<string, ItemOverride> = {
  'ca-phe-trung': { hasIce: false, iceLevels: [] },
  'ca-phe-cot-dua': { hasTopping: true },
  'tra-chanh-mat-ong': { sugarLevels: REDUCED_SUGAR_LEVELS },
  'tra-sua-o-long': { hasTopping: true },
  'tra-sua-matcha': { hasTopping: true },
  'da-xay-ca-phe': { hasTopping: true },
  'da-xay-tra-xanh': { hasTopping: true },
  'da-xay-socola': { hasTopping: true },
  'nuoc-ep-cam-tuoi': { hasSugar: false, sugarLevels: [] },
  'nuoc-ep-dua-hau': { hasSugar: false, sugarLevels: [] },
};

export function getCustomizationRule(categorySlug: string, productSlug: string): CustomizationRule {
  const base = categoryRules[categorySlug] ?? { hasSugar: false, sugarLevels: [], hasIce: false, iceLevels: [], hasTopping: false };
  const override = itemOverrides[productSlug] ?? {};
  return {
    hasSugar: override.hasSugar ?? base.hasSugar,
    sugarLevels: override.sugarLevels ?? base.sugarLevels,
    hasIce: override.hasIce ?? base.hasIce,
    iceLevels: override.iceLevels ?? base.iceLevels,
    hasTopping: override.hasTopping ?? base.hasTopping,
  };
}

// Get slug from category name (for lookup)
export function getCategorySlug(categoryName: string): string {
  const entries = Object.entries(CATEGORY_NAMES);
  for (const [slug, name] of entries) {
    if (name === categoryName) return slug;
  }
  return '';
}
