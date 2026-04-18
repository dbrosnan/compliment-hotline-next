"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { initAudio, finalizeAudio } from "@/lib/api";

const MAX_DURATION_MS = 30_000;
type State = "idle" | "recording" | "review" | "uploading" | "done" | "error";

export function RotaryRecorder() {
  const [state, setState] = useState<State>("idle");
  const [name, setName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickMime = () => {
    // Prefer mp4/aac first — iOS Safari and its webviews (Discord,
    // Instagram, etc.) can't play WebM/Opus, so recording in mp4 when
    // possible keeps uploads universally playable. WebM is a fallback
    // for Firefox / older Chromium where mp4 MediaRecorder isn't wired.
    const candidates = [
      "audio/mp4;codecs=mp4a.40.2", // AAC-LC in mp4 (widest playback)
      "audio/mp4",
      "audio/aac",
      "audio/webm;codecs=opus",
      "audio/webm",
    ];
    for (const m of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) return m;
    }
    return "audio/webm";
  };

  const start = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMime();
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: mimeType });
        setBlob(b);
        setAudioUrl(URL.createObjectURL(b));
        setState("review");
        stream.getTracks().forEach((t) => t.stop());
      };

      mr.start();
      startRef.current = Date.now();
      setElapsed(0);
      setState("recording");
      timerRef.current = setInterval(() => {
        const ms = Date.now() - startRef.current;
        setElapsed(ms);
        if (ms >= MAX_DURATION_MS) stop();
      }, 100);
    } catch {
      setError("Microphone access was denied. Check your browser settings.");
      setState("error");
    }
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRef.current?.stop();
  };

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setBlob(null);
    setAudioUrl(null);
    setElapsed(0);
    setError("");
    setState("idle");
  };

  const upload = async () => {
    if (!blob) return;
    setState("uploading");
    try {
      const mimeType = blob.type || "audio/webm";
      const { id, put_url } = await initAudio({
        name: name.trim() || undefined,
        duration_ms: elapsed,
        mime_type: mimeType,
      });
      const putRes = await fetch(put_url, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
      await finalizeAudio({ id });
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">🎙</div>
        <h3 className="font-display text-4xl text-mint mb-2">SENT</h3>
        <p className="text-muted-foreground">Queued for moderation. It&apos;ll play on a real landline soon.</p>
        <Button variant="outline" onClick={reset} className="mt-6 rounded-full">
          Record another
        </Button>
      </div>
    );
  }

  const seconds = Math.floor(elapsed / 1000);
  const pct = Math.min(100, (elapsed / MAX_DURATION_MS) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="ch-record-name" className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your name (optional)
        </Label>
        <Input
          id="ch-record-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          disabled={state === "recording" || state === "uploading"}
          placeholder="a stranger"
          className="h-12 rounded-lg bg-background/40 border-border/50"
        />
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <RotaryDial
          state={state}
          elapsedSeconds={seconds}
          onClick={state === "idle" ? start : state === "recording" ? stop : undefined}
        />

        <div className="font-display text-4xl text-citrus tabular-nums" aria-hidden>
          {String(seconds).padStart(2, "0")}
          <span className="text-muted-foreground/40">s</span>
          <span className="text-muted-foreground/30 text-lg"> / 30s</span>
        </div>

        {/* Screen-reader live region for state announcements */}
        <p role="status" aria-live="polite" className="sr-only">
          {state === "idle" && "Ready to record. Press Space or Enter on the dial to begin."}
          {state === "recording" && `Recording. ${seconds} seconds of 30.`}
          {state === "review" && "Recording complete. Review before sending."}
          {state === "uploading" && "Uploading your compliment."}
          {state === "error" && "Error. See message below."}
        </p>

        {state === "recording" && (
          <div className="w-full max-w-xs h-1 bg-background/50 rounded-full overflow-hidden" aria-hidden>
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}

        {state === "idle" && (
          <p className="text-sm text-muted-foreground">
            Click the dial to start recording.{" "}
            <span className="text-muted-foreground/60">
              Keyboard: <kbd className="font-mono text-xs px-1 rounded bg-muted">Space</kbd> or <kbd className="font-mono text-xs px-1 rounded bg-muted">Enter</kbd>.
            </span>
          </p>
        )}
        {state === "recording" && (
          <div className="text-sm text-primary flex items-center gap-2" aria-hidden>
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
            Recording — click dial to stop
          </div>
        )}
      </div>

      {state === "review" && audioUrl && (
        <div className="space-y-4">
          <audio src={audioUrl} controls className="w-full" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={reset} className="flex-1 rounded-full">
              Redo
            </Button>
            <ShimmerButton
              onClick={upload}
              shimmerColor="oklch(0.89 0.17 92)"
              background="oklch(0.72 0.21 22)"
              borderRadius="9999px"
              shimmerDuration="2.4s"
              className="flex-1 h-11 font-semibold text-base text-midnight"
            >
              Send it through →
            </ShimmerButton>
          </div>
        </div>
      )}

      {state === "uploading" && (
        <div className="text-center text-muted-foreground">Uploading...</div>
      )}

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
    </div>
  );
}

function RotaryDial({
  state,
  elapsedSeconds,
  onClick,
}: {
  state: State;
  elapsedSeconds: number;
  onClick?: () => void;
}) {
  const active = state === "recording";
  const label =
    state === "idle"
      ? "Start recording a compliment"
      : state === "recording"
        ? `Stop recording. ${elapsedSeconds} seconds of 30.`
        : "Dial";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`relative w-48 h-48 rounded-full transition-transform focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background ${
        onClick ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default"
      }`}
      aria-label={label}
      aria-pressed={active}
    >
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-[0_0_30px_oklch(0.70_0.28_338/0.35)] ${
          active ? "animate-[spin_8s_linear_infinite]" : ""
        }`}
      >
        <defs>
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.93 0.04 82)" />
            <stop offset="60%" stopColor="oklch(0.72 0.21 22)" />
            <stop offset="100%" stopColor="oklch(0.70 0.28 338)" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="90" fill="url(#dialGrad)" stroke="oklch(0.93 0.04 82)" strokeWidth="3" />
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const r = 65;
          const x = 100 + Math.cos(angle) * r;
          const y = 100 + Math.sin(angle) * r;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="11" fill="oklch(0.17 0.08 290)" />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="oklch(0.93 0.04 82)"
                fontSize="11"
                fontFamily="var(--font-sans), sans-serif"
                fontWeight="700"
              >
                {(i + 1) % 10}
              </text>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="22" fill="oklch(0.17 0.08 290)" stroke="oklch(0.93 0.04 82)" strokeWidth="2" />
        <circle
          cx="100"
          cy="100"
          r="10"
          fill={active ? "oklch(0.72 0.21 22)" : "oklch(0.89 0.15 162)"}
          className={active ? "animate-pulse" : ""}
        />
      </svg>
    </button>
  );
}
