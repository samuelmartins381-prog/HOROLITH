-- Horolith — Phase 6 schema
-- Run this in the Supabase SQL editor or via `supabase db push`.

-- ─── Tables ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallets (
  user_id              UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  sceaux               INTEGER NOT NULL DEFAULT 500 CHECK (sceaux   >= 0),
  lingots              INTEGER NOT NULL DEFAULT 0   CHECK (lingots  >= 0),
  eclats               INTEGER NOT NULL DEFAULT 0   CHECK (eclats   >= 0),
  -- Start with 1 pending daily pack so new players can try the mechanic immediately
  pending_daily_packs  INTEGER NOT NULL DEFAULT 1   CHECK (pending_daily_packs BETWEEN 0 AND 2),
  last_daily_pack_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() - INTERVAL '24 hours 1 minute')
);

CREATE TABLE IF NOT EXISTS public.pity_states (
  user_id             UUID PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  go_without          INTEGER NOT NULL DEFAULT 0,
  guaranteed_rate_up  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.collections (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  card_id           TEXT NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  first_obtained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, card_id)
);

CREATE TABLE IF NOT EXISTS public.pack_opens (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  opened_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('sceaux', 'lingots', 'daily')),
  cards_received JSONB NOT NULL
);

-- ─── Row-Level Security ───────────────────────────────────────────

ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pity_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_opens  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_own"    ON public.profiles    FOR ALL USING (auth.uid() = id);
CREATE POLICY "wallet_own"     ON public.wallets     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pity_own"       ON public.pity_states FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "collection_own" ON public.collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pack_opens_own" ON public.pack_opens  FOR ALL USING (auth.uid() = user_id);

-- ─── Auto-provision profile + wallet + pity on signup ────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id)         VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.wallets (user_id)     VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.pity_states (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Atomic pack-open RPC (anti-cheat) ───────────────────────────
-- Called from /api/pack/open with the user's session JWT (auth.uid() resolves).
-- Handles: daily pack accrual, payment deduction, éclat credit, pity update,
-- collection upsert, audit log — all in one transaction.

CREATE OR REPLACE FUNCTION public.rpc_open_pack(
  p_payment    TEXT,    -- 'sceaux' | 'lingots' | 'daily'
  p_cards      JSONB,   -- [{cardId, rarity, isNew, eclatsAwarded}]
  p_go_without INTEGER,
  p_guaranteed BOOLEAN
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid         UUID := auth.uid();
  v_eclats      INTEGER;
  v_hours       NUMERIC;
  v_packs_add   INTEGER;
  v_wallet      public.wallets%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Accrue any earned daily packs before processing the request
  SELECT EXTRACT(EPOCH FROM (NOW() - last_daily_pack_at)) / 3600
  INTO v_hours
  FROM public.wallets WHERE user_id = v_uid;

  v_packs_add := FLOOR(v_hours / 24)::INTEGER;
  IF v_packs_add > 0 THEN
    UPDATE public.wallets
    SET pending_daily_packs = LEAST(pending_daily_packs + v_packs_add, 2),
        last_daily_pack_at  = last_daily_pack_at + (v_packs_add * INTERVAL '24 hours')
    WHERE user_id = v_uid;
  END IF;

  -- Deduct payment
  IF p_payment = 'sceaux' THEN
    UPDATE public.wallets SET sceaux = sceaux - 100
    WHERE user_id = v_uid AND sceaux >= 100;
    IF NOT FOUND THEN RAISE EXCEPTION 'insufficient_sceaux'; END IF;

  ELSIF p_payment = 'lingots' THEN
    UPDATE public.wallets SET lingots = lingots - 100
    WHERE user_id = v_uid AND lingots >= 100;
    IF NOT FOUND THEN RAISE EXCEPTION 'insufficient_lingots'; END IF;

  ELSIF p_payment = 'daily' THEN
    UPDATE public.wallets
    SET pending_daily_packs = pending_daily_packs - 1,
        last_daily_pack_at  = NOW()
    WHERE user_id = v_uid AND pending_daily_packs > 0;
    IF NOT FOUND THEN RAISE EXCEPTION 'no_daily_packs'; END IF;

  ELSE
    RAISE EXCEPTION 'invalid_payment';
  END IF;

  -- Credit éclats from duplicate cards
  SELECT COALESCE(SUM((c->>'eclatsAwarded')::INTEGER), 0)
  INTO v_eclats
  FROM jsonb_array_elements(p_cards) AS c
  WHERE (c->>'eclatsAwarded')::INTEGER > 0;

  IF v_eclats > 0 THEN
    UPDATE public.wallets SET eclats = eclats + v_eclats WHERE user_id = v_uid;
  END IF;

  -- Update pity
  UPDATE public.pity_states
  SET go_without         = p_go_without,
      guaranteed_rate_up = p_guaranteed
  WHERE user_id = v_uid;

  -- Upsert collection (one row per unique card)
  INSERT INTO public.collections (user_id, card_id, quantity)
  SELECT v_uid, (c->>'cardId')::TEXT, 1
  FROM jsonb_array_elements(p_cards) AS c
  ON CONFLICT (user_id, card_id) DO UPDATE
    SET quantity = public.collections.quantity + 1;

  -- Audit log
  INSERT INTO public.pack_opens (user_id, payment_method, cards_received)
  VALUES (v_uid, p_payment, p_cards);

  -- Return fresh wallet snapshot
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_uid;

  RETURN jsonb_build_object(
    'sceaux',            v_wallet.sceaux,
    'lingots',           v_wallet.lingots,
    'eclats',            v_wallet.eclats,
    'pendingDailyPacks', v_wallet.pending_daily_packs,
    'lastDailyPackAt',   EXTRACT(EPOCH FROM v_wallet.last_daily_pack_at)::BIGINT * 1000
  );
END;
$$;
