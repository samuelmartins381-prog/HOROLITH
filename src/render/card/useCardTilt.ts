"use client";

import { useEffect, useRef, useCallback, type RefObject } from "react";

/* Pointer-driven tilt engine for HorolCard.
   Writes CSS custom properties directly inside a rAF loop — zero React
   re-renders per pointer event, frame-rate-independent smoothing, and a
   mechanical settle back to rest when the pointer leaves. */

const MAX_TILT = 10; // deg
const FOIL_TRAVEL = 28; // %
const GLARE_TRAVEL = 34; // %
const SMOOTHING = 0.16; // portion of remaining distance per 60 fps frame
const EPSILON = 0.015;

interface Vec {
  tx: number;
  ty: number;
  fx: number;
  fy: number;
  gx: number;
  gy: number;
  go: number;
  s: number;
}

const REST: Vec = { tx: 0, ty: 0, fx: 50, fy: 50, gx: 50, gy: 35, go: 0, s: 1 };
const KEYS = Object.keys(REST) as (keyof Vec)[];

export function useCardTilt(
  sceneRef: RefObject<HTMLDivElement | null>,
  cardRef: RefObject<HTMLElement | null>
) {
  const target = useRef<Vec>({ ...REST });
  const current = useRef<Vec>({ ...REST });
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const apply = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    const c = current.current;
    el.style.setProperty("--tilt-x", `${c.tx.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${c.ty.toFixed(2)}deg`);
    el.style.setProperty("--foil-x", `${c.fx.toFixed(2)}%`);
    el.style.setProperty("--foil-y", `${c.fy.toFixed(2)}%`);
    el.style.setProperty("--glare-x", `${c.gx.toFixed(2)}%`);
    el.style.setProperty("--glare-y", `${c.gy.toFixed(2)}%`);
    el.style.setProperty("--glare-o", c.go.toFixed(3));
    el.style.setProperty("--card-scale", c.s.toFixed(4));
  }, [cardRef]);

  const step = useCallback(
    (now: number) => {
      const dt = Math.min((now - lastTime.current) / 1000, 0.05);
      lastTime.current = now;
      const k = 1 - Math.pow(1 - SMOOTHING, dt * 60);

      const t = target.current;
      const c = current.current;
      let settled = true;
      for (const key of KEYS) {
        c[key] += (t[key] - c[key]) * k;
        if (Math.abs(t[key] - c[key]) > EPSILON) settled = false;
      }
      apply();

      if (settled) {
        Object.assign(c, t);
        apply();
        rafId.current = null;
        return;
      }
      rafId.current = requestAnimationFrame(step);
    },
    [apply]
  );

  const kick = useCallback(() => {
    if (rafId.current === null) {
      lastTime.current = performance.now();
      rafId.current = requestAnimationFrame(step);
    }
  }, [step]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reduced.current) return;
      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const dy = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.current = {
        tx: -dy * MAX_TILT,
        ty: dx * MAX_TILT,
        fx: 50 + dx * FOIL_TRAVEL,
        fy: 50 + dy * FOIL_TRAVEL,
        gx: 50 + dx * GLARE_TRAVEL,
        gy: 38 + dy * GLARE_TRAVEL,
        go: 1,
        s: 1.02,
      };
      kick();
    },
    [sceneRef, kick]
  );

  const onPointerLeave = useCallback(() => {
    target.current = { ...REST };
    kick();
  }, [kick]);

  return { onPointerMove, onPointerLeave };
}
