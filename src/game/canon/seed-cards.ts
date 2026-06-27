/*
 * Seed canon — Phase 2.
 * Sources : Horolith Canon Bible Tome I + Tome III (SET 001).
 * Complications, architecture, matériaux : issus exclusivement des profils de Maison (houses.ts).
 */
import type { Card, HouseId, RarityId, DialStyle, Architecture } from "./types";
import { HOUSES } from "./houses";

// ─── Derivation tables ────────────────────────────────────────────────────────

const IH_BASE: Record<RarityId, number> = {
  ebauche: 240,
  emergence: 560,
  maitrise: 1020,
  virtuosite: 1740,
  "grande-oeuvre": 2900,
  "opus-aeternum": 4960,
};

const IH_RANGE: Record<RarityId, number> = {
  ebauche: 240,
  emergence: 380,
  maitrise: 680,
  virtuosite: 980,
  "grande-oeuvre": 1680,
  "opus-aeternum": 2040,
};

const DIAL_BASE: Record<HouseId, DialStyle> = {
  valther: "soleille",
  orvain: "squelette",
  belvor: "email",
  caelis: "aventurine",
  merian: "soleille",
  ferrand: "fume",
  aurell: "guilloche",
  corven: "lacque",
};

const DIAL_PREMIUM: Record<HouseId, DialStyle> = {
  valther: "guilloche",
  orvain: "squelette",
  belvor: "email",
  caelis: "aventurine",
  merian: "fume",
  ferrand: "pierre",
  aurell: "nacre",
  corven: "email",
};

const RARITY_CODE: Record<RarityId, string> = {
  ebauche: "EB",
  emergence: "EM",
  maitrise: "MA",
  virtuosite: "VI",
  "grande-oeuvre": "GO",
  "opus-aeternum": "OA",
};

const PROJET_TIER: Record<RarityId, string> = {
  ebauche: "I",
  emergence: "II",
  maitrise: "III",
  virtuosite: "IV",
  "grande-oeuvre": "V",
  "opus-aeternum": "VI",
};

const COMPS_BY_RARITY: Record<RarityId, number> = {
  ebauche: 1,
  emergence: 2,
  maitrise: 3,
  virtuosite: 4,
  "grande-oeuvre": 5,
  "opus-aeternum": 7,
};

const HOUSE_CODE: Record<HouseId, string> = {
  valther: "VA",
  orvain: "OR",
  belvor: "BL",
  caelis: "CA",
  merian: "ME",
  ferrand: "FR",
  aurell: "AU",
  corven: "CO",
};

const RARITY_TIER: Record<RarityId, number> = {
  ebauche: 0,
  emergence: 1,
  maitrise: 2,
  virtuosite: 3,
  "grande-oeuvre": 4,
  "opus-aeternum": 5,
};

// ─── Raw spec type ────────────────────────────────────────────────────────────

type RawCard = { name: string; rarity: RarityId };

// ─── Card builder ─────────────────────────────────────────────────────────────

function buildCard(
  house: HouseId,
  raw: RawCard,
  serial: number,
  rarityGroupIdx: number,
  rarityGroupSize: number
): Card {
  const h = HOUSES[house];
  const tier = RARITY_TIER[raw.rarity];
  const archs = h.architectures as Architecture[];
  const archIdx =
    archs.length === 1
      ? 0
      : Math.min(Math.floor((tier / 5) * archs.length), archs.length - 1);
  const count = Math.min(COMPS_BY_RARITY[raw.rarity], h.signatureComplications.length);
  const complications = h.signatureComplications.slice(0, count);
  const ratio = rarityGroupSize > 1 ? rarityGroupIdx / (rarityGroupSize - 1) : 0;
  const ih = Math.round(IH_BASE[raw.rarity] + IH_RANGE[raw.rarity] * ratio);
  const isPremium = tier >= 4;
  const hc = HOUSE_CODE[house];
  const sn = String(serial).padStart(3, "0");
  return {
    id: `${house}-${raw.rarity.replace(/-/g, "")}-${sn}`,
    ref: `HRL-${hc}${sn}-${RARITY_CODE[raw.rarity]}`,
    house,
    rarity: raw.rarity,
    name: raw.name,
    project: `Projet ${PROJET_TIER[raw.rarity]} · ${h.name}`,
    calibre: `Cal. HRL-${hc}${String(400 + serial).padStart(3, "0")}`,
    architecture: archs[archIdx],
    ih,
    complications,
    dial: isPremium ? DIAL_PREMIUM[house] : DIAL_BASE[house],
    serial,
    lore: h.firstPrinciple,
    assets: { face2d: `/assets/cards/${house}/${sn}.webp` },
  };
}

// ─── House spec lists (TOME III · SET 001) ────────────────────────────────────

const VALTHER: RawCard[] = [
  { name: "Prima", rarity: "ebauche" },
  { name: "Meridian", rarity: "ebauche" },
  { name: "Horizon", rarity: "ebauche" },
  { name: "Equinox", rarity: "ebauche" },
  { name: "Axis", rarity: "emergence" },
  { name: "Meridian Annual", rarity: "emergence" },
  { name: "Horizon Reserve", rarity: "emergence" },
  { name: "Axis Dual", rarity: "maitrise" },
  { name: "Equinox Chronograph", rarity: "maitrise" },
  { name: "Horizon Observatory", rarity: "maitrise" },
  { name: "Meridian Precision", rarity: "virtuosite" },
  { name: "Axis Grande", rarity: "virtuosite" },
  { name: "Equinox Absoluta", rarity: "grande-oeuvre" },
];

const ORVAIN: RawCard[] = [
  { name: "Nexus", rarity: "ebauche" },
  { name: "Stratum", rarity: "ebauche" },
  { name: "Vertex", rarity: "ebauche" },
  { name: "Keystone", rarity: "ebauche" },
  { name: "Monolith", rarity: "emergence" },
  { name: "Vertex Skeleton", rarity: "emergence" },
  { name: "Nexus Twin Barrel", rarity: "emergence" },
  { name: "Stratum Openwork", rarity: "maitrise" },
  { name: "Keystone Orbit", rarity: "maitrise" },
  { name: "Vertex Architecture", rarity: "maitrise" },
  { name: "Monolith Cathedral", rarity: "virtuosite" },
  { name: "Nexus Apex", rarity: "virtuosite" },
  { name: "Stratum Infinity", rarity: "grande-oeuvre" },
];

const BELVOR: RawCard[] = [
  { name: "Echo", rarity: "ebauche" },
  { name: "Resonance", rarity: "ebauche" },
  { name: "Harmonia", rarity: "ebauche" },
  { name: "Cantus", rarity: "emergence" },
  { name: "Sonare", rarity: "emergence" },
  { name: "Resonance Quarters", rarity: "emergence" },
  { name: "Harmonia Minutes", rarity: "maitrise" },
  { name: "Cantus Cathedral", rarity: "maitrise" },
  { name: "Sonare Chimes", rarity: "maitrise" },
  { name: "Resonance Petite Sonnerie", rarity: "virtuosite" },
  { name: "Harmonia Grande Sonnerie", rarity: "virtuosite" },
  { name: "Cantus Absoluta", rarity: "grande-oeuvre" },
  { name: "Vox Aeterna", rarity: "opus-aeternum" },
];

const CAELIS: RawCard[] = [
  { name: "Luna", rarity: "ebauche" },
  { name: "Zenith", rarity: "ebauche" },
  { name: "Solstice", rarity: "ebauche" },
  { name: "Equator", rarity: "ebauche" },
  { name: "Eclipse", rarity: "emergence" },
  { name: "Luna Perpetual", rarity: "emergence" },
  { name: "Zenith Sidereal", rarity: "emergence" },
  { name: "Solstice Equation", rarity: "maitrise" },
  { name: "Equator Celestial", rarity: "maitrise" },
  { name: "Eclipse Orbit", rarity: "maitrise" },
  { name: "Zenith Cosmos", rarity: "virtuosite" },
  { name: "Solstice Eternal", rarity: "virtuosite" },
  { name: "Astrum Suprema", rarity: "grande-oeuvre" },
];

const MERIAN: RawCard[] = [
  { name: "Vector", rarity: "ebauche" },
  { name: "Chrona", rarity: "ebauche" },
  { name: "Regula", rarity: "ebauche" },
  { name: "Constant", rarity: "emergence" },
  { name: "Delta", rarity: "emergence" },
  { name: "Chrona Flyback", rarity: "emergence" },
  { name: "Vector Split", rarity: "maitrise" },
  { name: "Constant Resonance", rarity: "maitrise" },
  { name: "Delta Observatory", rarity: "virtuosite" },
  { name: "Regula Precision", rarity: "virtuosite" },
  { name: "Chrona Apex", rarity: "grande-oeuvre" },
  { name: "Tempus Exacta", rarity: "grande-oeuvre" },
];

const FERRAND: RawCard[] = [
  { name: "Alloy", rarity: "ebauche" },
  { name: "Origin", rarity: "ebauche" },
  { name: "Helix", rarity: "ebauche" },
  { name: "Forge", rarity: "ebauche" },
  { name: "Element", rarity: "emergence" },
  { name: "Alloy Titanium", rarity: "emergence" },
  { name: "Forge Composite", rarity: "emergence" },
  { name: "Helix Tantalum", rarity: "maitrise" },
  { name: "Origin Ceramic", rarity: "maitrise" },
  { name: "Element Graphite", rarity: "virtuosite" },
  { name: "Forge Absolute", rarity: "virtuosite" },
  { name: "Materia Prima", rarity: "grande-oeuvre" },
];

const AURELL: RawCard[] = [
  { name: "Orbit", rarity: "ebauche" },
  { name: "Halo", rarity: "ebauche" },
  { name: "Shift", rarity: "ebauche" },
  { name: "Eclipse Display", rarity: "emergence" },
  { name: "Flux", rarity: "emergence" },
  { name: "Orbit Jump", rarity: "emergence" },
  { name: "Halo Retrograde", rarity: "maitrise" },
  { name: "Shift Satellite", rarity: "maitrise" },
  { name: "Flux Orbital", rarity: "virtuosite" },
  { name: "Orbit Prism", rarity: "virtuosite" },
  { name: "Halo Infinity", rarity: "grande-oeuvre" },
  { name: "Nova Display", rarity: "grande-oeuvre" },
];

const CORVEN: RawCard[] = [
  { name: "Concord", rarity: "ebauche" },
  { name: "Unity", rarity: "ebauche" },
  { name: "Balance", rarity: "ebauche" },
  { name: "Accord", rarity: "emergence" },
  { name: "Nexus Prime", rarity: "emergence" },
  { name: "Concord Annual", rarity: "emergence" },
  { name: "Unity Resonance", rarity: "emergence" },
  { name: "Balance Celestial", rarity: "maitrise" },
  { name: "Accord Symphony", rarity: "maitrise" },
  { name: "Nexus Grand", rarity: "virtuosite" },
  { name: "Concord Harmonic", rarity: "grande-oeuvre" },
  { name: "Magnum Opus", rarity: "opus-aeternum" },
];

// ─── Assembly ─────────────────────────────────────────────────────────────────

const HOUSE_SPECS: [HouseId, RawCard[]][] = [
  ["valther", VALTHER],
  ["orvain", ORVAIN],
  ["belvor", BELVOR],
  ["caelis", CAELIS],
  ["merian", MERIAN],
  ["ferrand", FERRAND],
  ["aurell", AURELL],
  ["corven", CORVEN],
];

const rarityGroupSizes: Partial<Record<RarityId, number>> = {};
for (const [, cards] of HOUSE_SPECS) {
  for (const card of cards) {
    rarityGroupSizes[card.rarity] = (rarityGroupSizes[card.rarity] ?? 0) + 1;
  }
}

const rarityCounters: Partial<Record<RarityId, number>> = {};
let _serial = 1;

export const SEED_CARDS: Card[] = HOUSE_SPECS.flatMap(([house, cards]) =>
  cards.map((raw) => {
    const idx = rarityCounters[raw.rarity] ?? 0;
    rarityCounters[raw.rarity] = idx + 1;
    return buildCard(house, raw, _serial++, idx, rarityGroupSizes[raw.rarity]!);
  })
);

export const CARD_MAP = new Map<string, Card>(SEED_CARDS.map((c) => [c.id, c]));

export function getCard(id: string): Card | undefined {
  return CARD_MAP.get(id);
}
