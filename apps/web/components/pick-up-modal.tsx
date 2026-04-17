"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import type { ComplimentItem } from "@/lib/api";
import { audioUrl } from "@/lib/api";
import { useAudio } from "@/lib/use-audio";
import { LiquidLightBackdrop } from "./liquid-light-backdrop";
import { TravelingWaveform } from "./traveling-waveform";
import { BorderBeam } from "@workspace/ui/components/border-beam";

type Props = {
  open: boolean;
  compliment: ComplimentItem | null;
  onOpenChange: (open: boolean) => void;
  onFinished: () => void;
};

/**
 * Compliment playback modal — audio-only.
 *
 * When open with an approved audio compliment:
 *   1. "Ringing" phase ~400ms (visual theater)
 *   2. HTMLAudioElement streams from /api/compliments/:id/audio
 *   3. Speaking phase with TravelingWaveform reacting to pulses
 *   4. "Delivered" phase, then idle -> parent scrolls to submit
 */
export function PickUpModal({ open, compliment, onOpenChange, onFinished }: Props) {
  const src = compliment ? audioUrl(compliment.id) : null;
  const audio = useAudio(src, { active: open && !!src });
  const [showCaptions, setShowCaptions] = useState(false);
  useEffect(() => {
    if (!open) setShowCaptions(false);
  }, [open]);

  // Only fire onFinished after a real delivered -> idle transition.
  const prevPhase = useRef<typeof audio.phase>("idle");
  useEffect(() => {
    const was = prevPhase.current;
    const now = audio.phase;
    if (open && was === "delivered" && now === "idle") {
      onFinished();
    }
    prevPhase.current = now;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.phase, open]);

  if (!compliment) return null;

  const phase = audio.phase;
  const isRinging = phase === "ringing" || phase === "idle";
  const hasStarted = phase === "speaking" || phase === "paused" || phase === "delivered";
  const hasEnded = phase === "delivered";
  const isError = phase === "error";

  const phaseLabel =
    phase === "ringing" || phase === "idle"
      ? "📞 incoming..."
      : phase === "speaking" || phase === "paused"
        ? "🎙 a stranger's voice"
        : phase === "delivered"
          ? "💌 delivered"
          : phase === "error"
            ? "✕ line dropped"
            : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`ch-modal ch-modal-${phase} overflow-visible border-0 bg-transparent p-0 shadow-none max-w-3xl w-[calc(100vw-2rem)] data-[state=open]:duration-500`}
        showCloseButton={false}
      >
        <LiquidLightBackdrop phase={phase} pulseKey={audio.pulses.length} />

        <div className="ch-card relative rounded-3xl p-8 md:p-14 text-center backdrop-blur-md backdrop-saturate-150 bg-card/55 border border-border/25">
          <BorderBeam
            size={120}
            duration={8}
            colorFrom="oklch(0.89 0.17 92 / 0.9)"
            colorTo="oklch(0.70 0.28 338 / 0.9)"
            borderWidth={1.5}
          />
          <DialogHeader className="items-center gap-4 text-center">
            <DialogTitle asChild>
              <div
                className="font-mono text-xs uppercase tracking-[0.3em] transition-colors duration-700"
                style={{
                  color: isRinging
                    ? "oklch(0.45 0.27 291 / 0.9)"
                    : hasEnded
                      ? "oklch(0.89 0.17 92 / 0.95)"
                      : isError
                        ? "oklch(0.65 0.24 28 / 0.95)"
                        : "oklch(0.72 0.21 22 / 0.95)",
                }}
              >
                {phaseLabel}
              </div>
            </DialogTitle>
            <DialogDescription className="sr-only">
              {compliment.transcript
                ? `A stranger named ${compliment.name || "anonymous"} is saying: ${compliment.transcript}`
                : "A stranger's recorded audio compliment is playing through the hotline."}
            </DialogDescription>
          </DialogHeader>

          {isRinging && (
            <div className="py-6 flex flex-col items-center gap-6">
              <div className="animate-[ch-ring_4s_ease-in-out_infinite] opacity-80">
                <RingingHandset />
              </div>
              <div className="font-mono text-sm tracking-[0.25em] uppercase text-cream/40">
                connecting you with a stranger
              </div>
            </div>
          )}

          {hasStarted && !isError && (
            <div className="py-6 flex flex-col items-center gap-8">
              <blockquote
                className="font-display text-3xl md:text-5xl leading-none tracking-wide text-foreground"
                style={{ width: "100%" }}
              >
                {compliment.name || "a stranger"}
              </blockquote>
              <div className="font-serif italic text-lg md:text-xl text-muted-foreground">
                {hasEnded ? "said something kind." : "is saying something kind..."}
              </div>

              <div className="min-h-[72px] flex items-center justify-center" style={{ width: "100%" }}>
                {!hasEnded ? (
                  <TravelingWaveform state={audio} />
                ) : (
                  <div className="text-citrus font-semibold animate-pulse tracking-widest uppercase text-sm">
                    ✨ now it&apos;s your turn
                  </div>
                )}
              </div>

              {/* Captions (CC) toggle — off by default to preserve the
                  surprise for hearing users, on-demand for Deaf / hard of
                  hearing. Only rendered when a transcript exists. */}
              {compliment.transcript && (
                <div className="w-full max-w-xl mx-auto">
                  <button
                    type="button"
                    onClick={() => setShowCaptions((v) => !v)}
                    aria-pressed={showCaptions}
                    className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 hover:text-foreground transition-colors"
                  >
                    {showCaptions ? "▾ hide captions" : "▸ show captions (CC)"}
                  </button>
                  {showCaptions && (
                    <p
                      className="mt-3 font-serif italic text-base md:text-lg text-muted-foreground leading-relaxed"
                      aria-live="polite"
                    >
                      “{compliment.transcript}”
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {isError && (
            <div className="py-8 text-center space-y-2">
              <p className="text-destructive font-mono text-sm">the line dropped.</p>
              <p className="text-muted-foreground text-sm">try another, or record your own below.</p>
            </div>
          )}

          <style>{`
            .ch-card {
              transition: box-shadow 900ms ease, background 900ms ease;
              box-shadow:
                0 0 24px oklch(0.45 0.27 291 / 0.25),
                0 0 80px oklch(0.45 0.27 291 / 0.15),
                0 0 180px oklch(0.45 0.27 291 / 0.08);
            }
            .ch-modal-speaking .ch-card, .ch-modal-paused .ch-card {
              box-shadow:
                0 0 30px oklch(0.72 0.21 22 / 0.45),
                0 0 100px oklch(0.72 0.21 22 / 0.25),
                0 0 220px oklch(0.70 0.28 338 / 0.15);
            }
            .ch-modal-delivered .ch-card {
              box-shadow:
                0 0 30px oklch(0.89 0.17 92 / 0.4),
                0 0 110px oklch(0.89 0.17 92 / 0.22),
                0 0 220px oklch(0.89 0.15 162 / 0.18);
            }
            .ch-card::before {
              content: "";
              position: absolute;
              inset: -28px;
              z-index: -1;
              border-radius: inherit;
              background: conic-gradient(from 0deg,
                oklch(0.45 0.27 291),
                oklch(0.72 0.21 22),
                oklch(0.89 0.17 92),
                oklch(0.89 0.15 162),
                oklch(0.45 0.27 291));
              filter: blur(48px);
              opacity: 0.35;
              animation: ch-halo 45s linear infinite;
              transition: opacity 900ms ease;
            }
            .ch-modal-speaking .ch-card::before,
            .ch-modal-paused .ch-card::before { opacity: 0.55; }
            .ch-modal-delivered .ch-card::before { opacity: 0.48; }
            @keyframes ch-halo { to { transform: rotate(1turn); } }
            @keyframes ch-ring {
              0%, 92%, 100% { transform: rotate(0deg); }
              94% { transform: rotate(-3deg); }
              96% { transform: rotate(3deg); }
              98% { transform: rotate(-1.5deg); }
            }
            @media (prefers-reduced-motion: reduce) {
              .ch-card::before { animation: none; opacity: 0.25 !important; }
              .ch-card { transition: none !important; }
            }
          `}</style>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RingingHandset() {
  return (
    <svg width="96" height="96" viewBox="0 0 140 140" fill="none" aria-hidden>
      <defs>
        <linearGradient id="handsetModalGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.21 22)" />
          <stop offset="100%" stopColor="oklch(0.70 0.28 338)" />
        </linearGradient>
      </defs>
      <path
        d="M30 45 C30 25, 50 15, 70 25 L95 50 C115 70, 105 90, 85 100 L75 90 C65 80, 55 70, 45 60 Z"
        fill="url(#handsetModalGrad)"
        stroke="oklch(0.93 0.04 82)"
        strokeWidth="2"
      />
      <circle cx="40" cy="40" r="3" fill="oklch(0.93 0.04 82)" opacity="0.6" />
      <circle cx="47" cy="35" r="3" fill="oklch(0.93 0.04 82)" opacity="0.6" />
      <circle cx="35" cy="47" r="3" fill="oklch(0.93 0.04 82)" opacity="0.6" />
    </svg>
  );
}
