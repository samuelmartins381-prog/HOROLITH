/*
 * Gacha engine — deterministic, seed-able.
 * All rates and pity values must come from canon.
 * Stub — implemented in Phase 3.
 */

export type PullResult = {
  cardId: string;
  rarity: string;
  isNew: boolean;
  shardsAwarded: number;
};

export type GachaConfig = {
  baseRates: Record<string, number>;
  softPityStart: number;
  hardPity: number;
  seed?: number;
};

export type GachaState = {
  pullCount: number;
  pityCounter: number;
  guaranteedRateUp: boolean;
};

// Placeholder — full implementation in Phase 3
export function createGachaEngine(_config: GachaConfig) {
  return {
    pull: (_state: GachaState): PullResult => {
      throw new Error("GachaEngine not yet implemented — Phase 3");
    },
    pullPack: (_state: GachaState, _count: number): PullResult[] => {
      throw new Error("GachaEngine not yet implemented — Phase 3");
    },
  };
}
