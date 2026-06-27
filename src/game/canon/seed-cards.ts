/*
 * Seed canon — Phase 2.
 * Sources : Horolith Canon Bible Tome I.
 * Complications, architecture, matériaux : tous issus du profil Caelis (houses.ts).
 */
import type { Card } from "./types";

export const SEED_CARDS: Card[] = [
  {
    id: "caelis-go-c01-0001",
    ref: "HRL-C01-GO",
    house: "caelis",
    rarity: "grande-oeuvre",
    name: "Astrolabe Perpétuel",
    project: "Projet IV · Caelis",
    calibre: "Cal. HRL-C420",
    architecture: "orbitale",
    ih: 3850,
    complications: [
      "phases de lune",
      "calendrier perpétuel",
      "équation du temps",
      "temps sidéral",
    ],
    dial: "aventurine",
    serial: 1,
    lore: "Le ciel fut la première horloge. Caelis en garde la mémoire.",
    assets: {
      face2d: "/assets/cards/caelis-go-c01.webp",
    },
  },
];

export const CARD_MAP = new Map<string, Card>(SEED_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card | undefined {
  return CARD_MAP.get(id);
}
