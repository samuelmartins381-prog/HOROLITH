/*
 * Éclats — duplicate conversion rates and craft costs.
 * Canon source: Horolith Game Bible, Chapters 5 & 9.
 *
 * Opus Aeternum creations are NEVER craftable (canon: "Les Opus Aeternum ne sont jamais craftables").
 */

import type { RarityId } from "@/src/game/canon/types";

export const DUPLICATE_ECLATS: Record<RarityId, number> = {
  ebauche: 5,
  emergence: 15,
  maitrise: 50,
  virtuosite: 150,
  "grande-oeuvre": 500,
  "opus-aeternum": 2000,
};

// null = uncraftable (Opus Aeternum)
export const CRAFT_COST: Record<RarityId, number | null> = {
  ebauche: 100,
  emergence: 300,
  maitrise: 1000,
  virtuosite: 4000,
  "grande-oeuvre": 12000,
  "opus-aeternum": null,
};

export function eclatsForDuplicate(rarity: RarityId): number {
  return DUPLICATE_ECLATS[rarity];
}

export function canCraft(rarity: RarityId): boolean {
  return CRAFT_COST[rarity] !== null;
}

export function craftCost(rarity: RarityId): number | null {
  return CRAFT_COST[rarity];
}
