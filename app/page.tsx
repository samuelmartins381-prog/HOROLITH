import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Horolith",
};

export default function HomePage() {
  return (
    <main className={styles.page} aria-label="Horolith — accueil">
      <GuillocheBg />

      <div className={styles.content}>
        <p className={styles.calibre}>Calibre HRL-0 · Fondations</p>

        <h1 className={styles.wordmark}>Horolith</h1>

        <div className={styles.divider} aria-hidden="true" />

        <p className={styles.tagline}>L&apos;art de la collection horlogère</p>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerLabel}>
          <span className={styles.footerDot} aria-hidden="true" />
          Phase 0 · Fondations
        </div>
      </footer>
    </main>
  );
}

function GuillocheBg() {
  return (
    <div aria-hidden="true" className={styles.guillocheBg}>
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="guilloche-pattern"
            x="0"
            y="0"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect
              x="1"
              y="1"
              width="22"
              height="22"
              fill="none"
              stroke="#e8e6e1"
              strokeWidth="0.5"
            />
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              fill="none"
              stroke="#e8e6e1"
              strokeWidth="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#guilloche-pattern)" />
      </svg>
    </div>
  );
}
