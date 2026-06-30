"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { INITIAL_PITY_STATE, type PityState } from "@/src/game/gacha/engine";
import {
  PACK_PRICE_SCEAUX,
  PACK_PRICE_LINGOTS,
  DAILY_PACK_INTERVAL_HOURS,
  DAILY_PACK_MAX_STORED,
} from "@/src/game/economy/currencies";

type Wallet = {
  sceaux: number;
  lingots: number;
  eclats: number;
};

type PackStoreState = {
  wallet: Wallet;
  pityState: PityState;
  pendingDailyPacks: number;
  lastDailyPackAt: number;

  spendSceaux: () => void;
  spendLingots: () => void;
  addSceaux: (amount: number) => void;
  addEclats: (amount: number) => void;
  updatePity: (state: PityState) => void;
  claimDailyPack: () => boolean;
  canAffordSceaux: () => boolean;
  canAffordLingots: () => boolean;
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const usePackStore = create<PackStoreState>()(
  persist(
    (set, get) => ({
      wallet: { sceaux: 500, lingots: 0, eclats: 0 },
      pityState: INITIAL_PITY_STATE,
      pendingDailyPacks: 0,
      lastDailyPackAt: 0,

      spendSceaux: () =>
        set((s) => ({
          wallet: { ...s.wallet, sceaux: s.wallet.sceaux - PACK_PRICE_SCEAUX },
        })),

      spendLingots: () =>
        set((s) => ({
          wallet: { ...s.wallet, lingots: s.wallet.lingots - PACK_PRICE_LINGOTS },
        })),

      addSceaux: (amount) =>
        set((s) => ({
          wallet: { ...s.wallet, sceaux: s.wallet.sceaux + amount },
        })),

      addEclats: (amount) =>
        set((s) => ({
          wallet: { ...s.wallet, eclats: s.wallet.eclats + amount },
        })),

      updatePity: (state) => set({ pityState: state }),

      claimDailyPack: () => {
        const { lastDailyPackAt, pendingDailyPacks } = get();
        const hoursElapsed = (Date.now() - lastDailyPackAt) / 3_600_000;
        if (hoursElapsed < DAILY_PACK_INTERVAL_HOURS) return false;
        if (pendingDailyPacks >= DAILY_PACK_MAX_STORED) return false;
        set((s) => ({
          pendingDailyPacks: Math.min(s.pendingDailyPacks + 1, DAILY_PACK_MAX_STORED),
          lastDailyPackAt: Date.now(),
        }));
        return true;
      },

      canAffordSceaux: () => get().wallet.sceaux >= PACK_PRICE_SCEAUX,
      canAffordLingots: () => get().wallet.lingots >= PACK_PRICE_LINGOTS,
    }),
    {
      name: "horolith:pack:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
    }
  )
);
