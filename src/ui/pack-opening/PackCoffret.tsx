"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import styles from "./PackCoffret.module.css";

// R3F scene is client-only — dynamic import with no SSR
const CoffretScene = dynamic(() => import("@/src/render/coffret/CoffretScene"), {
  ssr: false,
  loading: () => null,
});

interface PackCoffretProps {
  isOpen: boolean;
  onAnimationComplete?: () => void;
}

export default function PackCoffret({ isOpen, onAnimationComplete }: PackCoffretProps) {
  const [use3D, setUse3D] = useState(false);
  const lidRef = useRef<HTMLDivElement>(null);
  const completeCbRef = useRef(onAnimationComplete);

  useEffect(() => {
    completeCbRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  // Detect WebGL once on mount; switches rendering mode if available
  useEffect(() => {
    const probe = document.createElement("canvas");
    setUse3D(!!(probe.getContext("webgl2") || probe.getContext("webgl")));
  }, []);

  // CSS-mode lid animation — only active when 3D is unavailable
  useEffect(() => {
    if (use3D || !lidRef.current) return;
    if (isOpen) {
      gsap.to(lidRef.current, {
        rotateX: -118,
        duration: 0.7,
        ease: "power3.out",
        onComplete: () => completeCbRef.current?.(),
      });
    } else {
      gsap.set(lidRef.current, { rotateX: 0 });
    }
  }, [isOpen, use3D]);

  if (use3D) {
    return (
      <div aria-hidden="true" style={{ lineHeight: 0 }}>
        <CoffretScene
          isOpen={isOpen}
          onAnimationComplete={() => completeCbRef.current?.()}
        />
      </div>
    );
  }

  // CSS 2D fallback — identical to pre-Phase-5 rendering
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.box}>
        <div className={styles.interior}>
          <span className={styles.interiorMark}>HOROLITH</span>
          <div className={styles.watchSlots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.watchSlot} />
            ))}
          </div>
        </div>
        <div ref={lidRef} className={styles.lid}>
          <div className={styles.lidFace}>
            <span className={styles.lidWordmark}>Horolith</span>
            <div className={styles.lidRule} aria-hidden="true" />
            <span className={styles.lidSub}>Manufacture Horlogère</span>
            <div className={styles.glint} aria-hidden="true" />
          </div>
        </div>
      </div>
      <div className={styles.shadow} />
    </div>
  );
}
