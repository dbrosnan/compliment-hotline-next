"use client";

import { useMemo } from "react";

type Props = { count?: number };

/**
 * Mid-century modern atomic starbursts scattered across the hero. Each
 * sparkle is 6 midnight-ink rays radiating from a tiny coral dot — no
 * glow, all hard ink, Knoll-era flat decoration on butter yellow.
 */
export function SparkleField({ count = 32 }: Props) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 8 + Math.random() * 6,
        delay: Math.random() * 6,
        // 1.25x slower than the previous 4-6s range
        duration: 5 + Math.random() * 7.5,
      })),
    [count],
  );

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animation: `ch-float ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <AtomicBurst />
        </div>
      ))}
      <style>{`@keyframes ch-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(30deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        [style*="ch-float"] { animation: none !important; }
      }`}</style>
    </div>
  );
}

function AtomicBurst() {
  // 6 rays at 30° increments (0, 30, 60, 90, 120, 150) — since lines are
  // bidirectional this gives 6 visible arms radiating from center.
  const rayStroke = "oklch(0.17 0.08 290 / 0.4)";
  const dotFill = "oklch(0.72 0.21 22)";
  return (
    <svg viewBox="0 0 20 20" className="w-full h-full">
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <line
          key={deg}
          x1="10"
          y1="2"
          x2="10"
          y2="18"
          stroke={rayStroke}
          strokeWidth="1"
          strokeLinecap="round"
          transform={`rotate(${deg} 10 10)`}
        />
      ))}
      <circle cx="10" cy="10" r="1.6" fill={dotFill} />
    </svg>
  );
}
