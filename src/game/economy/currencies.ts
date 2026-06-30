/*
 * Currency definitions — Horolith Game Bible, Chapter 6 (monnaies).
 */

export type CurrencyId = "sceaux" | "lingots";

export const CURRENCIES: Record<CurrencyId, { name: string; isPremium: boolean }> = {
  sceaux: { name: "Sceaux", isPremium: false },
  lingots: { name: "Lingots", isPremium: true },
};

// 1 Coffret = 100 Sceaux or 100 Lingots (canon: "Taux simple. Aucun calcul bizarre.")
export const PACK_PRICE_SCEAUX = 100;
export const PACK_PRICE_LINGOTS = 100;

// Daily free Coffret: 1 every 24 h, never stockable beyond 2.
export const DAILY_PACK_INTERVAL_HOURS = 24;
export const DAILY_PACK_MAX_STORED = 2;
