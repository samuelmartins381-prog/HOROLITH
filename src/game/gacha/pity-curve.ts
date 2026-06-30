/*
 * Soft-pity rescue probability for Grande Œuvre.
 * See docs/adr/ADR-004-pity-curve-formula.md for the formula choice rationale.
 */

import { SOFT_PITY_START, HARD_PITY } from "./rates";

/**
 * Returns the probability that a GO is force-rescued into the current pack,
 * applied only when no GO was naturally drawn.
 *
 * @param goWithout  Number of consecutive packs WITHOUT a GO opened so far.
 *                   The pack currently being opened is the (goWithout + 1)th.
 */
export function goRescueProbability(goWithout: number): number {
  const packNumber = goWithout + 1;
  if (packNumber < SOFT_PITY_START) return 0;
  if (packNumber >= HARD_PITY) return 1;
  // t ∈ [0, 1) across the soft-pity window [40th pack, 59th pack]
  const t = (packNumber - SOFT_PITY_START) / (HARD_PITY - SOFT_PITY_START);
  // Power-4 ease-in: stays near 0 for most of the window, accelerates sharply near HARD_PITY.
  // Makes pity imperceptible until the player is close to the hard-pity boundary.
  return t ** 4;
}
