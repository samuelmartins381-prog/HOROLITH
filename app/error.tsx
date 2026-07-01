"use client";

import { useEffect } from "react";
import styles from "./error.module.css";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className={styles.page} aria-label="Une erreur est survenue">
      <div className={styles.container}>
        <p className={styles.code} aria-hidden="true">
          —
        </p>
        <h1 className={styles.heading}>Erreur inattendue</h1>
        <p className={styles.body}>
          Un incident s&rsquo;est produit. Nos horlogers en ont été informés.
        </p>
        <button className={styles.back} onClick={reset}>
          Réessayer
        </button>
      </div>
    </main>
  );
}
