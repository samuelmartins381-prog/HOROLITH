"use client";

import { useState, useEffect, useRef } from "react";
import HorolCard from "@/src/render/card/HorolCard";
import SapphireOverlay from "@/src/render/SapphireOverlay";
import LumeParticles from "@/src/render/LumeParticles";
import { RARITIES } from "@/src/game/canon/rarities";
import { TIER_LEAK } from "@/src/render/card/card-constants";
import type { Card } from "@/src/game/canon/types";
import type { RarityId } from "@/src/game/canon/types";
import styles from "./RevealCard.module.css";

interface RevealCardProps {
  card: Card;
  isRevealed: boolean;
  onFlip?: () => void;
}

/* Light-leak intensity per tier — the climax is reserved
   for the highest rarities (§16.8). */
const LEAK_MIX: Record<number, number> = { 1: 24, 2: 38, 3: 52, 4: 60, 5: 74, 6: 88 };

export default function RevealCard({ card, isRevealed, onFlip }: RevealCardProps) {
  const [frontMounted, setFrontMounted] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const hasFlippedRef = useRef(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const tier = RARITIES[card.rarity]?.tier ?? 1;
  const leak = TIER_LEAK[card.rarity];

  useEffect(() => {
    if (!isRevealed || hasFlippedRef.current) return;
    hasFlippedRef.current = true;

    setFrontMounted(true);
    onFlip?.();

    if (reducedMotion.current) {
      setFlipped(true);
      return;
    }

    // Let the front face paint (hidden at rotateY(180°)) before flipping
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipped(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [isRevealed, onFlip]);

  const handleClick = () => {
    if (!isRevealed) onFlip?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRevealed && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onFlip?.();
    }
  };

  return (
    <div
      className={`${styles.slot}${!isRevealed ? ` ${styles.clickable}` : ""}`}
      onClick={handleClick}
      role={!isRevealed ? "button" : undefined}
      tabIndex={!isRevealed ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={!isRevealed ? "Révéler la création" : card.name}
    >
      <div className={styles.cardInner}>
        {/* Rarity light-leak — bursts while the card is edge-on */}
        <div
          className={`${styles.leak}${flipped ? ` ${styles.leakActive}` : ""}`}
          style={
            {
              "--leak": leak,
              "--leak-mix": LEAK_MIX[tier] ?? 38,
            } as React.CSSProperties
          }
          aria-hidden="true"
        />

        <div className={`${styles.flipper}${flipped ? ` ${styles.flipped}` : ""}`}>
          {/* Back face */}
          <div className={styles.faceBack}>
            <div className={styles.backGuilloché} aria-hidden="true" />
            <div className={styles.backCenter}>
              <div className={styles.backRule} aria-hidden="true" />
              <span className={styles.backWordmark}>Horolith</span>
              <div className={styles.backRule} aria-hidden="true" />
            </div>
            <span className={styles.backSub}>Manufacture Horlogère</span>
          </div>

          {/* Front face — mounted at flip start, rotated away until then */}
          {frontMounted && (
            <div className={styles.faceFront}>
              <HorolCard card={card} />
              {/* Sapphire glass overlay for Maîtrise and above */}
              {tier >= 3 && <SapphireOverlay rarity={card.rarity as RarityId} />}
            </div>
          )}
        </div>
      </div>

      {/* Lume particle burst for Grande Œuvre and Opus Aeternum */}
      {flipped && tier >= 5 && <LumeParticles rarity={card.rarity as RarityId} />}
    </div>
  );
}
