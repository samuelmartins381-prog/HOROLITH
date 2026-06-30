/*
 * Gacha engine — deterministic, seedable.
 * Canon rates: Horolith Game Bible, Chapters 1–4 (taux, pity, bannière).
 */

import type { RarityId } from "@/src/game/canon/types";
import { mulberry32, type Prng } from "./prng";
import { rollPackRarities } from "./pack";
import { resolveBannerCard, type BannerConfig } from "./banner";
import { DUPLICATE_ECLATS } from "@/src/game/economy/eclats";

export type { BannerConfig };

export type PityState = {
  goWithout: number; // consecutive packs opened without a Grande Œuvre
  guaranteedRateUp: boolean; // next GO is guaranteed to be the banner's featured card
};

export const INITIAL_PITY_STATE: PityState = {
  goWithout: 0,
  guaranteedRateUp: false,
};

export type CardResult = {
  cardId: string;
  rarity: RarityId;
  isNew: boolean;
  eclatsAwarded: number;
};

export type PackResult = {
  cards: CardResult[];
  nextPityState: PityState;
};

export type GachaPool = {
  byRarity: Record<RarityId, string[]>;
};

export function createGachaEngine(seed: number) {
  const rng: Prng = mulberry32(seed);

  function pickRandom(pool: string[]): string {
    if (pool.length === 0) return "";
    return pool[Math.floor(rng() * pool.length)] as string;
  }

  function pickCard(
    pool: GachaPool,
    rarity: RarityId,
    pityState: PityState,
    bannerConfig: BannerConfig | undefined
  ): { cardId: string; nextGuaranteedRateUp: boolean } {
    if (rarity === "grande-oeuvre" && bannerConfig) {
      const goPool = pool.byRarity["grande-oeuvre"];
      const res = resolveBannerCard(
        rng,
        goPool,
        bannerConfig,
        pityState.guaranteedRateUp
      );
      return { cardId: res.cardId, nextGuaranteedRateUp: res.nextGuaranteedRateUp };
    }
    // OA and all other rarities: random pick, no banner influence.
    return {
      cardId: pickRandom(pool.byRarity[rarity]),
      nextGuaranteedRateUp: pityState.guaranteedRateUp,
    };
  }

  return {
    /**
     * Opens one pack and returns the five card results plus the updated pity state.
     * All inputs are read-only; the engine itself is the only mutable object (RNG).
     */
    openPack(
      pool: GachaPool,
      ownedCardIds: ReadonlySet<string>,
      pityState: PityState,
      bannerConfig?: BannerConfig
    ): PackResult {
      const rarities = rollPackRarities(rng, pityState.goWithout);

      let hasGO = false;
      let currentGuaranteed = pityState.guaranteedRateUp;
      const cards: CardResult[] = [];

      for (const rarity of rarities) {
        if (rarity === "grande-oeuvre" || rarity === "opus-aeternum") {
          hasGO = true;
        }

        const { cardId, nextGuaranteedRateUp } = pickCard(
          pool,
          rarity,
          { ...pityState, guaranteedRateUp: currentGuaranteed },
          bannerConfig
        );
        currentGuaranteed = nextGuaranteedRateUp;

        const isNew = !ownedCardIds.has(cardId);
        const eclatsAwarded = isNew ? 0 : DUPLICATE_ECLATS[rarity];
        cards.push({ cardId, rarity, isNew, eclatsAwarded });
      }

      const nextPityState: PityState = {
        goWithout: hasGO ? 0 : pityState.goWithout + 1,
        guaranteedRateUp: currentGuaranteed,
      };

      return { cards, nextPityState };
    },
  };
}
