"use client";

import { useMemo } from "react";
import type { RarityId } from "@/src/game/canon/types";
import styles from "./LumeParticles.module.css";

const N = 28;

// LCG — deterministic so server and client agree on initial render
function seededRand(seed: number) {
  let s = seed >>> 0;
  return (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

const COLORS: Partial<Record<RarityId, string[]>> = {
  "grande-oeuvre": ["#c8d9c0", "#a8c8a0", "#e0f0d8"],
  "opus-aeternum": ["#a8c8ff", "#d8ecff", "#c8d9c0", "#ffffff"],
};

interface LumeParticlesProps {
  rarity: RarityId;
}

export default function LumeParticles({ rarity }: LumeParticlesProps) {
  const particles = useMemo(() => {
    const colors = COLORS[rarity] ?? COLORS["grande-oeuvre"]!;
    const r = seededRand(rarity.charCodeAt(0) * 31 + N);
    return Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2 + r() * 0.5;
      const dist = 65 + r() * 70;
      return {
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: 1.5 + r() * 3,
        dur: 700 + r() * 600,
        delay: r() * 480,
        color: colors[Math.floor(r() * colors.length)],
      };
    });
  }, [rarity]);

  return (
    <div className={styles.container} aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className={styles.particle}
          style={
            {
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--dur": `${p.dur}ms`,
              "--delay": `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
