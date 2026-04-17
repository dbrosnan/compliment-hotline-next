"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SpeechPhase = "idle" | "ringing" | "speaking" | "paused" | "delivered" | "error";

export type SpeechPulse = {
  id: number;
  bornAt: number;
  width: number;
};

export type SpeechState = {
  phase: SpeechPhase;
  currentCharStart: number;
  currentCharEnd: number;
  wordIndex: number;
  elapsed: number;
  rate: number;
  pulses: SpeechPulse[];
};

type SpeechController = SpeechState & {
  start: () => void;
  cancel: () => void;
};

const RINGING_MS = 900;
const DELIVERED_MS = 1800;

const pickVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /samantha|karen|victoria|moira|fiona|ava/i.test(v.name)) ||
    voices.find((v) => v.lang.startsWith("en") && v.localService) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0] ||
    null
  );
};

/**
 * Reactive wrapper around SpeechSynthesisUtterance.
 * Exposes per-word boundary events as "pulses" that downstream visualizers
 * consume to produce a speech-reactive waveform + word highlight.
 */
export function useSpeech(
  text: string | null,
  opts: { rate?: number; active: boolean },
): SpeechController {
  const { rate = 0.95, active } = opts;

  const [phase, setPhase] = useState<SpeechPhase>("idle");
  const [range, setRange] = useState({ start: 0, end: 0 });
  const [wordIndex, setWordIndex] = useState(-1);
  const [elapsed, setElapsed] = useState(0);
  const [pulses, setPulses] = useState<SpeechPulse[]>([]);

  const startedAt = useRef(0);
  const pulseId = useRef(0);
  const ringingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deliveredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (ringingTimer.current) clearTimeout(ringingTimer.current);
    if (deliveredTimer.current) clearTimeout(deliveredTimer.current);
    ringingTimer.current = null;
    deliveredTimer.current = null;
    utteranceRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (!text) return;
    cancel();
    setPhase("ringing");
    setRange({ start: 0, end: 0 });
    setWordIndex(-1);
    setPulses([]);

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;
    if (!hasSpeech) {
      ringingTimer.current = setTimeout(() => {
        setPhase("speaking");
        startedAt.current = performance.now();
        const readingMs = Math.min(9000, Math.max(4000, text.length * 70));
        deliveredTimer.current = setTimeout(() => {
          setPhase("delivered");
          deliveredTimer.current = setTimeout(() => setPhase("idle"), DELIVERED_MS);
        }, readingMs);
      }, RINGING_MS);
      return;
    }

    ringingTimer.current = setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      utteranceRef.current = u;
      u.rate = prefersReduced ? 1.0 : rate;
      u.pitch = 1.05;
      u.volume = 1;
      const v = pickVoice();
      if (v) u.voice = v;

      u.onstart = () => {
        startedAt.current = performance.now();
        setPhase("speaking");
      };
      u.onboundary = (e: SpeechSynthesisEvent) => {
        if (e.name && e.name !== "word") return;
        const charLength = (e as unknown as { charLength?: number }).charLength ?? 4;
        setRange({ start: e.charIndex, end: e.charIndex + charLength });
        setWordIndex((i) => i + 1);
        setPulses((p) => {
          const next = [
            ...p,
            {
              id: ++pulseId.current,
              bornAt: performance.now(),
              width: Math.max(2, Math.min(6, charLength * 0.6)),
            },
          ];
          return next.slice(-12);
        });
      };
      u.onpause = () => setPhase("paused");
      u.onresume = () => setPhase("speaking");
      u.onend = () => {
        setPhase("delivered");
        deliveredTimer.current = setTimeout(() => setPhase("idle"), DELIVERED_MS);
      };
      u.onerror = () => setPhase("error");

      if (window.speechSynthesis.getVoices().length === 0) {
        const onVoices = () => {
          window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
          const chosen = pickVoice();
          if (chosen) u.voice = chosen;
          window.speechSynthesis.speak(u);
        };
        window.speechSynthesis.addEventListener("voiceschanged", onVoices);
        setTimeout(() => window.speechSynthesis.speak(u), 300);
      } else {
        window.speechSynthesis.speak(u);
      }
    }, RINGING_MS);
  }, [text, rate, cancel]);

  useEffect(() => {
    const tick = () => {
      if (startedAt.current && (phase === "speaking" || phase === "paused")) {
        setElapsed(performance.now() - startedAt.current);
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [phase]);

  useEffect(() => {
    if (active && text) {
      start();
    } else if (!active) {
      cancel();
      setPhase("idle");
      setElapsed(0);
      startedAt.current = 0;
    }
    return () => cancel();
  }, [active, text, start, cancel]);

  return {
    phase,
    currentCharStart: range.start,
    currentCharEnd: range.end,
    wordIndex,
    elapsed,
    rate,
    pulses,
    start,
    cancel,
  };
}
