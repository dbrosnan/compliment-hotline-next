"use client";

import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";

export function Counter() {
  const [count, setCount] = useState<number>(247);

  useEffect(() => {
    fetchStats()
      .then((s) => {
        if (typeof s.total === "number") setCount(s.total);
      })
      .catch(() => {});
  }, []);

  const digits = String(count).padStart(5, "0").split("");

  return (
    <section className="px-6 py-20">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
          Total compliments received
        </p>
        <div className="flex justify-center gap-2">
          {digits.map((d, i) => (
            <div
              key={i}
              className="relative flex h-24 w-16 items-center justify-center rounded-lg border border-border/30 bg-background/80 font-display text-5xl text-citrus shadow-inner md:h-36 md:w-24 md:text-7xl"
            >
              <span className="relative z-10">{d}</span>
              <div className="absolute inset-x-0 top-1/2 border-t border-border/15" />
            </div>
          ))}
        </div>
        <p className="mt-6 text-muted-foreground/80">and counting.</p>
      </div>
    </section>
  );
}
