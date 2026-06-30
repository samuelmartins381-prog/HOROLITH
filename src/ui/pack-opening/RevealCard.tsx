"use client";

import { useState, useEffect, useRef } from "react";
import HorolCard from "@/src/render/card/HorolCard";
import type { Card } from "@/src/game/canon/types";
import styles from "./RevealCard.module.css";

interface RevealCardProps {
  card: Card;
  isRevealed: boolean;
  onFlip?: () => void;
}

type FlipState = "" | "flipping1" | "flipping2";

export default function RevealCard({ card, isRevealed, onFlip }: RevealCardProps) {
  const [showFront, setShowFront] = useState(false);
  const [flipState, setFlipState] = useState<FlipState>("");
  const hasFlippedRef = useRef(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!isRevealed || hasFlippedRef.current) return;
    hasFlippedRef.current = true;

    if (reducedMotion.current) {
      setShowFront(true);
      onFlip?.();
      return;
    }

    setFlipState("flipping1");

    const swap = setTimeout(() => {
      setShowFront(true);
      onFlip?.();
      setFlipState("flipping2");
    }, 160);

    const done = setTimeout(() => {
      setFlipState("");
    }, 365);

    return () => {
      clearTimeout(swap);
      clearTimeout(done);
    };
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
      <div className={`${styles.cardInner}${flipState ? ` ${styles[flipState]}` : ""}`}>
        {showFront ? (
          <HorolCard card={card} />
        ) : (
          <div className={styles.back}>
            <div className={styles.backGuilloché} aria-hidden="true" />
            <div className={styles.backCenter}>
              <div className={styles.backRule} aria-hidden="true" />
              <span className={styles.backWordmark}>Horolith</span>
              <div className={styles.backRule} aria-hidden="true" />
            </div>
            <span className={styles.backSub}>Manufacture Horlogère</span>
          </div>
        )}
      </div>
    </div>
  );
}
