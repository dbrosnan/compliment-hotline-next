"use client";

import { useMemo } from "react";

type Props = { count?: number };

export function SparkleField({ count = 32 }: Props) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 10,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 6,
        hue: ["oklch(0.89 0.17 92)", "oklch(0.70 0.28 338)", "oklch(0.89 0.15 162)", "oklch(0.93 0.04 82)"][i % 4]!,
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
          <svg viewBox="0 0 20 20" className="w-full h-full" style={{ filter: `drop-shadow(0 0 6px ${s.hue})` }}>
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill={s.hue} opacity="0.85" />
          </svg>
        </div>
      ))}
      <style>{`@keyframes ch-float {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(30deg); }
      }`}</style>
    </div>
  );
}
