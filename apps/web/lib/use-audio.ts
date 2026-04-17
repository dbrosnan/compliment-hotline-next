"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AudioPhase = "idle" | "ringing" | "speaking" | "paused" | "delivered" | "error";

export type AudioPulse = {
  id: number;
  bornAt: number;
  width: number;
};

export type AudioState = {
  phase: AudioPhase;
  elapsed: number;
  pulses: AudioPulse[];
  /** Unused for audio; kept for TravelingWaveform prop-shape compatibility. */
  wordIndex: number;
  currentCharStart: number;
  currentCharEnd: number;
  rate: number;
};

export type AudioController = AudioState & {
  start: () => void;
  cancel: () => void;
};

const RINGING_MS = 400; // brief "ringing" beat before actual playback
const DELIVERED_MS = 1800;

/**
 * Plays a stranger's recorded audio compliment.
 *
 * Streams `src` through an HTMLAudioElement. Emits faux "pulses" every
 * ~150ms while the audio is playing so the TravelingWaveform has
 * something to react to. Same phase shape as the deleted useSpeech hook
 * so the PickUpModal and waveform render without branching.
 *
 * Autoplay: modern browsers require the `.play()` call to happen in the
 * same task as the user gesture that opened the modal. We start the
 * HTMLAudio inside `start()` which is triggered by the click handler,
 * so the gesture is still fresh.
 */
export function useAudio(
  src: string | null,
  opts: { active: boolean },
): AudioController {
  const { active } = opts;

  const [phase, setPhase] = useState<AudioPhase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [pulses, setPulses] = useState<AudioPulse[]>([]);

  const startedAt = useRef(0);
  const pulseId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafId = useRef<number | null>(null);
  const deliveredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        /* noop */
      }
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (pulseTimer.current) clearInterval(pulseTimer.current);
    if (deliveredTimer.current) clearTimeout(deliveredTimer.current);
    if (ringingTimer.current) clearTimeout(ringingTimer.current);
    pulseTimer.current = null;
    deliveredTimer.current = null;
    ringingTimer.current = null;
  }, []);

  const start = useCallback(() => {
    if (!src) return;
    cancel();
    setPhase("ringing");
    setPulses([]);
    setElapsed(0);
    startedAt.current = 0;

    const audio = new Audio(src);
    audio.preload = "auto";
    audioRef.current = audio;

    audio.onplay = () => {
      startedAt.current = performance.now();
      setPhase("speaking");
      // Fire a pulse every ~150ms for the TravelingWaveform
      if (pulseTimer.current) clearInterval(pulseTimer.current);
      pulseTimer.current = setInterval(() => {
        setPulses((p) => {
          const next = [
            ...p,
            {
              id: ++pulseId.current,
              bornAt: performance.now(),
              width: 3 + Math.random() * 2,
            },
          ];
          return next.slice(-12);
        });
      }, 150);
    };
    audio.onended = () => {
      if (pulseTimer.current) {
        clearInterval(pulseTimer.current);
        pulseTimer.current = null;
      }
      setPhase("delivered");
      deliveredTimer.current = setTimeout(() => setPhase("idle"), DELIVERED_MS);
    };
    audio.onerror = () => {
      if (pulseTimer.current) clearInterval(pulseTimer.current);
      setPhase("error");
    };
    audio.onpause = () => {
      if (audio.ended) return;
      setPhase("paused");
    };

    // Small "ringing" beat so the modal's atmospheric intro isn't skipped
    ringingTimer.current = setTimeout(() => {
      audio.play().catch(() => setPhase("error"));
    }, RINGING_MS);
  }, [src, cancel]);

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
    if (active && src) {
      start();
    } else if (!active) {
      cancel();
      setPhase("idle");
      setElapsed(0);
      startedAt.current = 0;
    }
    return () => cancel();
  }, [active, src, start, cancel]);

  return {
    phase,
    elapsed,
    pulses,
    wordIndex: -1,
    currentCharStart: 0,
    currentCharEnd: 0,
    rate: 1,
    start,
    cancel,
  };
}
