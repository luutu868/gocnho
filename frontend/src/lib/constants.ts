// Core constants — đồng bộ với PRD
// Note: CATEGORY_COLORS, CATEGORY_NAMES, TOPPING_OPTIONS live in menu-data.ts

export const SUGAR_LEVELS = ["100%", "70%", "50%", "30%", "0%"] as const;
export type SugarLevel = (typeof SUGAR_LEVELS)[number];

export const ALL_SUGAR_LEVELS: readonly SugarLevel[] = SUGAR_LEVELS;
export const REDUCED_SUGAR_LEVELS: readonly SugarLevel[] = ["50%", "30%", "0%"];

export const ICE_LEVELS = ["Bình thường", "Ít đá", "Không đá"] as const;
export type IceLevel = (typeof ICE_LEVELS)[number];
export const ALL_ICE_LEVELS: readonly IceLevel[] = ICE_LEVELS;

export const API_BASE_URL = "/api/v1";
