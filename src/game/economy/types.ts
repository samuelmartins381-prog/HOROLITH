/*
 * Economy types — Horolith Game Bible, Chapters 5–9.
 */

export type { CurrencyId } from "./currencies";

export type Wallet = {
  sceaux: number;
  lingots: number;
  eclats: number;
};
