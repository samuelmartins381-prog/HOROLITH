import Link from "next/link";
import type { Card } from "@/src/game/canon/types";
import { RARITIES } from "@/src/game/canon/rarities";
import WatchFace from "./WatchFace";
import { TIER_COLORS, HOUSE_COLORS, HOUSE_NAMES } from "./card-constants";
import styles from "./CardThumb.module.css";

interface CardThumbProps {
  card: Card;
  isNew?: boolean;
}

export default function CardThumb({ card, isNew }: CardThumbProps) {
  const tierColor = TIER_COLORS[card.rarity];
  const houseColor = HOUSE_COLORS[card.house];
  const rarity = RARITIES[card.rarity];

  return (
    <Link
      href={`/play/card/${card.id}`}
      className={styles.thumb}
      style={
        {
          "--tier-color": tierColor,
          "--house-color": houseColor,
        } as React.CSSProperties
      }
      aria-label={`${card.name} — ${HOUSE_NAMES[card.house]}`}
    >
      <div className={styles.face}>
        <WatchFace dial={card.dial} />
        {rarity.lumeActive && <div className={styles.lumeRing} aria-hidden="true" />}
      </div>

      <div className={styles.meta}>
        <span className={styles.name}>{card.name}</span>
        <div className={styles.tags}>
          <span className={styles.houseDot} />
          <span className={styles.houseLabel}>{HOUSE_NAMES[card.house]}</span>
        </div>
      </div>

      {isNew && (
        <span className={styles.newBadge} aria-label="Nouvelle création">
          nouveau
        </span>
      )}
    </Link>
  );
}
