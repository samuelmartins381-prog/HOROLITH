import { describe, it, expect } from "vitest";
import {
  DUPLICATE_ECLATS,
  CRAFT_COST,
  eclatsForDuplicate,
  canCraft,
  craftCost,
} from "./eclats";
import type { RarityId } from "@/src/game/canon/types";

const ALL_RARITIES: RarityId[] = [
  "ebauche",
  "emergence",
  "maitrise",
  "virtuosite",
  "grande-oeuvre",
  "opus-aeternum",
];

describe("DUPLICATE_ECLATS", () => {
  it("matches canon values exactly", () => {
    expect(DUPLICATE_ECLATS["ebauche"]).toBe(5);
    expect(DUPLICATE_ECLATS["emergence"]).toBe(15);
    expect(DUPLICATE_ECLATS["maitrise"]).toBe(50);
    expect(DUPLICATE_ECLATS["virtuosite"]).toBe(150);
    expect(DUPLICATE_ECLATS["grande-oeuvre"]).toBe(500);
    expect(DUPLICATE_ECLATS["opus-aeternum"]).toBe(2000);
  });

  it("is strictly increasing by tier", () => {
    const values = ALL_RARITIES.map((r) => DUPLICATE_ECLATS[r]);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]!);
    }
  });
});

describe("CRAFT_COST", () => {
  it("matches canon values exactly", () => {
    expect(CRAFT_COST["ebauche"]).toBe(100);
    expect(CRAFT_COST["emergence"]).toBe(300);
    expect(CRAFT_COST["maitrise"]).toBe(1000);
    expect(CRAFT_COST["virtuosite"]).toBe(4000);
    expect(CRAFT_COST["grande-oeuvre"]).toBe(12000);
    expect(CRAFT_COST["opus-aeternum"]).toBeNull();
  });

  it("Opus Aeternum is never craftable (canon absolute rule)", () => {
    expect(CRAFT_COST["opus-aeternum"]).toBeNull();
    expect(canCraft("opus-aeternum")).toBe(false);
    expect(craftCost("opus-aeternum")).toBeNull();
  });

  it("all other rarities are craftable", () => {
    const craftable: RarityId[] = [
      "ebauche",
      "emergence",
      "maitrise",
      "virtuosite",
      "grande-oeuvre",
    ];
    for (const r of craftable) {
      expect(canCraft(r)).toBe(true);
      expect(craftCost(r)).toBeGreaterThan(0);
    }
  });
});

describe("eclatsForDuplicate", () => {
  it("delegates to DUPLICATE_ECLATS", () => {
    for (const r of ALL_RARITIES) {
      expect(eclatsForDuplicate(r)).toBe(DUPLICATE_ECLATS[r]);
    }
  });
});
