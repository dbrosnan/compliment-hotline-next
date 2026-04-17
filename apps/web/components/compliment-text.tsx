"use client";

import { useMemo } from "react";

type Props = {
  text: string;
  wordIndex: number;
  hasStarted: boolean;
  hasEnded: boolean;
};

/**
 * Kinetic typography for the compliment body — Fraunces variable
 * (opsz + wght axes). As the synth speaks each word, that word "blooms":
 *   wght 400 -> 760, opsz 14 -> 48 for a beat, citrus halo, settles bolder.
 */
export function ComplimentText({ text, wordIndex, hasStarted, hasEnded }: Props) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text]);
  let wordCounter = -1;

  return (
    <blockquote
      className={`ct-quote ${hasStarted ? "ct-started" : ""} ${hasEnded ? "ct-ended" : ""}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
        wordCounter += 1;
        const idx = wordCounter;
        const state = idx < wordIndex ? "past" : idx === wordIndex ? "active" : "future";
        return (
          <span
            key={i}
            className={`ct-word ct-${state}`}
            style={{ ["--i" as string]: idx, ["--delay" as string]: `${idx * 40}ms` }}
          >
            {tok}
          </span>
        );
      })}
      <span className={`ct-signature ${hasEnded ? "ct-draw" : ""}`} aria-hidden />

      <style>{`
        .ct-quote {
          font-family: var(--font-serif), Georgia, serif;
          font-size: clamp(1.75rem, 4.2vw, 2.75rem);
          line-height: 1.22;
          color: var(--foreground);
          text-wrap: balance;
          position: relative;
          margin: 0;
          text-align: center;
        }

        .ct-word {
          display: inline-block;
          opacity: 0;
          filter: blur(3px);
          transform: translateY(8px);
          font-variation-settings: "wght" 300, "opsz" 14;
          transition:
            opacity 420ms cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms),
            filter 420ms cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms),
            transform 420ms cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0ms),
            font-variation-settings 420ms cubic-bezier(0.22, 1, 0.36, 1),
            text-shadow 600ms ease-out;
          will-change: font-variation-settings, transform, text-shadow;
        }
        .ct-started .ct-word {
          opacity: 0.62;
          filter: blur(0);
          transform: translateY(0);
          font-variation-settings: "wght" 400, "opsz" 14;
          animation: ct-breath 5s ease-in-out infinite;
          animation-delay: calc(var(--i) * 80ms);
        }
        @keyframes ct-breath {
          0%, 100% { font-variation-settings: "wght" 400, "opsz" 14; opacity: 0.62; }
          50% { font-variation-settings: "wght" 440, "opsz" 14; opacity: 0.76; }
        }
        .ct-word.ct-past {
          opacity: 1;
          font-variation-settings: "wght" 620, "opsz" 14;
          animation: none;
        }
        .ct-word.ct-active {
          opacity: 1;
          animation: ct-bloom 520ms cubic-bezier(0.34, 1.3, 0.5, 1) forwards;
          text-shadow: 0 0 18px oklch(0.89 0.17 92 / 0.55), 0 0 32px oklch(0.72 0.21 22 / 0.3);
        }
        @keyframes ct-bloom {
          0% { font-variation-settings: "wght" 400, "opsz" 14; transform: translateY(0); }
          35% { font-variation-settings: "wght" 760, "opsz" 48; transform: translateY(-3px); }
          100% { font-variation-settings: "wght" 620, "opsz" 22; transform: translateY(0); text-shadow: 0 0 0 transparent; }
        }

        .ct-signature {
          position: absolute;
          left: 10%; right: 10%;
          bottom: -0.35em;
          height: 1px;
          background: linear-gradient(90deg, transparent, oklch(0.89 0.17 92 / 0.7), transparent);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 600ms cubic-bezier(0.65, 0, 0.35, 1);
        }
        .ct-signature.ct-draw { transform: scaleX(1); }

        .ct-ended .ct-word {
          font-variation-settings: "wght" 620, "opsz" 14;
          animation: ct-exhale 700ms ease-out 900ms forwards;
        }
        @keyframes ct-exhale {
          to { font-variation-settings: "wght" 560, "opsz" 14; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ct-word {
            opacity: 1;
            filter: none;
            transform: none;
            animation: none !important;
            transition: background-color 80ms linear;
            font-variation-settings: "wght" 500, "opsz" 14;
            text-shadow: none;
          }
          .ct-word.ct-active {
            background: linear-gradient(transparent 60%, oklch(0.89 0.17 92 / 0.35) 60%);
          }
          .ct-signature { display: none; }
        }
      `}</style>
    </blockquote>
  );
}
