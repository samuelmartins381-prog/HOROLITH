import type { DialStyle } from "@/src/game/canon/types";

interface WatchFaceProps {
  dial: DialStyle;
}

/* Hour indices at 0, 30, 60, ... 330° (12 o'clock = 0°, clockwise) */
const HOUR_MARKERS = Array.from({ length: 12 }, (_, i) => {
  const rad = ((i * 30 - 90) * Math.PI) / 180;
  const major = i % 3 === 0;
  return {
    x1: +(100 + 82 * Math.cos(rad)).toFixed(3),
    y1: +(100 + 82 * Math.sin(rad)).toFixed(3),
    x2: +(100 + (major ? 72 : 76) * Math.cos(rad)).toFixed(3),
    y2: +(100 + (major ? 72 : 76) * Math.sin(rad)).toFixed(3),
    w: major ? 1.8 : 1.0,
  };
});

/* Minute ticks — skip the 12 hour-marker positions */
const MINUTE_TICKS = Array.from({ length: 60 }, (_, i) => {
  if (i % 5 === 0) return null;
  const rad = ((i * 6 - 90) * Math.PI) / 180;
  return {
    x1: +(100 + 82 * Math.cos(rad)).toFixed(3),
    y1: +(100 + 82 * Math.sin(rad)).toFixed(3),
    x2: +(100 + 79 * Math.cos(rad)).toFixed(3),
    y2: +(100 + 79 * Math.sin(rad)).toFixed(3),
  };
}).filter(Boolean);

/* Aventurine sparkles — deterministic LCG, no Math.random() */
function lcg(n: number) {
  return ((n * 1664525 + 1013904223) >>> 0) % 10000;
}
const SPARKLES = Array.from({ length: 72 }, (_, i) => {
  const s1 = lcg(i * 3 + 7);
  const s2 = lcg(i * 3 + 13);
  const s3 = lcg(i * 3 + 17);
  /* Distribute within a circle of r~84 centered at (100,100) */
  const angle = (s1 / 10000) * 2 * Math.PI;
  const radius = Math.sqrt(s2 / 10000) * 78;
  return {
    x: +(100 + radius * Math.cos(angle)).toFixed(2),
    y: +(100 + radius * Math.sin(angle)).toFixed(2),
    r: +(0.2 + (s3 % 55) / 220).toFixed(2),
    o: +(0.3 + (s3 % 65) / 130).toFixed(2),
  };
});

/* Sub-seconds ticks at 6 o'clock sub-dial */
const SUB_TICKS = Array.from({ length: 60 }, (_, i) => {
  const rad = ((i * 6 - 90) * Math.PI) / 180;
  const outer = i % 5 === 0 ? 8 : 7.5;
  const inner = i % 5 === 0 ? 6 : 7;
  return {
    x1: +(outer * Math.cos(rad)).toFixed(3),
    y1: +(outer * Math.sin(rad)).toFixed(3),
    x2: +(inner * Math.cos(rad)).toFixed(3),
    y2: +(inner * Math.sin(rad)).toFixed(3),
  };
});

export default function WatchFace({ dial }: WatchFaceProps) {
  const isAventurine = dial === "aventurine";

  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="wf-bezel" cx="42%" cy="38%">
          <stop offset="0%" stopColor="#3c3c40" />
          <stop offset="100%" stopColor="#101012" />
        </radialGradient>
        <radialGradient id="wf-aventurine" cx="38%" cy="32%">
          <stop offset="0%" stopColor="#1a2840" />
          <stop offset="55%" stopColor="#0d1825" />
          <stop offset="100%" stopColor="#07101a" />
        </radialGradient>
        <radialGradient id="wf-dial-default" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#252018" />
          <stop offset="100%" stopColor="#0f0d0a" />
        </radialGradient>
        <radialGradient id="wf-glass" cx="32%" cy="28%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.09)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.01)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.06)" />
        </radialGradient>
        <clipPath id="wf-clip">
          <circle cx="100" cy="100" r="87" />
        </clipPath>
      </defs>

      {/* Outer bezel */}
      <circle cx="100" cy="100" r="98" fill="url(#wf-bezel)" />
      <circle
        cx="100"
        cy="100"
        r="93.5"
        fill="none"
        stroke="rgba(201,163,107,0.28)"
        strokeWidth="0.5"
      />
      <circle
        cx="100"
        cy="100"
        r="89"
        fill="none"
        stroke="rgba(201,163,107,0.12)"
        strokeWidth="0.3"
      />

      {/* Dial background */}
      <circle
        cx="100"
        cy="100"
        r="87"
        fill={isAventurine ? "url(#wf-aventurine)" : "url(#wf-dial-default)"}
      />

      {/* Aventurine sparkle particles */}
      {isAventurine &&
        SPARKLES.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#c9a36b"
            opacity={s.o}
            clipPath="url(#wf-clip)"
          />
        ))}

      {/* Minute track ring */}
      <circle
        cx="100"
        cy="100"
        r="83.5"
        fill="none"
        stroke="rgba(201,163,107,0.2)"
        strokeWidth="0.4"
      />

      {/* Minute ticks */}
      {MINUTE_TICKS.map(
        (t, i) =>
          t && (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="rgba(232,230,225,0.35)"
              strokeWidth="0.55"
            />
          )
      )}

      {/* Hour indices */}
      {HOUR_MARKERS.map((m, i) => (
        <line
          key={i}
          x1={m.x1}
          y1={m.y1}
          x2={m.x2}
          y2={m.y2}
          stroke="rgba(201,163,107,0.88)"
          strokeWidth={m.w}
          strokeLinecap="square"
        />
      ))}

      {/* Moon-phase aperture at 12 o'clock (aventurine / astronomical dials) */}
      {isAventurine && (
        <g transform="translate(100,66)">
          <circle cx="0" cy="0" r="9.5" fill="rgba(0,0,0,0.5)" />
          <circle cx="0" cy="0" r="8.5" fill="#080e18" />
          <circle cx="0" cy="0" r="6.5" fill="#c9a36b" opacity="0.65" />
          <circle cx="2.5" cy="0" r="5.5" fill="#080e18" />
          <circle cx="-3.2" cy="-3" r="0.45" fill="#e8e6e1" opacity="0.75" />
          <circle cx="-5.2" cy="1.5" r="0.3" fill="#e8e6e1" opacity="0.55" />
          <circle cx="5" cy="-2.5" r="0.3" fill="#e8e6e1" opacity="0.5" />
          <circle
            cx="0"
            cy="0"
            r="9.5"
            fill="none"
            stroke="rgba(201,163,107,0.35)"
            strokeWidth="0.5"
          />
        </g>
      )}

      {/* Sub-seconds dial at 6 o'clock */}
      <g transform="translate(100,136)">
        <circle cx="0" cy="0" r="10.5" fill="rgba(0,0,0,0.35)" />
        <circle
          cx="0"
          cy="0"
          r="9.5"
          fill={isAventurine ? "rgba(7,16,26,0.7)" : "rgba(0,0,0,0.4)"}
        />
        {SUB_TICKS.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke="rgba(232,230,225,0.28)"
            strokeWidth="0.4"
          />
        ))}
        {/* Sub-seconds hand — lume coloured for aventurine */}
        <line
          x1="0"
          y1="1.5"
          x2="0"
          y2="-7"
          stroke={isAventurine ? "#c8d9c0" : "rgba(201,163,107,0.7)"}
          strokeWidth="0.55"
          strokeLinecap="round"
        />
        <circle
          cx="0"
          cy="0"
          r="1"
          fill={isAventurine ? "#c8d9c0" : "#c9a36b"}
          opacity="0.8"
        />
        <circle
          cx="0"
          cy="0"
          r="9.5"
          fill="none"
          stroke="rgba(201,163,107,0.25)"
          strokeWidth="0.4"
        />
      </g>

      {/* Hour hand — 10:10 → 305° clockwise from 12 */}
      <g transform="rotate(305,100,100)">
        <line
          x1="100"
          y1="104"
          x2="100"
          y2="64"
          stroke="#c9a36b"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="104"
          x2="100"
          y2="111"
          stroke="#c9a36b"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>

      {/* Minute hand — 10 min → 60° clockwise from 12 */}
      <g transform="rotate(60,100,100)">
        <line
          x1="100"
          y1="104"
          x2="100"
          y2="50"
          stroke="#c9a36b"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="104"
          x2="100"
          y2="111"
          stroke="#c9a36b"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>

      {/* Centre cap */}
      <circle cx="100" cy="100" r="3.2" fill="#0e0e10" />
      <circle cx="100" cy="100" r="1.6" fill="#c9a36b" />

      {/* Sapphire glass reflection */}
      <circle cx="100" cy="100" r="87" fill="url(#wf-glass)" />
    </svg>
  );
}
