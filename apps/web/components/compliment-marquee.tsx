"use client";

import { useEffect, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { fetchRecent, type ComplimentItem } from "@/lib/api";

const SEED: ComplimentItem[] = [
  { id: -1, name: "Annie", message: "your laugh is contagious and i hope you know it", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -2, name: null, message: "you're a good one. keep going.", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -3, name: "M", message: "that jacket? a choice. and the right one.", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -4, name: "stranger", message: "i saw you help someone at the water station. it mattered.", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -5, name: null, message: "the way you moved at sunset was proof that joy is a real substance", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -6, name: "J", message: "your energy is the reason the room felt warmer", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -7, name: null, message: "you're allowed to take up space. please do.", has_audio: false, duration_ms: null, created_at: 0 },
  { id: -8, name: "phone 3", message: "whoever picks up next — i hope your day breaks open softly", has_audio: false, duration_ms: null, created_at: 0 },
];

export function ComplimentMarquee() {
  const [items, setItems] = useState<ComplimentItem[]>(SEED);

  useEffect(() => {
    fetchRecent()
      .then((data) => {
        if (data.items.length > 0) setItems([...data.items, ...SEED].slice(0, 16));
      })
      .catch(() => {});
  }, []);

  const doubled = [...items, ...items];

  return (
    <section className="relative border-y border-border/20 bg-card/30 py-10" aria-label="Live compliments">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground text-center mb-6">
        LIVE from the hotline
      </p>
      <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
        <div
          className="flex gap-4 whitespace-nowrap"
          style={{ width: "max-content", animation: "ch-marquee 40s linear infinite" }}
        >
          {doubled.map((c, i) => (
            <Card
              key={`${c.id}-${i}`}
              className="shrink-0 min-w-[280px] max-w-[420px] inline-flex flex-col gap-1 px-6 py-4 bg-card/70 border-border/30"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-magenta">
                {c.name || "anonymous"}
              </div>
              <div className="text-foreground text-base whitespace-normal leading-snug font-serif italic">
                &ldquo;{c.message || (c.has_audio ? "🎙 audio compliment" : "")}&rdquo;
              </div>
            </Card>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes ch-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="ch-marquee"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
