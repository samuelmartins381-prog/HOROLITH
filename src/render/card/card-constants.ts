import type { HouseId, RarityId } from "@/src/game/canon/types";

/* Mirrors design/tokens.css — light theme values.
   Kept as TS constants because they are injected as inline CSS vars
   and consumed by the WebGL layers. */

export const TIER_COLORS: Record<RarityId, string> = {
  ebauche: "#8b8880",
  emergence: "#2a7045",
  maitrise: "#b8924a",
  virtuosite: "#6b4e9a",
  "grande-oeuvre": "#8c1f2a",
  "opus-aeternum": "#1e4d7a",
};

export const TIER_GLOW: Record<RarityId, string> = {
  ebauche: "rgba(139, 136, 128, 0.08)",
  emergence: "rgba(42, 112, 69, 0.12)",
  maitrise: "rgba(184, 146, 74, 0.2)",
  virtuosite: "rgba(107, 78, 154, 0.18)",
  "grande-oeuvre": "rgba(140, 31, 42, 0.2)",
  "opus-aeternum": "rgba(30, 77, 122, 0.22)",
};

/* Light-leak tell colors — the coloured light that escapes the coffret
   and bursts at card flip. Hex (no alpha) so the 3D pointLight and
   CSS color-mix() can both consume them. */
export const TIER_LEAK: Record<RarityId, string> = {
  ebauche: "#b9b4a8",
  emergence: "#7fd6a4",
  maitrise: "#ffd98f",
  virtuosite: "#c9b2ff",
  "grande-oeuvre": "#ff9aa2",
  "opus-aeternum": "#9cc8ff",
};

export const HOUSE_COLORS: Record<HouseId, string> = {
  valther: "#6e6b66",
  orvain: "#4a6878",
  belvor: "#9a7a35",
  caelis: "#2a5180",
  merian: "#4a7080",
  ferrand: "#4a5060",
  aurell: "#3a60a8",
  corven: "#6a6058",
};

export const TIER_NAMES: Record<RarityId, string> = {
  ebauche: "Ébauche",
  emergence: "Émergence",
  maitrise: "Maîtrise",
  virtuosite: "Virtuosité",
  "grande-oeuvre": "Grande Œuvre",
  "opus-aeternum": "Opus Aeternum",
};

export const HOUSE_NAMES: Record<HouseId, string> = {
  valther: "Valther",
  orvain: "Orvain",
  belvor: "Belvor",
  caelis: "Caelis",
  merian: "Merian",
  ferrand: "Ferrand",
  aurell: "Aurell",
  corven: "Corven",
};
