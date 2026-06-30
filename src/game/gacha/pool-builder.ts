import { SEED_CARDS } from "@/src/game/canon/seed-cards";
import type { RarityId } from "@/src/game/canon/types";
import type { GachaPool } from "./engine";

function buildPool(): GachaPool {
  const byRarity: Record<RarityId, string[]> = {
    ebauche: [],
    emergence: [],
    maitrise: [],
    virtuosite: [],
    "grande-oeuvre": [],
    "opus-aeternum": [],
  };
  for (const card of SEED_CARDS) {
    byRarity[card.rarity].push(card.id);
  }
  return { byRarity };
}

export const GACHA_POOL: GachaPool = buildPool();
