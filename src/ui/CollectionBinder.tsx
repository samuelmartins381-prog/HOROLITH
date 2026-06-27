"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCollectionStore } from "@/src/state/collection-store";
import { HOUSES } from "@/src/game/canon/houses";
import { RARITY_ORDER } from "@/src/game/canon/rarities";
import {
  HOUSE_NAMES,
  TIER_NAMES,
  HOUSE_COLORS,
  TIER_COLORS,
} from "@/src/render/card/card-constants";
import CardThumb from "@/src/render/card/CardThumb";
import type { HouseId, RarityId } from "@/src/game/canon/types";
import styles from "./CollectionBinder.module.css";

type HouseFilter = HouseId | "all";
type RarityFilter = RarityId | "all";

export default function CollectionBinder() {
  const [mounted, setMounted] = useState(false);
  const [houseFilter, setHouseFilter] = useState<HouseFilter>("all");
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");

  const getOwnedCards = useCollectionStore((s) => s.getOwnedCards);
  const newIds = useCollectionStore((s) => s.newIds);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }

  const allCards = getOwnedCards();

  const filtered = allCards.filter((c) => {
    if (houseFilter !== "all" && c.house !== houseFilter) return false;
    if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false;
    return true;
  });

  const houseIds = Object.keys(HOUSES) as HouseId[];

  return (
    <div className={styles.binder}>
      {/* ── Header ──────────────────────────────── */}
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Horolith
        </Link>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Ma Collection</h1>
          <span className={styles.count}>
            {allCards.length}&thinsp;création{allCards.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      {/* ── House filter ─────────────────────────── */}
      <div className={styles.filterBar} role="group" aria-label="Filtrer par maison">
        <button
          className={`${styles.filterBtn} ${houseFilter === "all" ? styles.filterActive : ""}`}
          onClick={() => setHouseFilter("all")}
        >
          Tout
        </button>
        {houseIds.map((h) => (
          <button
            key={h}
            className={`${styles.filterBtn} ${houseFilter === h ? styles.filterActive : ""}`}
            style={{ "--house-color": HOUSE_COLORS[h] } as React.CSSProperties}
            onClick={() => setHouseFilter(houseFilter === h ? "all" : h)}
          >
            {HOUSE_NAMES[h]}
          </button>
        ))}
      </div>

      {/* ── Rarity filter ───────────────────────── */}
      <div className={styles.rarityBar} role="group" aria-label="Filtrer par niveau">
        <button
          className={`${styles.rarityBtn} ${rarityFilter === "all" ? styles.rarityActive : ""}`}
          onClick={() => setRarityFilter("all")}
        >
          Tous niveaux
        </button>
        {RARITY_ORDER.map((r) => (
          <button
            key={r}
            className={`${styles.rarityBtn} ${rarityFilter === r ? styles.rarityActive : ""}`}
            style={{ "--tier-color": TIER_COLORS[r] } as React.CSSProperties}
            onClick={() => setRarityFilter(rarityFilter === r ? "all" : r)}
          >
            {TIER_NAMES[r]}
          </button>
        ))}
      </div>

      {/* ── Grid ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>Aucune création dans cette sélection.</p>
        </div>
      ) : (
        <ul className={styles.grid} aria-label="Créations de la collection">
          {filtered.map((card) => (
            <li key={card.id} className={styles.gridItem}>
              <CardThumb card={card} isNew={newIds.includes(card.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
