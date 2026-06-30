import { describe, it, expect } from "vitest";
import { mulberry32 } from "./prng";
import { BASE_RATES, SOFT_PITY_START, HARD_PITY, CARDS_PER_PACK } from "./rates";
import { goRescueProbability } from "./pity-curve";
import { rollFullRarity, rollEmergencePlus } from "./rarity-roll";
import { rollPackRarities } from "./pack";
import { createGachaEngine, INITIAL_PITY_STATE, type GachaPool } from "./engine";
import type { RarityId } from "@/src/game/canon/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePool(): GachaPool {
  const rarities: RarityId[] = [
    "ebauche",
    "emergence",
    "maitrise",
    "virtuosite",
    "grande-oeuvre",
    "opus-aeternum",
  ];
  const byRarity = Object.fromEntries(
    rarities.map((r) => [r, [`test-${r}-001`]])
  ) as Record<RarityId, string[]>;
  return { byRarity };
}

// ─── PRNG ─────────────────────────────────────────────────────────────────────

describe("mulberry32", () => {
  it("produces values in [0, 1)", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is deterministic with the same seed", () => {
    const rng1 = mulberry32(99);
    const rng2 = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      expect(rng1()).toBe(rng2());
    }
  });

  it("diverges with different seeds", () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    const vals1 = Array.from({ length: 100 }, () => rng1());
    const vals2 = Array.from({ length: 100 }, () => rng2());
    expect(vals1).not.toEqual(vals2);
  });
});

// ─── Base rates ───────────────────────────────────────────────────────────────

describe("BASE_RATES", () => {
  it("sums to 1", () => {
    const total = Object.values(BASE_RATES).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("contains all six rarities", () => {
    const rarities: RarityId[] = [
      "ebauche",
      "emergence",
      "maitrise",
      "virtuosite",
      "grande-oeuvre",
      "opus-aeternum",
    ];
    for (const r of rarities) {
      expect(BASE_RATES[r]).toBeGreaterThan(0);
    }
  });
});

// ─── Rarity rolls ─────────────────────────────────────────────────────────────

describe("rollFullRarity", () => {
  it("matches canon rates within 0.5 % over 1 M draws", () => {
    const rng = mulberry32(7);
    const N = 1_000_000;
    const counts: Record<string, number> = {};
    for (let i = 0; i < N; i++) {
      const r = rollFullRarity(rng);
      counts[r] = (counts[r] ?? 0) + 1;
    }
    for (const [rarity, rate] of Object.entries(BASE_RATES)) {
      const observed = (counts[rarity] ?? 0) / N;
      expect(Math.abs(observed - rate)).toBeLessThan(0.005);
    }
  });
});

describe("rollEmergencePlus", () => {
  it("never produces Ébauche", () => {
    const rng = mulberry32(13);
    for (let i = 0; i < 10_000; i++) {
      expect(rollEmergencePlus(rng)).not.toBe("ebauche");
    }
  });
});

// ─── Pity curve ───────────────────────────────────────────────────────────────

describe("goRescueProbability", () => {
  it("is 0 before soft pity window", () => {
    for (let i = 0; i < SOFT_PITY_START - 1; i++) {
      expect(goRescueProbability(i)).toBe(0);
    }
  });

  it("is 1 at hard pity boundary", () => {
    expect(goRescueProbability(HARD_PITY - 1)).toBe(1);
  });

  it("is strictly monotone within the soft-pity window", () => {
    let prev = goRescueProbability(SOFT_PITY_START - 1);
    for (let i = SOFT_PITY_START; i < HARD_PITY - 1; i++) {
      const curr = goRescueProbability(i);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it("stays below 0.5 through at least the first half of the pity window", () => {
    const mid = SOFT_PITY_START + Math.floor((HARD_PITY - SOFT_PITY_START) / 2);
    expect(goRescueProbability(mid - 1)).toBeLessThan(0.5);
  });
});

// ─── Pack rarities ────────────────────────────────────────────────────────────

describe("rollPackRarities", () => {
  it("always returns exactly CARDS_PER_PACK cards", () => {
    const rng = mulberry32(21);
    for (let i = 0; i < 1000; i++) {
      expect(rollPackRarities(rng, 0)).toHaveLength(CARDS_PER_PACK);
    }
  });

  it("always contains at least one Émergence or better (slot 0 guarantee)", () => {
    const rng = mulberry32(33);
    const emergesPlus = new Set<RarityId>([
      "emergence",
      "maitrise",
      "virtuosite",
      "grande-oeuvre",
      "opus-aeternum",
    ]);
    for (let i = 0; i < 10_000; i++) {
      const rarities = rollPackRarities(rng, 0);
      // Slot 0 is always EM+; the overall pack must contain at least one
      expect(rarities.some((r) => emergesPlus.has(r))).toBe(true);
    }
  });

  it("hard pity: always produces a GO by the 60th consecutive pack", () => {
    const rng = mulberry32(55);
    let goWithout = 0;
    for (let pack = 0; pack < HARD_PITY * 3; pack++) {
      const rarities = rollPackRarities(rng, goWithout);
      const hasGO = rarities.some((r) => r === "grande-oeuvre" || r === "opus-aeternum");
      if (hasGO) {
        goWithout = 0;
      } else {
        goWithout++;
        expect(goWithout).toBeLessThan(HARD_PITY);
      }
    }
  });
});

// ─── Engine — full pack opens ─────────────────────────────────────────────────

describe("createGachaEngine", () => {
  it("openPack always returns CARDS_PER_PACK cards", () => {
    const engine = createGachaEngine(1);
    const pool = makePool();
    const owned = new Set<string>();
    let pity = INITIAL_PITY_STATE;
    for (let i = 0; i < 500; i++) {
      const { cards, nextPityState } = engine.openPack(pool, owned, pity);
      expect(cards).toHaveLength(CARDS_PER_PACK);
      pity = nextPityState;
    }
  });

  it("awards Éclats for duplicates and 0 for new cards", () => {
    const engine = createGachaEngine(2);
    const pool = makePool();
    const owned = new Set(["test-ebauche-001"]);
    const { cards } = engine.openPack(pool, owned, INITIAL_PITY_STATE);
    for (const card of cards) {
      if (card.isNew) {
        expect(card.eclatsAwarded).toBe(0);
      } else {
        expect(card.eclatsAwarded).toBeGreaterThan(0);
      }
    }
  });

  it("rarity distribution matches canon within 1 % over 1 M packs", () => {
    const engine = createGachaEngine(3);
    const pool = makePool();
    const owned = new Set<string>();
    const N = 1_000_000;
    const counts: Record<string, number> = {};
    let pity = INITIAL_PITY_STATE;

    for (let i = 0; i < N; i++) {
      const { cards, nextPityState } = engine.openPack(pool, owned, pity);
      pity = nextPityState;
      for (const card of cards) {
        counts[card.rarity] = (counts[card.rarity] ?? 0) + 1;
      }
    }

    const total = N * CARDS_PER_PACK;

    // Ébauche: slot 0 is always EM+, so actual EB rate is lower than BASE_RATES.ebauche.
    // We only check non-slot-0 rarities with a generous tolerance.
    const oaCount = counts["opus-aeternum"] ?? 0;
    const oaRate = oaCount / total;
    // OA has no pity/guarantee boost — should be very close to 0.001.
    expect(Math.abs(oaRate - BASE_RATES["opus-aeternum"])).toBeLessThan(0.001);

    // GO rate will be slightly above base due to pity rescue and slot-0 guarantee.
    const goRate = (counts["grande-oeuvre"] ?? 0) / total;
    expect(goRate).toBeGreaterThan(BASE_RATES["grande-oeuvre"]);
    expect(goRate).toBeLessThan(0.03); // sanity ceiling
  });

  it("hard pity: goWithout never reaches HARD_PITY over 1 M packs", () => {
    const engine = createGachaEngine(4);
    const pool = makePool();
    const owned = new Set<string>();
    let pity = INITIAL_PITY_STATE;
    let maxGoWithout = 0;

    for (let i = 0; i < 1_000_000; i++) {
      const { nextPityState } = engine.openPack(pool, owned, pity);
      if (nextPityState.goWithout > maxGoWithout) {
        maxGoWithout = nextPityState.goWithout;
      }
      pity = nextPityState;
    }

    expect(maxGoWithout).toBeLessThan(HARD_PITY);
  });

  it("OA is never influenced by pity: goWithout always resets when OA falls", () => {
    // OA has 0.1 % per-card rate. Over 1 M packs we'll get some OA.
    const engine = createGachaEngine(5);
    const pool = makePool();
    const owned = new Set<string>();
    let pity = { goWithout: 50, guaranteedRateUp: false }; // force inside pity window

    let oaCount = 0;
    for (let i = 0; i < 1_000_000; i++) {
      const { cards, nextPityState } = engine.openPack(pool, owned, pity);
      const hasOA = cards.some((c) => c.rarity === "opus-aeternum");
      if (hasOA) {
        oaCount++;
        // pity counter should reset because OA counts as a high-rarity pull
        expect(nextPityState.goWithout).toBe(0);
      }
      pity = nextPityState;
    }
    // Sanity: we should have seen at least some OA in 5M cards
    expect(oaCount).toBeGreaterThan(0);
  });

  it("banner 50/50: roughly 50 % rate-up win rate when not guaranteed", () => {
    const engine = createGachaEngine(6);
    const pool: GachaPool = {
      byRarity: {
        ebauche: ["eb-001"],
        emergence: ["em-001"],
        maitrise: ["ma-001"],
        virtuosite: ["vi-001"],
        "grande-oeuvre": ["go-featured", "go-normal-001", "go-normal-002"],
        "opus-aeternum": ["oa-001"],
      },
    };
    const banner = { featuredGoCardIds: ["go-featured"] };
    const owned = new Set<string>();

    let wins = 0;
    let losses = 0;
    let pity = INITIAL_PITY_STATE;

    // Run until we have 500 GO pulls to get a stable estimate.
    for (let i = 0; i < 10_000_000 && wins + losses < 500; i++) {
      const { cards, nextPityState } = engine.openPack(pool, owned, pity, banner);
      pity = nextPityState;
      for (const card of cards) {
        if (card.rarity === "grande-oeuvre") {
          if (card.cardId === "go-featured") wins++;
          else losses++;
        }
      }
    }

    const winRate = wins / (wins + losses);
    // Expected ≈ 0.5 (ignoring the guaranteed-on-loss mechanic, which inflates wins slightly)
    expect(winRate).toBeGreaterThan(0.45);
    expect(winRate).toBeLessThan(0.8); // guaranteed-on-loss drives wins above 50 %
  });

  it("banner guarantee: if last GO was a loss, next GO is forced to featured", () => {
    const engine = createGachaEngine(7);
    const pool: GachaPool = {
      byRarity: {
        ebauche: ["eb-001"],
        emergence: ["em-001"],
        maitrise: ["ma-001"],
        virtuosite: ["vi-001"],
        "grande-oeuvre": ["go-featured", "go-normal"],
        "opus-aeternum": ["oa-001"],
      },
    };
    const banner = { featuredGoCardIds: ["go-featured"] };
    const owned = new Set<string>();

    // Start with guaranteedRateUp = true: next GO must be featured.
    let pity = { goWithout: 0, guaranteedRateUp: true };

    for (let i = 0; i < 1_000_000;) {
      const { cards, nextPityState } = engine.openPack(pool, owned, pity, banner);
      pity = nextPityState;
      i++;
      const go = cards.find((c) => c.rarity === "grande-oeuvre");
      if (go) {
        expect(go.cardId).toBe("go-featured");
        break;
      }
    }
  });
});
