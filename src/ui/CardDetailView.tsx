"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Card } from "@/src/game/canon/types";
import HorolCard from "@/src/render/card/HorolCard";
import { useCollectionStore } from "@/src/state/collection-store";
import { HOUSES } from "@/src/game/canon/houses";
import {
  HOUSE_NAMES,
  TIER_NAMES,
  TIER_COLORS,
  HOUSE_COLORS,
} from "@/src/render/card/card-constants";
import styles from "./CardDetailView.module.css";

export default function CardDetailView({ card }: { card: Card }) {
  const markSeen = useCollectionStore((s) => s.markSeen);

  useEffect(() => {
    markSeen(card.id);
  }, [card.id, markSeen]);

  const house = HOUSES[card.house];
  const tierColor = TIER_COLORS[card.rarity];
  const houseColor = HOUSE_COLORS[card.house];

  return (
    <main
      className={styles.detail}
      style={
        {
          "--tier-color": tierColor,
          "--house-color": houseColor,
        } as React.CSSProperties
      }
    >
      <Link href="/play/collection" className={styles.back}>
        ← Collection
      </Link>

      <div className={styles.layout}>
        {/* ── Card ───────────────────────────────────── */}
        <div className={styles.cardCol}>
          <HorolCard card={card} />
        </div>

        {/* ── Info ───────────────────────────────────── */}
        <div className={styles.infoCol}>
          <header className={styles.infoHeader}>
            <div className={styles.houseLine}>
              <span className={styles.houseDot} />
              <span className={styles.houseName}>{HOUSE_NAMES[card.house]}</span>
              <span className={styles.tierBadge}>{TIER_NAMES[card.rarity]}</span>
            </div>
            <h1 className={styles.name}>{card.name}</h1>
            <p className={styles.ref}>{card.ref}</p>
          </header>

          <blockquote className={styles.lore}>
            <p className={styles.loreText}>{card.lore}</p>
            {house && (
              <footer className={styles.loreSource}>— {house.firstPrinciple}</footer>
            )}
          </blockquote>

          <div className={styles.rule} aria-hidden="true" />

          <dl className={styles.specs}>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Calibre</dt>
              <dd className={styles.specValue}>{card.calibre}</dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Architecture</dt>
              <dd className={styles.specValue}>
                {card.architecture.charAt(0).toUpperCase() + card.architecture.slice(1)}
              </dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Indice horaire</dt>
              <dd className={styles.specValue}>{card.ih.toLocaleString("fr-FR")}</dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>N° de série</dt>
              <dd className={styles.specValue}>
                {card.serial.toString().padStart(4, "0")}
              </dd>
            </div>
            <div className={styles.specRow}>
              <dt className={styles.specLabel}>Projet</dt>
              <dd className={styles.specValue}>{card.project}</dd>
            </div>
          </dl>

          <div className={styles.complications}>
            <span className={styles.complicationsLabel}>Complications</span>
            <ul className={styles.complicationsList}>
              {card.complications.map((c) => (
                <li key={c} className={styles.complication}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
