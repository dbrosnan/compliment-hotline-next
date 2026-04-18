"use client";

/**
 * MCMDivider — full-bleed decorative divider between sections.
 *
 * variants:
 *   "starburst" — 40 radial lines, alternating coral/midnight, varying
 *                 lengths to evoke a 1960s sunburst motif.
 *   "curve"     — a single midnight sine curve, flat and understated.
 *
 * Static by default; honors `prefers-reduced-motion` (no animation either way).
 */

import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

type Variant = "starburst" | "curve";

export interface MCMDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

const RAY_COUNT = 40;
const VIEW_W = 1000;
const VIEW_H_STAR = 80;
const VIEW_H_CURVE = 60;
const CENTER_Y = 40;

function buildStarburstRays() {
  const rays: Array<{ x2: number; y2: number; stroke: string; width: number }> = [];
  // Cast rays across the full width; length pattern short-long-short-long.
  // Rays fan out in a flattened arc (angle between -60deg and +60deg from up).
  for (let i = 0; i < RAY_COUNT; i++) {
    const t = i / (RAY_COUNT - 1); // 0..1
    const angleDeg = -60 + t * 120; // -60..+60
    const angleRad = (angleDeg * Math.PI) / 180;

    // Length pattern: short (16), long (34), medium (22), extra-long (42)
    const lengthPattern = [16, 34, 22, 42];
    const len = lengthPattern[i % lengthPattern.length]!;

    // Origin at horizontal center; point up and outward.
    const originX = VIEW_W / 2;
    const originY = CENTER_Y;
    const x2 = originX + Math.sin(angleRad) * (VIEW_W / 2.2) * (0.3 + 0.7 * (len / 42));
    const y2 = originY - Math.cos(angleRad) * len;

    const isAccent = i % 3 === 0;
    rays.push({
      x2,
      y2,
      stroke: isAccent ? "var(--ch-midnight)" : "var(--ch-coral)",
      width: isAccent ? 1.5 : 2,
    });
  }
  return rays;
}

function Starburst() {
  const rays = React.useMemo(buildStarburstRays, []);
  const originX = VIEW_W / 2;
  const originY = CENTER_Y;
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H_STAR}`}
      preserveAspectRatio="none"
      className="block h-[80px] w-full"
      aria-hidden="true"
      role="presentation"
    >
      {rays.map((r, i) => (
        <line
          key={i}
          x1={originX}
          y1={originY}
          x2={r.x2}
          y2={r.y2}
          stroke={r.stroke}
          strokeWidth={r.width}
          strokeLinecap="round"
        />
      ))}
      {/* Center dot for visual weight */}
      <circle cx={originX} cy={originY} r={3} fill="var(--ch-midnight)" />
    </svg>
  );
}

function Curve() {
  // Sine curve across full width: y = center + amp * sin(2π x / wavelength)
  const amp = 14;
  const samples = 120;
  const midY = VIEW_H_CURVE / 2;
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const x = (i / samples) * VIEW_W;
    const y = midY + amp * Math.sin((i / samples) * Math.PI * 2);
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H_CURVE}`}
      preserveAspectRatio="none"
      className="block h-[60px] w-full"
      aria-hidden="true"
      role="presentation"
    >
      <path
        d={pts.join(" ")}
        fill="none"
        stroke="var(--ch-midnight)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

function MCMDivider({ variant = "starburst", className, ...rest }: MCMDividerProps) {
  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      data-mcm-divider={variant}
      {...rest}
    >
      {variant === "starburst" ? <Starburst /> : <Curve />}
    </div>
  );
}

export { MCMDivider };
