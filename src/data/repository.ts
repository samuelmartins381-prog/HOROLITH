/*
 * CollectionRepository interface — abstracts local vs Supabase storage.
 * Phase 2: localStorage/IndexedDB implementation.
 * Phase 6: Supabase implementation.
 */

import type { Card } from "@/src/game/canon/types";
import type { Wallet } from "@/src/game/economy/types";

export type PullRecord = {
  id: string;
  cardId: string;
  timestamp: number;
  packId: string;
};

export interface CollectionRepository {
  getCollection(): Promise<Card[]>;
  hasCard(cardId: string): Promise<boolean>;
  addCards(cards: Card[]): Promise<void>;
  getWallet(): Promise<Wallet>;
  updateWallet(wallet: Wallet): Promise<void>;
  addPullRecord(record: PullRecord): Promise<void>;
  getPullHistory(): Promise<PullRecord[]>;
}
