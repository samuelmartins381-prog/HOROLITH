import type { RarityId } from "@/src/game/canon/types";
import type { Prng } from "./prng";
import { BASE_RATES } from "./rates";

// Descending rarity order for threshold comparison (rarest first).
const FULL_ORDER: RarityId[] = [
  "opus-aeternum",
  "grande-oeuvre",
  "virtuosite",
  "maitrise",
  "emergence",
  "ebauche",
];

export function rollFullRarity(rng: Prng): RarityId {
  const r = rng();
  let cumulative = 0;
  for (const rarity of FULL_ORDER) {
    cumulative += BASE_RATES[rarity];
    if (r < cumulative) return rarity;
  }
  return "ebauche";
}

// Rarities eligible for the guaranteed Émergence-or-better slot.
const EMERGENCE_PLUS_ORDER: RarityId[] = [
  "opus-aeternum",
  "grande-oeuvre",
  "virtuosite",
  "maitrise",
  "emergence",
];

const TOTAL_EMERGENCE_PLUS = EMERGENCE_PLUS_ORDER.reduce(
  (sum, r) => sum + BASE_RATES[r],
  0
);

// Conditional roll preserving relative weights among EM+ rarities.
export function rollEmergencePlus(rng: Prng): RarityId {
  const r = rng() * TOTAL_EMERGENCE_PLUS;
  let cumulative = 0;
  for (const rarity of EMERGENCE_PLUS_ORDER) {
    cumulative += BASE_RATES[rarity];
    if (r < cumulative) return rarity;
  }
  return "emergence";
}
