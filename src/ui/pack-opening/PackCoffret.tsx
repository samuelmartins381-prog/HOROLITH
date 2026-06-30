"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import styles from "./PackCoffret.module.css";

interface PackCoffretProps {
  isOpen: boolean;
  onAnimationComplete?: () => void;
}

export default function PackCoffret({ isOpen, onAnimationComplete }: PackCoffretProps) {
  const lidRef = useRef<HTMLDivElement>(null);
  const completeCbRef = useRef(onAnimationComplete);

  useEffect(() => {
    completeCbRef.current = onAnimationComplete;
  }, [onAnimationComplete]);

  useEffect(() => {
    if (!lidRef.current) return;
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
  }, [isOpen]);

  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.box}>
        {/* Interior velvet — revealed as lid opens */}
        <div className={styles.interior}>
          <span className={styles.interiorMark}>HOROLITH</span>
          <div className={styles.watchSlots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.watchSlot} />
            ))}
          </div>
        </div>

        {/* Lid */}
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
