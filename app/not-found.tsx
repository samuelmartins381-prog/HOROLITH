import Link from "next/link";
import type { Metadata } from "next";
import styles from "./error.module.css";

export const metadata: Metadata = {
  title: "Introuvable — Horolith",
};

export default function NotFound() {
  return (
    <main id="main-content" className={styles.page} aria-label="Page introuvable">
      <div className={styles.container}>
        <p className={styles.code} aria-hidden="true">
          404
        </p>
        <h1 className={styles.heading}>Introuvable</h1>
        <p className={styles.body}>Cette pièce n&rsquo;est pas dans nos archives.</p>
        <Link href="/" className={styles.back}>
          Retour à la manufacture
        </Link>
      </div>
    </main>
  );
}
