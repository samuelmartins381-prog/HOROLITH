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
  /**
   * Accrues any earned daily packs based on time since last accrual.
   * Call on mount in guest mode; server mode handles accrual via RPC.
   */
  accrueDailyPacks: () => void;
  /** Consume one pending daily pack; returns false if none available. */
  spendDailyPack: () => boolean;
  canAffordSceaux: () => boolean;
  canAffordLingots: () => boolean;
  /** Replace all state with authoritative server data. */
  hydrate: (data: {
    wallet: Wallet;
    pityState: PityState;
    pendingDailyPacks: number;
    lastDailyPackAt: number;
  }) => void;
};

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const usePackStore = create<PackStoreState>()(
  persist(
    (set, get) => ({
      // New players start with 500 Sceaux and last_daily_pack_at = epoch 0,
      // so accrueDailyPacks() will immediately grant 1–2 daily coffrets.
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

      accrueDailyPacks: () => {
        const { lastDailyPackAt, pendingDailyPacks } = get();
        const hoursElapsed = (Date.now() - lastDailyPackAt) / 3_600_000;
        const toAdd = Math.floor(hoursElapsed / DAILY_PACK_INTERVAL_HOURS);
        if (toAdd <= 0 || pendingDailyPacks >= DAILY_PACK_MAX_STORED) return;
        const nextPending = Math.min(pendingDailyPacks + toAdd, DAILY_PACK_MAX_STORED);
        const nextLastAt =
          lastDailyPackAt + toAdd * DAILY_PACK_INTERVAL_HOURS * 3_600_000;
        set({ pendingDailyPacks: nextPending, lastDailyPackAt: nextLastAt });
      },

      spendDailyPack: () => {
        const { pendingDailyPacks } = get();
        if (pendingDailyPacks <= 0) return false;
        set((s) => ({
          pendingDailyPacks: s.pendingDailyPacks - 1,
          lastDailyPackAt: Date.now(),
        }));
        return true;
      },

      canAffordSceaux: () => get().wallet.sceaux >= PACK_PRICE_SCEAUX,
      canAffordLingots: () => get().wallet.lingots >= PACK_PRICE_LINGOTS,

      hydrate: (data) =>
        set({
          wallet: data.wallet,
          pityState: data.pityState,
          pendingDailyPacks: data.pendingDailyPacks,
          lastDailyPackAt: data.lastDailyPackAt,
        }),
    }),
    {
      name: "horolith:pack:v1",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
    }
  )
);
