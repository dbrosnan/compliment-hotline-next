"use client";

import { useEffect, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { fetchRecent, type ComplimentItem } from "@/lib/api";
import { PsychedelicIcon } from "./psychedelic-icons";

/**
 * Audio-only live marquee. The cards drift right→left uniformly, but on
 * top of that each card independently:
 *   - bobs on Y with its own phase (7s)
 *   - tilts rotation with its own phase (11s)
 *   - breathes scale (5s)
 *   - sways X slightly (13s) — creates a serpentine ribbon effect
 *   - hue-rotates its icon filter (17s)
 * All periods are coprime so the compound motion never repeats.
 */
export function ComplimentMarquee() {
  const [items, setItems] = useState<ComplimentItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRecent()
      .then((data) => {
        if (cancelled) return;
        const audio = data.items.filter((c) => c.has_audio);
        setItems(audio);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      className="relative border-y border-border/30 bg-card/30 py-14 overflow-hidden"
      aria-label="Live compliments"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground text-center mb-8">
        LIVE from the hotline
      </p>

      {items === null && <MarqueeSkeleton />}
      {items !== null && items.length === 0 && <MarqueeEmpty />}
      {items !== null && items.length > 0 && <MarqueeTrack items={items} />}
    </section>
  );
}

// Deterministic pseudo-random [0,1) from a seed.
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Math.abs(x - Math.floor(x));
};

// Returns a negative animation-delay in seconds for a given seed + period.
// Picking `-[0..period)` makes each card start mid-cycle at a random point.
const phase = (seed: number, period: number) =>
  `-${(rand(seed) * period).toFixed(2)}s`;

function MarqueeTrack({ items }: { items: ComplimentItem[] }) {
  const doubled = [...items, ...items, ...items];
  return (
    <>
      <div
        className="overflow-hidden py-8"
        style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
      >
        <div
          className="flex gap-6 whitespace-nowrap"
          style={{ width: "max-content", animation: "ch-marquee 60s linear infinite" }}
        >
          {doubled.map((c, i) => {
            const secs = c.duration_ms ? Math.round(c.duration_ms / 1000) : null;
            const speaker = c.name || "a stranger";
            const quote = (c.transcript || "").trim();
            const ariaLabel = quote
              ? `${secs ?? "?"}s compliment from ${speaker}: ${quote}`
              : `${secs ?? "?"}s compliment from ${speaker}`;
            // seed each trip through the list independently so the same
            // compliment wobbles differently in its 3 positions.
            const seed = c.id * 131 + i * 17;
            // 5 coprime-ish periods. Pack into a single CSS
            // animation-delay list matching the order in .ch-trippy below.
            const delay = [
              phase(seed, 7),   // bob Y
              phase(seed + 1, 11), // tilt
              phase(seed + 2, 5),  // breathe
              phase(seed + 3, 13), // sway X
              phase(seed + 4, 17), // hue
            ].join(", ");
            return (
              <div
                key={`${c.id}-${i}`}
                className="ch-trippy shrink-0"
                style={{ animationDelay: delay }}
              >
                <Card
                  className="inline-flex flex-col items-start gap-2 px-5 py-4 bg-card/70 border-border/30 w-[280px] whitespace-normal backdrop-blur-sm"
                  aria-label={ariaLabel}
                >
                  <div className="flex items-center gap-3 w-full">
                    <PsychedelicIcon id={c.id} size={36} />
                    <span className="font-display text-lg text-foreground tracking-wide truncate flex-1">
                      {speaker}
                    </span>
                    {secs !== null && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground shrink-0">
                        {secs}s
                      </span>
                    )}
                  </div>
                  {quote ? (
                    <p className="font-serif italic text-sm text-muted-foreground leading-snug line-clamp-2">
                      “{quote}”
                    </p>
                  ) : (
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                      pick up to hear
                    </p>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes ch-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
        }
        /* 5 independent wobbles layered on each card. Using individual
           transform properties (translate / rotate / scale) instead of
           the monolithic \`transform\` so they compose rather than
           overwrite each other. */
        @keyframes ch-bob-y {
          0%, 100% { translate: 0 -22px; }
          50%      { translate: 0 22px; }
        }
        @keyframes ch-tilt {
          0%, 100% { rotate: -8deg; }
          50%      { rotate: 8deg; }
        }
        @keyframes ch-breathe {
          0%, 100% { scale: 0.94; }
          50%      { scale: 1.08; }
        }
        @keyframes ch-sway-x {
          0%, 100% { transform: translateX(-10px); }
          50%      { transform: translateX(10px); }
        }
        @keyframes ch-hue {
          0%, 100% { filter: hue-rotate(0deg) saturate(1); }
          50%      { filter: hue-rotate(35deg) saturate(1.25); }
        }
        .ch-trippy {
          animation-name: ch-bob-y, ch-tilt, ch-breathe, ch-sway-x, ch-hue;
          animation-duration: 7s, 11s, 5s, 13s, 17s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          transform-origin: 50% 60%;
          will-change: translate, rotate, scale, transform, filter;
        }
        @media (prefers-reduced-motion: reduce) {
          .ch-trippy {
            animation: none !important;
            translate: 0 0 !important;
            rotate: 0 !important;
            scale: 1 !important;
          }
        }
      `}</style>
    </>
  );
}

function MarqueeSkeleton() {
  return (
    <div
      className="overflow-hidden"
      aria-busy
      aria-live="polite"
      style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
    >
      <div className="flex gap-4 whitespace-nowrap" style={{ width: "max-content" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="shrink-0 inline-flex flex-col items-start gap-2 px-5 py-4 bg-card/40 border-border/30 w-[280px]"
          >
            <div className="flex items-center gap-3 w-full">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-sm flex-1" />
              <Skeleton className="h-3 w-8 rounded-sm" />
            </div>
            <Skeleton className="h-3 w-full rounded-sm" />
            <Skeleton className="h-3 w-4/5 rounded-sm" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function MarqueeEmpty() {
  const scrollToSubmit = () => {
    document.getElementById("submit")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <div className="text-center py-6 flex flex-col items-center gap-3">
      <div className="text-3xl" aria-hidden>🎙</div>
      <p className="text-muted-foreground">No compliments yet — be the first to leave one.</p>
      <ShimmerButton
        onClick={scrollToSubmit}
        shimmerColor="oklch(0.89 0.17 92)"
        background="oklch(0.72 0.21 22)"
        borderRadius="9999px"
        shimmerDuration="2.4s"
        className="text-sm font-semibold text-midnight"
      >
        Record one →
      </ShimmerButton>
    </div>
  );
}
