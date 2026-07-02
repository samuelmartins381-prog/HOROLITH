"use client";

import { useRef } from "react";
import type { Card } from "@/src/game/canon/types";
import { RARITIES } from "@/src/game/canon/rarities";
import WatchFace from "./WatchFace";
import { useCardTilt } from "./useCardTilt";
import {
  TIER_COLORS,
  TIER_GLOW,
  HOUSE_COLORS,
  TIER_NAMES,
  HOUSE_NAMES,
} from "./card-constants";
import styles from "./HorolCard.module.css";

interface HorolCardProps {
  card: Card;
  className?: string;
}

export default function HorolCard({ card, className }: HorolCardProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const { onPointerMove, onPointerLeave } = useCardTilt(sceneRef, cardRef);

  const rarity = RARITIES[card.rarity];
  const tierColor = TIER_COLORS[card.rarity];
  const tierGlow = TIER_GLOW[card.rarity];
  const houseColor = HOUSE_COLORS[card.house];
  const tierName = TIER_NAMES[card.rarity];
  const houseName = HOUSE_NAMES[card.house];

  const archDisplay =
    card.architecture.charAt(0).toUpperCase() + card.architecture.slice(1);

  return (
    <div
      ref={sceneRef}
      className={`${styles.scene} ${className ?? ""}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <article
        ref={cardRef}
        className={styles.card}
        style={
          {
            "--tier-color": tierColor,
            "--tier-glow": tierGlow,
            "--house-color": houseColor,
          } as React.CSSProperties
        }
        aria-label={`${card.name} — ${houseName}, ${tierName}`}
      >
        {/* ── 1. Header: maison + niveau ─────────────── */}
        <header className={styles.header}>
          <div className={styles.houseTag}>
            <span className={styles.houseDot} />
            <span className={styles.houseName}>{houseName}</span>
          </div>
          <div className={styles.rarityBadge}>
            <span className={styles.rarityLabel}>{tierName}</span>
          </div>
        </header>

        {/* ── 2. Nom de la création ──────────────────── */}
        <div className={styles.nameRow}>
          <h2 className={styles.cardName}>{card.name}</h2>
        </div>

        {/* ── 3. Visuel — cadran ────────────────────── */}
        <div className={styles.watchArea}>
          <WatchFace dial={card.dial} />
        </div>

        {/* ── 4. Calibre · Référence · IH ───────────── */}
        <div className={styles.metaRow}>
          <span className={styles.mono}>{card.calibre}</span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.mono}>{card.ref}</span>
          <span className={styles.ih}>IH {card.ih.toLocaleString("fr-FR")}</span>
        </div>

        <div className={styles.rule} />

        {/* ── 5. Architecture ───────────────────────── */}
        <div className={styles.archRow}>
          <span className={styles.fieldLabel}>Architecture</span>
          <span className={styles.fieldValue}>{archDisplay}</span>
        </div>

        {/* ── 6. Complications ──────────────────────── */}
        <div className={styles.complications}>
          {card.complications.map((c) => (
            <span key={c} className={styles.complication}>
              {c}
            </span>
          ))}
        </div>

        {/* ── 7. Footer: numéro de série + projet ─────── */}
        <footer className={styles.footer}>
          <span className={styles.serial}>
            N°{card.serial.toString().padStart(4, "0")}
          </span>
          <span className={styles.project}>{card.project}</span>
        </footer>

        {/* ── Sapphire glass glare — every tier has glass ── */}
        <div className={styles.glare} aria-hidden="true" />

        {/* ── Foil shimmer overlay (Maîtrise+) ──────── */}
        {rarity.foilActive && <div className={styles.foilOverlay} aria-hidden="true" />}

        {/* ── Lume halo (Grande Œuvre+) ─────────────── */}
        {rarity.lumeActive && <div className={styles.lumeHalo} aria-hidden="true" />}
      </article>
    </div>
  );
}
