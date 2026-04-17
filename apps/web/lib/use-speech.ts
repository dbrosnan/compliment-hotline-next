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

const DELIVERED_MS = 1800;
const RINGING_FALLBACK_MS = 1200; // if onstart never fires (some Android browsers)

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
 *
 * Critical detail: `speechSynthesis.speak()` MUST be called synchronously
 * inside the user-gesture task (or as close as possible). Wrapping it in a
 * 900ms setTimeout — as an earlier version did — causes Chrome to silently
 * drop the utterance. So we:
 *   1. Transition phase to "ringing" immediately.
 *   2. Construct the utterance and call .speak() in the same tick.
 *   3. The utterance's onstart event transitions ringing → speaking.
 *
 * The "ringing" beat is now purely visual latency between .speak() and the
 * TTS engine actually beginning. Usually 50-300ms; we also arm a 1.2s
 * fallback that force-transitions to "speaking" if onstart never fires
 * (some Android browsers skip onstart entirely).
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
  const ringingFallback = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deliveredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (ringingFallback.current) clearTimeout(ringingFallback.current);
    if (deliveredTimer.current) clearTimeout(deliveredTimer.current);
    ringingFallback.current = null;
    deliveredTimer.current = null;
    utteranceRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (!text) return;
    cancel();

    // Reset every piece of transient state FIRST so there's no stale idle
    // frame for the consumer's phase-watching effect to misread.
    setRange({ start: 0, end: 0 });
    setWordIndex(-1);
    setPulses([]);
    setPhase("ringing");

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

    // No Speech API — fake the whole arc with timers (still respects the
    // gesture since these are plain timers, not TTS calls).
    if (!hasSpeech) {
      ringingFallback.current = setTimeout(() => {
        setPhase("speaking");
        startedAt.current = performance.now();
        const readingMs = Math.min(9000, Math.max(4000, text.length * 70));
        ringingFallback.current = setTimeout(() => {
          setPhase("delivered");
          deliveredTimer.current = setTimeout(() => setPhase("idle"), DELIVERED_MS);
        }, readingMs);
      }, RINGING_FALLBACK_MS);
      return;
    }

    // Fire speak() in the SAME tick as the click. Chrome requires this.
    const u = new SpeechSynthesisUtterance(text);
    utteranceRef.current = u;
    u.rate = prefersReduced ? 1.0 : rate;
    u.pitch = 1.05;
    u.volume = 1;
    const v = pickVoice();
    if (v) u.voice = v;

    u.onstart = () => {
      if (ringingFallback.current) {
        clearTimeout(ringingFallback.current);
        ringingFallback.current = null;
      }
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

    // Safety net: if onstart never fires within 1.2s, pretend it did so the
    // UI progresses. This mostly affects Samsung Internet + old iOS.
    ringingFallback.current = setTimeout(() => {
      if (startedAt.current === 0) {
        startedAt.current = performance.now();
        setPhase("speaking");
      }
    }, RINGING_FALLBACK_MS);

    window.speechSynthesis.speak(u);
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
