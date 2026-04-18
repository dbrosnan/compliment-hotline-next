"use client";

/**
 * MCM decorative ornaments — Boomerang, Sputnik, KidneyBean.
 *
 * Each is a small SVG with a gentle "breath" scale animation (1.0 → 1.08 → 1.0
 * over 4s). Respects `prefers-reduced-motion` via a matching media query on
 * the keyframes — we hold the base scale when the user opts out of motion.
 */

import * as React from "react";

// Gradient set — duplicated from psychedelic-icons.tsx so ornaments are
// self-contained and won't collide with those icons' gradient ids.
const ORNAMENT_GRADS = [
  { id: "mcmg-citrus", from: "oklch(0.89 0.17 92)", to: "oklch(0.72 0.21 22)" },
  { id: "mcmg-coral", from: "oklch(0.72 0.21 22)", to: "oklch(0.70 0.28 338)" },
  { id: "mcmg-mint", from: "oklch(0.89 0.15 162)", to: "oklch(0.70 0.28 338)" },
  { id: "mcmg-magenta", from: "oklch(0.70 0.28 338)", to: "oklch(0.45 0.27 291)" },
  { id: "mcmg-primary", from: "oklch(0.45 0.27 291)", to: "oklch(0.89 0.17 92)" },
] as const;

type Grad = (typeof ORNAMENT_GRADS)[number];

interface OrnamentProps {
  size?: number;
  color?: string;
  className?: string;
}

// Inline keyframes + reduced-motion guard. Scoped via unique animation name.
const BREATH_CSS = `
@keyframes mcm-breath {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
@media (prefers-reduced-motion: reduce) {
  [data-mcm-ornament] { animation: none !important; transform: none !important; }
}
`;

let injected = false;
function useInjectBreathCss() {
  React.useEffect(() => {
    if (injected || typeof document === "undefined") return;
    const style = document.createElement("style");
    style.setAttribute("data-mcm-ornament-css", "");
    style.textContent = BREATH_CSS;
    document.head.appendChild(style);
    injected = true;
  }, []);
}

function ornamentStyle(size: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    display: "inline-block",
    transformOrigin: "center",
    animation: "mcm-breath 4s ease-in-out infinite",
  };
}

function Boomerang({ size = 48, color = "var(--ch-coral)", className }: OrnamentProps) {
  useInjectBreathCss();
  return (
    <svg
      data-mcm-ornament="boomerang"
      viewBox="0 0 48 48"
      className={className}
      style={ornamentStyle(size)}
      aria-hidden="true"
      role="presentation"
    >
      <path
        d="M 8 34 Q 14 8 24 14 Q 34 20 40 34"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Sputnik({ size = 48, color = "var(--ch-coral)", className }: OrnamentProps) {
  useInjectBreathCss();
  // 5-point star geometry around center (24,24), outer r=10, inner r=4.
  const cx = 24;
  const cy = 24;
  const rOuter = 10;
  const rInner = 4;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  const satellites = [
    { x: 24, y: 6, tip: { x: 24, y: 2 } },
    { x: 42, y: 24, tip: { x: 46, y: 24 } },
    { x: 24, y: 42, tip: { x: 24, y: 46 } },
    { x: 6, y: 24, tip: { x: 2, y: 24 } },
  ];
  return (
    <svg
      data-mcm-ornament="sputnik"
      viewBox="0 0 48 48"
      className={className}
      style={ornamentStyle(size)}
      aria-hidden="true"
      role="presentation"
    >
      {satellites.map((s, i) => (
        <g key={i}>
          <line
            x1={cx}
            y1={cy}
            x2={s.tip.x}
            y2={s.tip.y}
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
          />
          <circle cx={s.tip.x} cy={s.tip.y} r={1.6} fill={color} />
        </g>
      ))}
      <polygon points={pts.join(" ")} fill={color} />
    </svg>
  );
}

function KidneyBean({ size = 48, className }: OrnamentProps & { gradIndex?: number }) {
  useInjectBreathCss();
  const uid = React.useId().replace(/:/g, "");
  const gradId = `${ORNAMENT_GRADS[1]!.id}-${uid}`;
  const g: Grad = ORNAMENT_GRADS[1]!;
  return (
    <svg
      data-mcm-ornament="kidney"
      viewBox="0 0 48 48"
      className={className}
      style={ornamentStyle(size)}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g.from} />
          <stop offset="100%" stopColor={g.to} />
        </linearGradient>
      </defs>
      {/* Lima-bean shape: outer curve + indented inner curve. */}
      <path
        d="M 14 10 C 4 14, 4 34, 14 38 C 24 42, 36 38, 40 28 C 42 22, 32 22, 30 18 C 28 12, 22 8, 14 10 Z"
        fill={`url(#${gradId})`}
        stroke="var(--ch-midnight)"
        strokeWidth={1.25}
      />
    </svg>
  );
}

export { Boomerang, Sputnik, KidneyBean };
