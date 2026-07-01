"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePackStore } from "@/src/state/pack-store";
import { useCollectionStore } from "@/src/state/collection-store";
import { useAuthStore } from "@/src/state/auth-store";
import { createGachaEngine } from "@/src/game/gacha/engine";
import { GACHA_POOL } from "@/src/game/gacha/pool-builder";
import { RARITY_ORDER } from "@/src/game/canon/rarities";
import { SEED_CARDS } from "@/src/game/canon/seed-cards";
import {
  initPackAudio,
  startTicking,
  stopTicking,
  accelerateTicking,
  playCardFlip,
  playRarityReveal,
} from "@/src/audio/pack-audio";
import type { CardResult } from "@/src/game/gacha/engine";
import type { Card } from "@/src/game/canon/types";
import type { RarityId } from "@/src/game/canon/types";
import PackCoffret from "./PackCoffret";
import CardRevealGrid from "./CardRevealGrid";
import PackResolution from "./PackResolution";
import HoldToSkip from "./HoldToSkip";
import styles from "./pack-opening.module.css";

type Phase = "idle" | "unsealing" | "revealing" | "resolved";
type PaymentMethod = "sceaux" | "lingots" | "daily";

const CARD_BY_ID: Record<string, Card> = Object.fromEntries(
  SEED_CARDS.map((c) => [c.id, c])
);
const REVEAL_INITIAL_MS = 600;
const REVEAL_STAGGER_MS = 1200;

function sortWorstToBest(cards: CardResult[]): CardResult[] {
  return [...cards].sort(
    (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
  );
}

export default function PackOpeningScene() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<CardResult[]>([]);
  const [sortedCards, setSortedCards] = useState<Card[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  const scheduleRef = useRef<((fromIndex: number, delay: number) => void) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skippedRef = useRef(false);
  const resultsRef = useRef<CardResult[]>([]);
  const rollingRef = useRef(false);

  // ── Store selectors ──────────────────────────────────────────────
  const wallet = usePackStore((s) => s.wallet);
  const pityState = usePackStore((s) => s.pityState);
  const pendingDailyPacks = usePackStore((s) => s.pendingDailyPacks);
  const canAffordSceaux = usePackStore((s) => s.canAffordSceaux);
  const canAffordLingots = usePackStore((s) => s.canAffordLingots);
  const spendSceaux = usePackStore((s) => s.spendSceaux);
  const spendLingots = usePackStore((s) => s.spendLingots);
  const spendDailyPack = usePackStore((s) => s.spendDailyPack);
  const accrueDailyPacks = usePackStore((s) => s.accrueDailyPacks);
  const updatePity = usePackStore((s) => s.updatePity);
  const addEclats = usePackStore((s) => s.addEclats);
  const hydratePackStore = usePackStore((s) => s.hydrate);

  const owned = useCollectionStore((s) => s.owned);
  const addCards = useCollectionStore((s) => s.addCards);

  const user = useAuthStore((s) => s.user);

  // ── Daily pack accrual (guest mode) ─────────────────────────────
  useEffect(() => {
    accrueDailyPacks();
  }, [accrueDailyPacks]);

  // ── Timer management ────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    scheduleRef.current = (fromIndex: number, delay: number) => {
      clearTimer();
      const rs = resultsRef.current;
      timerRef.current = setTimeout(() => {
        if (fromIndex >= rs.length) {
          timerRef.current = setTimeout(() => setPhase("resolved"), 500);
          return;
        }
        playCardFlip();
        playRarityReveal(rs[fromIndex]?.rarity ?? "ebauche");
        setRevealedCount(fromIndex + 1);
        scheduleRef.current?.(fromIndex + 1, REVEAL_STAGGER_MS);
      }, delay);
    };
  }, [clearTimer]);

  useEffect(() => {
    if (phase !== "revealing") return;
    if (skippedRef.current) return;
    setRevealedCount(0);
    scheduleRef.current?.(0, REVEAL_INITIAL_MS);
    return () => clearTimer();
  }, [phase, clearTimer]);

  useEffect(() => {
    if (phase !== "resolved") return;
    const rs = resultsRef.current;
    addCards(rs.map((r) => r.cardId));
    const total = rs.reduce((s, r) => s + r.eclatsAwarded, 0);
    if (total > 0) addEclats(total);
    stopTicking();
  }, [phase, addCards, addEclats]);

  useEffect(() => {
    initPackAudio();
    startTicking(80);
    return () => {
      stopTicking();
      clearTimer();
    };
  }, [clearTimer]);

  // ── Internal helpers ─────────────────────────────────────────────

  const applyResults = useCallback((sorted: CardResult[]) => {
    const cardObjects = sorted.map((r) => CARD_BY_ID[r.cardId]).filter(Boolean) as Card[];
    resultsRef.current = sorted;
    setResults(sorted);
    setSortedCards(cardObjects);
    skippedRef.current = false;
    setPhase("unsealing");
    accelerateTicking(160);
  }, []);

  // ── Pack roll ────────────────────────────────────────────────────
  const rollPack = useCallback(
    async (pay: PaymentMethod) => {
      if (phase !== "idle" || rollingRef.current) return;
      rollingRef.current = true;
      setApiError(null);

      try {
        if (user) {
          // ── Server mode — authenticated, anti-cheat ────────────
          accelerateTicking(140);

          const response = await fetch("/api/pack/open", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentMethod: pay }),
          });

          if (!response.ok) {
            startTicking(80);
            setApiError("L'ouverture a échoué — réessayez dans un moment.");
            rollingRef.current = false;
            return;
          }

          const data = (await response.json()) as {
            cards: CardResult[];
            pityState: { goWithout: number; guaranteedRateUp: boolean };
            wallet: {
              sceaux: number;
              lingots: number;
              eclats: number;
              pendingDailyPacks: number;
              lastDailyPackAt: number;
            };
          };

          hydratePackStore({
            wallet: {
              sceaux: data.wallet.sceaux,
              lingots: data.wallet.lingots,
              eclats: data.wallet.eclats,
            },
            pityState: data.pityState,
            pendingDailyPacks: data.wallet.pendingDailyPacks,
            lastDailyPackAt: data.wallet.lastDailyPackAt,
          });

          applyResults(sortWorstToBest(data.cards));
        } else {
          // ── Guest mode — local gacha roll ──────────────────────
          if (pay === "sceaux") {
            if (!canAffordSceaux()) {
              rollingRef.current = false;
              return;
            }
            spendSceaux();
          } else if (pay === "lingots") {
            if (!canAffordLingots()) {
              rollingRef.current = false;
              return;
            }
            spendLingots();
          } else {
            if (!spendDailyPack()) {
              rollingRef.current = false;
              return;
            }
          }

          const engine = createGachaEngine(Date.now());
          const ownedSet = new Set(
            Object.keys(owned).filter((id) => (owned[id] ?? 0) > 0)
          );
          const { cards: raw, nextPityState } = engine.openPack(
            GACHA_POOL,
            ownedSet,
            pityState
          );

          updatePity(nextPityState);
          applyResults(sortWorstToBest(raw));
        }
      } catch {
        startTicking(80);
        setApiError("Erreur réseau — vérifiez votre connexion.");
      }

      rollingRef.current = false;
    },
    [
      phase,
      user,
      canAffordSceaux,
      canAffordLingots,
      spendSceaux,
      spendLingots,
      spendDailyPack,
      owned,
      pityState,
      updatePity,
      hydratePackStore,
      applyResults,
    ]
  );

  // ── Coffret lid opened → start revealing ─────────────────────────
  const handleCoffretComplete = useCallback(() => {
    setPhase("revealing");
  }, []);

  // ── Manual card flip ─────────────────────────────────────────────
  const handleRevealCard = useCallback(
    (index: number) => {
      if (index !== revealedCount || phase !== "revealing") return;
      clearTimer();
      playCardFlip();
      playRarityReveal((resultsRef.current[index]?.rarity ?? "ebauche") as RarityId);
      setRevealedCount(index + 1);
      scheduleRef.current?.(index + 1, REVEAL_STAGGER_MS);
    },
    [revealedCount, phase, clearTimer]
  );

  // ── Hold-to-skip ─────────────────────────────────────────────────
  const handleSkip = useCallback(() => {
    clearTimer();
    skippedRef.current = true;

    const rs = resultsRef.current;
    const best = rs.reduce<CardResult | null>(
      (prev, curr) =>
        prev === null ||
        RARITY_ORDER.indexOf(curr.rarity) > RARITY_ORDER.indexOf(prev.rarity)
          ? curr
          : prev,
      null
    );
    if (best) {
      playCardFlip();
      playRarityReveal(best.rarity as RarityId);
    }

    setRevealedCount(rs.length);
    setPhase("revealing");

    timerRef.current = setTimeout(() => {
      setPhase("resolved");
      skippedRef.current = false;
    }, 500);
  }, [clearTimer]);

  // ── Open another ─────────────────────────────────────────────────
  const handleOpenAnother = useCallback(() => {
    clearTimer();
    skippedRef.current = false;
    resultsRef.current = [];
    setResults([]);
    setSortedCards([]);
    setRevealedCount(0);
    setPhase("idle");
    setApiError(null);
    startTicking(80);
    accrueDailyPacks();
  }, [clearTimer, accrueDailyPacks]);

  const showCoffret = phase === "idle" || phase === "unsealing";
  const showCards = phase === "revealing" || phase === "resolved";
  const showSkip = phase === "unsealing" || phase === "revealing";

  return (
    <main className={styles.scene}>
      <Link
        href="/play/collection"
        className={styles.backLink}
        aria-label="Ma collection"
      >
        ← Collection
      </Link>

      {/* Wallet */}
      <div className={styles.wallet} aria-label="Portefeuille">
        <div className={styles.walletItem}>
          <span className={styles.walletLabel}>Sceaux</span>
          <span className={`${styles.walletValue} ${styles.sceaux}`}>
            {wallet.sceaux.toLocaleString("fr-FR")}
          </span>
        </div>
        <div className={styles.walletItem}>
          <span className={styles.walletLabel}>Éclats</span>
          <span className={`${styles.walletValue} ${styles.eclats}`}>
            {wallet.eclats.toLocaleString("fr-FR")}
          </span>
        </div>
      </div>

      <div className={styles.stage}>
        {/* ── Coffret (idle + unsealing) ─────────── */}
        {showCoffret && (
          <div
            className={
              phase === "unsealing" ? styles.unsealingCoffret : styles.coffretArea
            }
          >
            {phase === "idle" && (
              <span className={styles.coffretLabel}>Coffret d&rsquo;ouverture</span>
            )}
            <PackCoffret
              isOpen={phase === "unsealing"}
              onAnimationComplete={handleCoffretComplete}
            />
            {phase === "idle" && apiError && (
              <p className={styles.apiError} role="alert">
                {apiError}
              </p>
            )}
            {phase === "idle" && (
              <div className={styles.paymentRow}>
                {pendingDailyPacks > 0 && (
                  <button
                    className={styles.paymentBtn}
                    onClick={() => rollPack("daily")}
                    aria-label={`Coffret quotidien gratuit — ${pendingDailyPacks} disponible(s)`}
                  >
                    <span className={styles.paymentBtnLabel}>Coffret quotidien</span>
                    <span className={`${styles.paymentBtnCost} ${styles.daily}`}>
                      Gratuit&ensp;·&ensp;{pendingDailyPacks}/2
                    </span>
                  </button>
                )}
                {pendingDailyPacks > 0 && (
                  <div className={styles.paymentSpacer} aria-hidden="true" />
                )}
                <button
                  className={styles.paymentBtn}
                  onClick={() => rollPack("sceaux")}
                  disabled={!canAffordSceaux()}
                  aria-label="Ouvrir avec 100 Sceaux"
                >
                  <span className={styles.paymentBtnLabel}>Ouvrir avec des Sceaux</span>
                  <span className={styles.paymentBtnCost}>100 Sceaux</span>
                </button>
                <button
                  className={styles.paymentBtn}
                  onClick={() => rollPack("lingots")}
                  disabled={!canAffordLingots()}
                  aria-label="Ouvrir avec 100 Lingots"
                >
                  <span className={styles.paymentBtnLabel}>Ouvrir avec des Lingots</span>
                  <span className={`${styles.paymentBtnCost} ${styles.lingots}`}>
                    100 Lingots
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Cards (revealing + resolved) ────────── */}
        {showCards && (
          <div className={styles.cardsArea}>
            {phase === "revealing" && (
              <span className={styles.cardsLabel} aria-live="polite">
                {revealedCount < results.length
                  ? "Cliquez pour révéler"
                  : "Finalisation…"}
              </span>
            )}
            <CardRevealGrid
              results={results}
              cards={sortedCards}
              revealedCount={revealedCount}
              onRevealCard={handleRevealCard}
            />
          </div>
        )}

        {/* ── Resolution ──────────────────────────── */}
        {phase === "resolved" && (
          <PackResolution
            results={results}
            cards={sortedCards}
            onOpenAnother={handleOpenAnother}
          />
        )}
      </div>

      {/* ── Hold-to-skip ────────────────────────── */}
      {showSkip && (
        <div className={styles.skipArea}>
          <HoldToSkip onSkip={handleSkip} />
        </div>
      )}
    </main>
  );
}
