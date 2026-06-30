"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SEED_CARDS } from "@/src/game/canon/seed-cards";
import type { Card } from "@/src/game/canon/types";

type CollectionState = {
  owned: Record<string, number>;
  newIds: string[];
  addCard: (cardId: string) => void;
  addCards: (cardIds: string[]) => void;
  markSeen: (cardId: string) => void;
  getOwnedCards: () => Card[];
  getTotalCount: () => number;
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      owned: {},
      newIds: [],

      addCard: (cardId) =>
        set((s) => ({
          owned: { ...s.owned, [cardId]: (s.owned[cardId] ?? 0) + 1 },
          newIds: s.owned[cardId] ? s.newIds : [...s.newIds, cardId],
        })),

      addCards: (cardIds) =>
        set((s) => {
          const nextOwned = { ...s.owned };
          const nextNewIds = [...s.newIds];
          for (const id of cardIds) {
            if (!nextOwned[id]) nextNewIds.push(id);
            nextOwned[id] = (nextOwned[id] ?? 0) + 1;
          }
          return { owned: nextOwned, newIds: nextNewIds };
        }),

      markSeen: (cardId) =>
        set((s) => ({ newIds: s.newIds.filter((id) => id !== cardId) })),

      getOwnedCards: () => {
        const { owned } = get();
        return SEED_CARDS.filter((c) => (owned[c.id] ?? 0) > 0);
      },

      getTotalCount: () => Object.values(get().owned).reduce((sum, q) => sum + q, 0),
    }),
    {
      name: "horolith:collection:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
    }
  )
);
