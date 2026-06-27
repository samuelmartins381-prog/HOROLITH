import type { HouseId, RarityId } from "@/src/game/canon/types";

export const TIER_COLORS: Record<RarityId, string> = {
  ebauche: "#c8c5bd",
  emergence: "#2d7a4f",
  maitrise: "#c9a36b",
  virtuosite: "#7b5ea7",
  "grande-oeuvre": "#a0242f",
  "opus-aeternum": "#a8c8ff",
};

export const TIER_GLOW: Record<RarityId, string> = {
  ebauche: "rgba(200, 197, 189, 0.06)",
  emergence: "rgba(45, 122, 79, 0.1)",
  maitrise: "rgba(201, 163, 107, 0.18)",
  virtuosite: "rgba(123, 94, 167, 0.18)",
  "grande-oeuvre": "rgba(160, 36, 47, 0.22)",
  "opus-aeternum": "rgba(168, 200, 255, 0.28)",
};

export const HOUSE_COLORS: Record<HouseId, string> = {
  valther: "#b8b5b0",
  orvain: "#8899a8",
  belvor: "#c4a355",
  caelis: "#3a6b9e",
  merian: "#7a9ab0",
  ferrand: "#6a7080",
  aurell: "#5b7ec4",
  corven: "#a09890",
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
