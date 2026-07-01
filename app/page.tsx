import Link from "next/link";
import type { Metadata } from "next";
import HorolCard from "@/src/render/card/HorolCard";
import { SEED_CARDS } from "@/src/game/canon/seed-cards";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Horolith",
};

const SHOWCASE_CARD = SEED_CARDS.find((c) => c.name === "Astrum Suprema")!;

export default function HomePage() {
  return (
    <main id="main-content" className={styles.page} aria-label="Horolith — accueil">
      <GuillocheBg />

      <div className={styles.layout}>
        {/* ── Brand column ──────────────────────────── */}
        <div className={styles.brand}>
          <p className={styles.eyebrow}>Manufacture · Horolith</p>

          <h1 className={styles.wordmark}>Horolith</h1>

          <div className={styles.divider} aria-hidden="true" />

          <p className={styles.tagline}>L&apos;art de la collection horlogère</p>

          <p className={styles.maisonsLine} aria-label="Les 8 Maisons Horolith">
            Valther · Orvain · Belvor · Caelis · Merian · Ferrand · Aurell · Corven
          </p>

          <blockquote className={styles.quote}>
            <p className={styles.quoteText}>
              &ldquo;Toute grande création doit rappeler que le temps dépasse
              l&apos;Homme.&rdquo;
            </p>
            <footer className={styles.quoteSource}>— Caelis, Premier Principe</footer>
          </blockquote>

          <nav className={styles.ctaNav} aria-label="Actions principales">
            <Link href="/play/open" className={styles.ctaPrimary}>
              Ouvrir un coffret
            </Link>
            <Link href="/play/collection" className={styles.ctaSecondary}>
              Ma collection&thinsp;→
            </Link>
          </nav>
        </div>

        {/* ── Card showcase ─────────────────────────── */}
        <div className={styles.stage}>
          <HorolCard card={SHOWCASE_CARD} />
        </div>
      </div>

      <footer className={styles.footer}>
        <span className={styles.footerDot} aria-hidden="true" />
        <span className={styles.footerLabel}>Caelis · Grande Œuvre · Aventurine</span>
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
            id="gp"
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
              strokeWidth="0.4"
            />
            <rect
              x="5"
              y="5"
              width="14"
              height="14"
              fill="none"
              stroke="#e8e6e1"
              strokeWidth="0.22"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#gp)" />
      </svg>
    </div>
  );
}
