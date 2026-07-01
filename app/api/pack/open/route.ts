import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { createGachaEngine } from "@/src/game/gacha/engine";
import { GACHA_POOL } from "@/src/game/gacha/pool-builder";
import {
  DAILY_PACK_INTERVAL_HOURS,
  DAILY_PACK_MAX_STORED,
} from "@/src/game/economy/currencies";

type PaymentMethod = "sceaux" | "lingots" | "daily";

function isValidPayment(v: unknown): v is PaymentMethod {
  return v === "sceaux" || v === "lingots" || v === "daily";
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return Response.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  // Validate authenticated session
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "not_authenticated" }, { status: 401 });
  }

  // Parse + validate request body
  let paymentMethod: PaymentMethod;
  try {
    const body = await request.json();
    if (!isValidPayment(body.paymentMethod)) throw new Error();
    paymentMethod = body.paymentMethod;
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  // Fetch current player state from DB
  const [walletRes, pityRes, collectionRes] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", user.id).single(),
    supabase.from("pity_states").select("*").eq("user_id", user.id).single(),
    supabase.from("collections").select("card_id").eq("user_id", user.id),
  ]);

  if (walletRes.error || !walletRes.data || pityRes.error || !pityRes.data) {
    return Response.json({ error: "state_not_found" }, { status: 500 });
  }

  const wallet = walletRes.data;
  const pity = pityRes.data;

  // Server-side daily pack accrual (mirrors client logic, single source of truth)
  if (paymentMethod === "daily") {
    const lastAt = new Date(wallet.last_daily_pack_at).getTime();
    const hoursElapsed = (Date.now() - lastAt) / 3_600_000;
    const toAdd = Math.floor(hoursElapsed / DAILY_PACK_INTERVAL_HOURS);
    if (toAdd > 0 && wallet.pending_daily_packs < DAILY_PACK_MAX_STORED) {
      wallet.pending_daily_packs = Math.min(
        wallet.pending_daily_packs + toAdd,
        DAILY_PACK_MAX_STORED
      );
    }
  }

  // Roll gacha server-side with a cryptographically random seed
  const seedBuf = new Uint8Array(4);
  crypto.getRandomValues(seedBuf);
  const seed = new DataView(seedBuf.buffer).getUint32(0, false);

  const ownedSet = new Set((collectionRes.data ?? []).map((r) => r.card_id));
  const pityState = {
    goWithout: pity.go_without,
    guaranteedRateUp: pity.guaranteed_rate_up,
  };

  const engine = createGachaEngine(seed);
  const { cards, nextPityState } = engine.openPack(GACHA_POOL, ownedSet, pityState);

  // Atomically commit everything via the RPC (deduct, upsert, audit log)
  const { data: updatedWallet, error: rpcError } = await supabase.rpc("rpc_open_pack", {
    p_payment: paymentMethod,
    p_cards: cards,
    p_go_without: nextPityState.goWithout,
    p_guaranteed: nextPityState.guaranteedRateUp,
  });

  if (rpcError) {
    const msg = rpcError.message;
    if (msg.includes("insufficient_") || msg.includes("no_daily_packs")) {
      return Response.json({ error: msg }, { status: 402 });
    }
    return Response.json({ error: "db_error" }, { status: 500 });
  }

  return Response.json({
    cards,
    pityState: nextPityState,
    wallet: updatedWallet,
  });
}
