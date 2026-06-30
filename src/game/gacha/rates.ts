/*
 * Canon drop rates — Horolith Game Bible, Chapter 1 (economy).
 * These values are immutable canon. Do not alter without a Game Bible revision.
 */

import type { RarityId } from "@/src/game/canon/types";

export const BASE_RATES: Record<RarityId, number> = {
  ebauche: 0.56,
  emergence: 0.28,
  maitrise: 0.11,
  virtuosite: 0.038,
  "grande-oeuvre": 0.011,
  "opus-aeternum": 0.001,
};

export const CARDS_PER_PACK = 5;

// Pity applies only to Grande Œuvre (never to Opus Aeternum).
export const SOFT_PITY_START = 40; // 1-indexed: pity ramps from the 40th consecutive pack without GO
export const HARD_PITY = 60; // 1-indexed: the 60th consecutive pack without GO is guaranteed to contain one
