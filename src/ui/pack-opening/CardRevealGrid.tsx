"use client";

import RevealCard from "./RevealCard";
import type { CardResult } from "@/src/game/gacha/engine";
import type { Card } from "@/src/game/canon/types";
import styles from "./CardRevealGrid.module.css";

interface CardRevealGridProps {
  results: CardResult[];
  cards: Card[];
  revealedCount: number;
  onRevealCard: (index: number) => void;
}

export default function CardRevealGrid({
  results,
  cards,
  revealedCount,
  onRevealCard,
}: CardRevealGridProps) {
  return (
    <div className={styles.grid} role="list" aria-label="Créations du coffret">
      {results.map((result, i) => {
        const card = cards[i];
        if (!card) return null;
        return (
          <div key={result.cardId} className={styles.slot} role="listitem">
            <RevealCard
              card={card}
              isRevealed={i < revealedCount}
              onFlip={() => onRevealCard(i)}
            />
          </div>
        );
      })}
    </div>
  );
}
