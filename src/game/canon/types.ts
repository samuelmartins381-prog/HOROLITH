/*
 * Canon types — populated from the Horolith original bible.
 * NEVER invent HouseId values or rarity names here.
 * Ask for the canon content before filling these in.
 */

export type HouseId = string; // will be a union of 10 literal IDs once canon is imported

export type RarityId = string; // will be a union of 5 literal IDs once canon is imported

export type DialStyle =
  "soleille" | "guilloche" | "email" | "squelette" | "fume" | "lacque";

export type Card = {
  id: string;
  ref: string; // e.g. "Réf. HRL-1931"
  house: HouseId;
  rarity: RarityId;
  name: string;
  complication?: string;
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
  signature: {
    color: string;
    material: string;
  };
  specialty: string;
  lore: string;
};

export type Rarity = {
  id: RarityId;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  material: string;
  baseRate: number;
  lumeActive: boolean;
};
