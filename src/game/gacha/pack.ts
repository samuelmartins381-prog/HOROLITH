import type { RarityId } from "@/src/game/canon/types";
import type { Prng } from "./prng";
import { CARDS_PER_PACK } from "./rates";
import { goRescueProbability } from "./pity-curve";
import { rollFullRarity, rollEmergencePlus } from "./rarity-roll";

// Ascending rarity order used to find the lowest-tier card when rescuing a GO.
const RARITY_TIER: Record<RarityId, number> = {
  ebauche: 0,
  emergence: 1,
  maitrise: 2,
  virtuosite: 3,
  "grande-oeuvre": 4,
  "opus-aeternum": 5,
};

function lowestRarityIndex(rarities: RarityId[]): number {
  let minTier = 6;
  let minIdx = 0;
  for (let i = 0; i < rarities.length; i++) {
    const tier = RARITY_TIER[rarities[i]!];
    if (tier < minTier) {
      minTier = tier;
      minIdx = i;
    }
  }
  return minIdx;
}

/**
 * Rolls the rarities for one pack.
 *
 * Guarantees:
 *  - Slot 0 is always Émergence or better.
 *  - Soft/hard pity ensures a Grande Œuvre is force-rescued when no GO fell naturally
 *    and the rescue probability (derived from goWithout) is met.
 *  - Opus Aeternum is never pity-rescued; its 0.1 % rate is always flat and independent.
 *
 * @param rng       Seeded PRNG. Consumed in place.
 * @param goWithout Consecutive packs WITHOUT a Grande Œuvre opened before this one.
 */
export function rollPackRarities(rng: Prng, goWithout: number): RarityId[] {
  const rarities: RarityId[] = [rollEmergencePlus(rng)];
  for (let i = 1; i < CARDS_PER_PACK; i++) {
    rarities.push(rollFullRarity(rng));
  }

  const hasGO = rarities.some((r) => r === "grande-oeuvre" || r === "opus-aeternum");

  if (!hasGO) {
    const rescue = goRescueProbability(goWithout);
    if (rescue > 0 && rng() < rescue) {
      rarities[lowestRarityIndex(rarities)] = "grande-oeuvre";
    }
  }

  return rarities;
}
