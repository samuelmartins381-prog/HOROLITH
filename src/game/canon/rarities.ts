import type { Rarity } from "./types";

/*
 * Les 6 Niveaux de Création — Canon Horolith Tome I, Chapitre II.
 * Le niveau découle naturellement de la création (IH, architecture, complications, exécution).
 * Il n'est jamais choisi arbitrairement.
 * Les taux de drop gacha sont définis dans src/game/gacha (Phase 3) — pas ici.
 */
export const RARITIES: Record<string, Rarity> = {
  ebauche: {
    id: "ebauche",
    name: "Ébauche",
    tier: 1,
    lumeActive: false,
    foilActive: false,
  },
  emergence: {
    id: "emergence",
    name: "Émergence",
    tier: 2,
    lumeActive: false,
    foilActive: false,
  },
  maitrise: {
    id: "maitrise",
    name: "Maîtrise",
    tier: 3,
    lumeActive: false,
    foilActive: true,
  },
  virtuosite: {
    id: "virtuosite",
    name: "Virtuosité",
    tier: 4,
    lumeActive: false,
    foilActive: true,
  },
  "grande-oeuvre": {
    id: "grande-oeuvre",
    name: "Grande Œuvre",
    tier: 5,
    lumeActive: true,
    foilActive: true,
  },
  "opus-aeternum": {
    id: "opus-aeternum",
    name: "Opus Aeternum",
    tier: 6,
    lumeActive: true,
    foilActive: true,
  },
} as const;

export const RARITY_IDS = Object.keys(RARITIES) as Array<keyof typeof RARITIES>;

export const RARITY_ORDER: Rarity["id"][] = [
  "ebauche",
  "emergence",
  "maitrise",
  "virtuosite",
  "grande-oeuvre",
  "opus-aeternum",
];
