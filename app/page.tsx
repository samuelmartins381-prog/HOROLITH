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
      <FloatingCards />

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

/* Scattered card backs floating behind the hero — the airy splash
   composition of the reference. Static: no looping motion at rest. */
const FLOATS: Array<React.CSSProperties> = [
  { top: "7%", left: "5%", width: 104, transform: "rotate(-13deg)", opacity: 0.7 },
  { top: "10%", right: "7%", width: 126, transform: "rotate(11deg)", opacity: 0.8 },
  { bottom: "13%", left: "9%", width: 116, transform: "rotate(7deg)", opacity: 0.75 },
  { bottom: "9%", right: "13%", width: 92, transform: "rotate(-9deg)", opacity: 0.6 },
  { top: "44%", left: "-30px", width: 132, transform: "rotate(17deg)", opacity: 0.5 },
  { top: "58%", right: "-24px", width: 110, transform: "rotate(-15deg)", opacity: 0.55 },
];

function FloatingCards() {
  return (
    <div aria-hidden="true" className={styles.floats}>
      {FLOATS.map((style, i) => (
        <div key={i} className={styles.floatCard} style={style}>
          <span className={styles.floatRule} />
          <span className={styles.floatWordmark}>Horolith</span>
          <span className={styles.floatRule} />
        </div>
      ))}
    </div>
  );
}
