"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getBrowserSupabaseClient } from "@/src/lib/supabase/browser";
import { useAuthStore } from "@/src/state/auth-store";
import { useCollectionStore } from "@/src/state/collection-store";
import { usePackStore } from "@/src/state/pack-store";

/**
 * Initialises Supabase auth, listens for sign-in / sign-out,
 * and hydrates the Zustand stores with the user's server-side data.
 *
 * Mount this once in the root layout (Providers component).
 * When Supabase is not configured the hook is a no-op and the app
 * continues in local-only (guest) mode.
 */
export function useServerSync() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const hydrateCollection = useCollectionStore((s) => s.hydrate);
  const hydratePackState = usePackStore((s) => s.hydrate);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      // No Supabase configured — keep loading=false so the UI works
      setLoading(false);
      return;
    }

    async function loadUserData(userId: string) {
      if (!supabase) return;

      const [collectionRes, walletRes, pityRes] = await Promise.all([
        supabase.from("collections").select("card_id, quantity").eq("user_id", userId),
        supabase.from("wallets").select("*").eq("user_id", userId).single(),
        supabase.from("pity_states").select("*").eq("user_id", userId).single(),
      ]);

      if (collectionRes.data) {
        const owned: Record<string, number> = {};
        for (const row of collectionRes.data) {
          owned[row.card_id] = row.quantity;
        }
        hydrateCollection(owned);
      }

      if (walletRes.data && pityRes.data) {
        const w = walletRes.data;
        const p = pityRes.data;
        hydratePackState({
          wallet: {
            sceaux: w.sceaux,
            lingots: w.lingots,
            eclats: w.eclats,
          },
          pendingDailyPacks: w.pending_daily_packs,
          lastDailyPackAt: new Date(w.last_daily_pack_at).getTime(),
          pityState: {
            goWithout: p.go_without,
            guaranteedRateUp: p.guaranteed_rate_up,
          },
        });
      }
    }

    // Resolve the current session immediately
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }: { data: { session: Session | null } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        }
        setLoading(false);
      });

    // React to subsequent auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserData(session.user.id);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // stable refs — intentionally omit setUser/setLoading/hydrate
}
