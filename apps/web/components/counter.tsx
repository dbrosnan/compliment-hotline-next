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
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
        Total compliments received
      </p>
      <div className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <div
            key={i}
            className="relative flex h-20 w-14 items-center justify-center rounded-md border-2 border-[oklch(0.17_0.08_290_/_0.85)] bg-citrus font-display text-4xl text-midnight shadow-[4px_4px_0_oklch(0.17_0.08_290)] md:h-28 md:w-20 md:text-6xl"
          >
            <span className="relative z-10">{d}</span>
            <div className="absolute inset-x-0 top-1/2 border-t border-[oklch(0.17_0.08_290_/_0.2)]" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-muted-foreground/80 text-sm">and counting.</p>
    </div>
  );
}
