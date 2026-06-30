# ADR-004 — Soft-pity curve formula for Grande Œuvre

## Problème

The Game Bible specifies that soft pity for Grande Œuvre begins at the 40th consecutive pack without a GO and increases progressively until the 60th (hard pity, guaranteed). The user's exact wording: _"Courbe exponentielle douce. Le joueur ne doit jamais 'voir' le pity. Il doit seulement sentir qu'il a de la chance."_

The Bible does not prescribe the mathematical formula. This is an engineering decision.

## Contraintes

1. **Invisible**: The curve must stay imperceptibly close to the natural GO rate for most of the pity window (40–59 packs).
2. **Hard boundary**: The function must return exactly 1 at pack 60 (hard pity guarantee).
3. **Natural rate preserved**: Outside the pity window, the per-card GO rate must remain exactly 1.1 % (the canonical base rate).
4. **Deterministic**: The formula must produce the same output for the same input, with no external state.

## Technique d'implémentation : "Conditional Rescue"

Rather than modifying per-card probabilities, the engine:

1. Rolls 5 cards at full natural rates.
2. If no GO fell naturally **and** we are in the pity window, applies a single "rescue" check with probability `goRescueProbability(goWithout)`.
3. If the rescue triggers, the lowest-rarity card in the pack is upgraded to Grande Œuvre.

This technique preserves the exact 1.1 % per-card rate outside the pity window (verified by total-probability law: rescue probability is 0 when `packNumber < SOFT_PITY_START`).

## Options envisagées

### Option A — Cubic ease-out: `1 - (1 - t)³`

- At t = 0.5: 87.5 % rescue. Far too visible at mid-window.

### Option B — True normalised exponential: `(e^(kt) - 1) / (e^k - 1)`

- At t = 0.5 with k = 5: ~6.9 % rescue. Invisible in the first half, then accelerates.
- More complex to implement and explain; same empirical shape as Option C.

### Option C — Power ease-in: `t⁴` ← **retenu**

- At t = 0.5 (50th pack): 6.25 % rescue. Effectively invisible.
- At t = 0.95 (59th pack): 81.5 % rescue. Strong incentive before hard pity.
- Simpler formula, no floating-point edge cases, same perceptual shape as Option B.

## Décision

**Option C — `t⁴`**, where `t = (packNumber - SOFT_PITY_START) / (HARD_PITY - SOFT_PITY_START)`.

```
packNumber  t       rescue prob
40          0.000   0.0 %     ← invisible
45          0.250   0.4 %     ← invisible
50          0.500   6.3 %     ← barely perceptible
55          0.750   31.6 %    ← player "feels lucky"
59          0.950   81.5 %    ← very likely
60          —       100 %     ← hard pity (explicit guard)
```

The player perceives an apparent streak of luck around the 55th–59th pack, exactly matching _"Il doit seulement sentir qu'il a de la chance."_ The mechanism remains invisible until the player is very close to the mathematical guarantee.

## Pourquoi les autres options ont été écartées

- **Option A** (cubic ease-out) peaks too early — a player opening 50 consecutive packs without GO and then suddenly getting one every 2–3 packs would clearly _see_ the pity, violating the design intent.
- **Option B** (true exponential) produces an identical perceptual result to Option C with additional implementation complexity. The added complexity buys nothing here.
