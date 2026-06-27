/*
 * Canon types — sourced exclusively from Horolith Canon Bible Tome I.
 * Do not invent values. If a value is missing, stop and ask.
 */

export type HouseId =
  "valther" | "orvain" | "belvor" | "caelis" | "merian" | "ferrand" | "aurell" | "corven";

export type RarityId =
  "ebauche" | "emergence" | "maitrise" | "virtuosite" | "grande-oeuvre" | "opus-aeternum";

export type DialStyle =
  | "soleille"
  | "guilloche"
  | "email"
  | "squelette"
  | "fume"
  | "lacque"
  | "aventurine"
  | "nacre"
  | "pierre";

export type Architecture =
  | "lineaire"
  | "radiale"
  | "concentrique"
  | "suspendue"
  | "squelettee"
  | "sonore"
  | "chronometrique"
  | "energetique"
  | "orbitale"
  | "hybride";

export type Card = {
  id: string;
  ref: string;
  house: HouseId;
  rarity: RarityId;
  name: string;
  project: string;
  calibre: string;
  architecture: Architecture;
  ih: number;
  complications: string[];
  dial: DialStyle;
  serial: number;
  lore: string;
  assets: {
    glb?: string;
    face2d: string;
    foilMask?: string;
  };
};

export type House = {
  id: HouseId;
  name: string;
  philosophy: string;
  firstPrinciple: string;
  specialty: string;
  materials: string[];
  architectures: Architecture[];
  signatureComplications: string[];
  rivalry: HouseId;
  lore: string;
};

export type Rarity = {
  id: RarityId;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5 | 6;
  lumeActive: boolean;
  foilActive: boolean;
};
