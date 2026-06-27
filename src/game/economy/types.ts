/*
 * Economy types — currency names and conversion rates from canon.
 * Stub — implemented in Phase 3.
 */

export type Currency = {
  id: string;
  name: string;
  isPremium: boolean;
};

export type Wallet = {
  currencies: Record<string, number>;
};

export type ShardConversion = {
  cardRarity: string;
  shardsAwarded: number;
};
