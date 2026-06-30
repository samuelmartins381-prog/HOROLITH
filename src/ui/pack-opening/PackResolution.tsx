"use client";

import Link from "next/link";
import type { CardResult } from "@/src/game/gacha/engine";
import type { Card } from "@/src/game/canon/types";
import { TIER_NAMES, TIER_COLORS } from "@/src/render/card/card-constants";
import styles from "./PackResolution.module.css";

interface PackResolutionProps {
  results: CardResult[];
  cards: Card[];
  onOpenAnother: () => void;
}

export default function PackResolution({
  results,
  cards,
  onOpenAnother,
}: PackResolutionProps) {
  const totalEclats = results.reduce((sum, r) => sum + r.eclatsAwarded, 0);
  const newCount = results.filter((r) => r.isNew).length;

  return (
    <div className={styles.resolution}>
      <header className={styles.header}>
        <p className={styles.summary}>
          {newCount > 0 ? (
            <>
              <span className={styles.newCount}>{newCount}</span> nouvelle
              {newCount !== 1 ? "s" : ""} création{newCount !== 1 ? "s" : ""}
            </>
          ) : (
            <span className={styles.duplicates}>Doublons convertis en éclats</span>
          )}
        </p>
        {totalEclats > 0 && (
          <p className={styles.eclats}>
            +{totalEclats.toLocaleString("fr-FR")}&thinsp;éclats
          </p>
        )}
      </header>

      <ul className={styles.list} aria-label="Résultat du coffret">
        {results.map((result, i) => {
          const card = cards[i];
          if (!card) return null;
          return (
            <li key={result.cardId} className={styles.item}>
              <div
                className={styles.rarityDot}
                style={{ background: TIER_COLORS[result.rarity] }}
                aria-hidden="true"
              />
              <span className={styles.cardName}>{card.name}</span>
              <span
                className={styles.rarityName}
                style={{ color: TIER_COLORS[result.rarity] }}
              >
                {TIER_NAMES[result.rarity]}
              </span>
              {result.isNew ? (
                <span className={styles.newBadge} aria-label="Nouveau">
                  Nouveau
                </span>
              ) : (
                <span
                  className={styles.eclatsAmount}
                  aria-label={`${result.eclatsAwarded} éclats`}
                >
                  +{result.eclatsAwarded}&thinsp;éc.
                </span>
              )}
            </li>
          );
        })}
      </ul>

      <footer className={styles.footer}>
        <button className={styles.btnPrimary} onClick={onOpenAnother}>
          Ouvrir un autre
        </button>
        <Link href="/play/collection" className={styles.btnSecondary}>
          Ma collection
        </Link>
      </footer>
    </div>
  );
}
