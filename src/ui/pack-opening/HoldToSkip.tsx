"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./HoldToSkip.module.css";

const HOLD_MS = 1500;
const R = 17;
const CIRC = 2 * Math.PI * R;

interface HoldToSkipProps {
  onSkip: () => void;
}

export default function HoldToSkip({ onSkip }: HoldToSkipProps) {
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onSkipRef = useRef(onSkip);

  useEffect(() => {
    onSkipRef.current = onSkip;
  }, [onSkip]);

  const start = useCallback(() => {
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - (startRef.current ?? 0);
      const p = Math.min(elapsed / HOLD_MS, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onSkipRef.current();
        startRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    startRef.current = null;
    setProgress(0);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const offset = CIRC * (1 - progress);

  return (
    <button
      className={styles.btn}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      aria-label="Maintenir pour passer"
    >
      <svg
        className={styles.ring}
        viewBox="0 0 40 40"
        width="40"
        height="40"
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r={R}
          fill="none"
          stroke="rgba(232,230,225,0.09)"
          strokeWidth="1.5"
        />
        <circle
          cx="20"
          cy="20"
          r={R}
          fill="none"
          stroke="var(--or-rose)"
          strokeWidth="1.5"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 20 20)"
        />
      </svg>
      <span className={styles.label}>passer</span>
    </button>
  );
}
