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
  /** Detail attached when phase === "error" so the modal can show a
   *  useful message (e.g. codec not supported on this device). */
  errorDetail?: { kind: "format" | "network" | "other"; message: string };
  /** Live snapshot of the underlying HTMLAudioElement so we can show
   *  volume/muted/readyState/currentTime on screen for debugging
   *  silent-playback issues (iOS ring switch, AudioContext, etc.) */
  debug?: {
    paused: boolean;
    muted: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    readyState: number;
    networkState: number;
  };
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
  const [errorDetail, setErrorDetail] = useState<AudioState["errorDetail"]>();
  const [debug, setDebug] = useState<AudioState["debug"]>();

  const startedAt = useRef(0);
  const pulseId = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafId = useRef<number | null>(null);
  const deliveredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        /* noop */
      }
      audioRef.current.src = "";
      if (audioRef.current.parentNode) audioRef.current.parentNode.removeChild(audioRef.current);
      audioRef.current = null;
    }
    if (pulseTimer.current) clearInterval(pulseTimer.current);
    if (deliveredTimer.current) clearTimeout(deliveredTimer.current);
    pulseTimer.current = null;
    deliveredTimer.current = null;
  }, []);

  const start = useCallback(() => {
    if (!src) return;
    cancel();
    setPhase("ringing");
    setPulses([]);
    setElapsed(0);
    startedAt.current = 0;

    // Create AND attach to DOM — iOS sometimes refuses to output sound
    // for detached Audio elements. Hidden but in the document.body.
    const audio = document.createElement("audio");
    audio.src = src;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    audio.muted = false;
    audio.volume = 1.0;
    audio.controls = false;
    // playsInline is only meaningful for video but harmless on audio
    (audio as HTMLMediaElement & { playsInline?: boolean }).playsInline = true;
    audio.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(audio);
    audioRef.current = audio;

    console.log("[useAudio] created & attached", { src, muted: audio.muted, volume: audio.volume });

    audio.onplay = () => {
      startedAt.current = performance.now();
      setPhase("speaking");
      console.log("[useAudio] onplay", {
        muted: audio.muted,
        volume: audio.volume,
        duration: audio.duration,
        readyState: audio.readyState,
        currentSrc: audio.currentSrc,
      });
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
      const code = audio.error?.code;
      // HTMLMediaElement.MediaError codes:
      //  1 ABORTED, 2 NETWORK, 3 DECODE, 4 SRC_NOT_SUPPORTED
      const codeName =
        code === 1 ? "ABORTED"
        : code === 2 ? "NETWORK"
        : code === 3 ? "DECODE"
        : code === 4 ? "SRC_NOT_SUPPORTED"
        : "UNKNOWN";
      const kind: AudioState["errorDetail"] = {
        kind: code === 2 ? "network" : code === 3 || code === 4 ? "format" : "other",
        message: `MediaError ${code ?? "?"} (${codeName}) · ${audio.error?.message || "(no message)"} · src=${src}`,
      };
      console.warn("[useAudio] playback error", { code, codeName, src, rawError: audio.error });
      setErrorDetail(kind);
      setPhase("error");
    };
    audio.onpause = () => {
      if (audio.ended) return;
      setPhase("paused");
    };

    // Must call play() synchronously with the user gesture — iOS Safari
    // blocks any play() called inside setTimeout/etc. The "ringing"
    // phase is still rendered by the modal; it just lasts as long as
    // the buffer takes to start (onplay transitions us to "speaking").
    audio.play().catch((e) => {
      console.warn("[useAudio] play() rejected", e);
      setErrorDetail({
        kind: "other",
        message: `play() rejected · ${e?.name || "Error"}: ${e?.message || "(no message)"} · src=${src}`,
      });
      setPhase("error");
    });
  }, [src, cancel]);

  useEffect(() => {
    let lastSnap = 0;
    const tick = () => {
      if (startedAt.current && (phase === "speaking" || phase === "paused")) {
        setElapsed(performance.now() - startedAt.current);
      }
      // Snap audio element state ~5Hz for the on-screen debug box
      const now = performance.now();
      const a = audioRef.current;
      if (a && now - lastSnap > 200) {
        lastSnap = now;
        setDebug({
          paused: a.paused,
          muted: a.muted,
          volume: a.volume,
          currentTime: a.currentTime,
          duration: isFinite(a.duration) ? a.duration : 0,
          readyState: a.readyState,
          networkState: a.networkState,
        });
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
    errorDetail,
    debug,
    wordIndex: -1,
    currentCharStart: 0,
    currentCharEnd: 0,
    rate: 1,
    start,
    cancel,
  };
}
