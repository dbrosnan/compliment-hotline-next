"use client";

import { useEffect, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { fetchRecent, type ComplimentItem } from "@/lib/api";

/**
 * Audio-only live marquee. Displays approved audio compliments as
 * name + duration pills that scroll across the bottom of the hero.
 * Falls back to a SKELETON or an empty-state CTA; no text fallback
 * since text compliments were removed.
 */
export function ComplimentMarquee() {
  const [items, setItems] = useState<ComplimentItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRecent()
      .then((data) => {
        if (cancelled) return;
        // Only show items that actually have audio.
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
      className="relative border-y border-border/30 bg-card/30 py-10"
      aria-label="Live compliments"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground text-center mb-6">
        LIVE from the hotline
      </p>

      {items === null && <MarqueeSkeleton />}
      {items !== null && items.length === 0 && <MarqueeEmpty />}
      {items !== null && items.length > 0 && <MarqueeTrack items={items} />}
    </section>
  );
}

function MarqueeTrack({ items }: { items: ComplimentItem[] }) {
  const doubled = [...items, ...items, ...items];
  return (
    <>
      <div
        className="overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}
      >
        <div
          className="flex gap-4 whitespace-nowrap"
          style={{ width: "max-content", animation: "ch-marquee 40s linear infinite" }}
        >
          {doubled.map((c, i) => {
            const secs = c.duration_ms ? Math.round(c.duration_ms / 1000) : null;
            // Transcript is hidden text for screen readers + hover tooltip.
            // Visually we keep it a mystery — you have to pick up to hear.
            const speaker = c.name || "a stranger";
            const ariaLabel = c.transcript
              ? `${secs ?? "?"}s compliment from ${speaker}: ${c.transcript}`
              : `${secs ?? "?"}s compliment from ${speaker}`;
            return (
              <Card
                key={`${c.id}-${i}`}
                className="shrink-0 inline-flex items-center gap-3 px-5 py-3 bg-card/70 border-border/30"
                aria-label={ariaLabel}
                title={c.transcript || undefined}
              >
                <span className="text-lg" aria-hidden>🎙</span>
                <span className="font-display text-lg text-foreground tracking-wide">
                  {speaker}
                </span>
                {secs !== null && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {secs}s
                  </span>
                )}
              </Card>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes ch-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); }
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
            className="shrink-0 inline-flex items-center gap-3 px-5 py-3 bg-card/40 border-border/30"
          >
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-sm" />
            <Skeleton className="h-3 w-8 rounded-sm" />
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
