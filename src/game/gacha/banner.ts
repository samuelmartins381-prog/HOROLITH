/*
 * Banner mechanic — 50/50 with guaranteed rate-up on loss.
 * Applies only to Grande Œuvre. Opus Aeternum is never on banner.
 */

import type { Prng } from "./prng";

export type BannerConfig = {
  featuredGoCardIds: string[];
};

export type BannerResult = {
  cardId: string;
  nextGuaranteedRateUp: boolean;
};

export function resolveBannerCard(
  rng: Prng,
  goPool: string[],
  config: BannerConfig,
  guaranteedRateUp: boolean
): BannerResult {
  const wonRateUp = guaranteedRateUp || rng() < 0.5;

  if (wonRateUp) {
    const featured = config.featuredGoCardIds;
    return {
      cardId: featured[Math.floor(rng() * featured.length)] ?? goPool[0] ?? "",
      nextGuaranteedRateUp: false,
    };
  }

  // Lost 50/50: pick from non-featured GO pool, grant guarantee for next GO.
  const normalPool = goPool.filter((id) => !config.featuredGoCardIds.includes(id));
  const pool = normalPool.length > 0 ? normalPool : goPool;
  return {
    cardId: pool[Math.floor(rng() * pool.length)] ?? "",
    nextGuaranteedRateUp: true,
  };
}
