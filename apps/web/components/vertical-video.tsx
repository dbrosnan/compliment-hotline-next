"use client";

import { useRef, useState } from "react";

type Props = {
  /** Public path like `/my-video.mp4`. Drop the file in `apps/web/public/`. */
  src: string;
  /** First-frame poster so there's no blank box while metadata loads. */
  poster?: string;
  /** Wrapper className — size the container here (width, max-width). */
  className?: string;
  /** Caption / aria-label for screen readers. */
  label?: string;
  /** Loop the video (default true). */
  loop?: boolean;
};

/**
 * Vertical (9:16) video player, click-to-play only.
 *
 * Shows the poster frame behind a big pink→mint gradient play button.
 * Visitor taps the button → audio + video start together. No autoplay,
 * no intersection observer — playback is always an explicit choice.
 *
 * Once started, tap the video body to pause/resume. Small mute chip
 * in the corner in case the venue is loud.
 *
 * The underlying file should be encoded with H.264 + AAC in mp4 with
 * +faststart for universal iOS/Android/desktop compatibility.
 */
export function VerticalVideo({
  src,
  poster,
  className = "",
  label,
  loop = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.volume = 1.0;
    setMuted(false);
    el.play()
      .then(() => setStarted(true))
      .catch(() => {
        // If unmuted play was blocked (unusual — we're inside a user
        // gesture), fall back to muted so at least the video plays.
        el.muted = true;
        setMuted(true);
        el.play().then(() => setStarted(true)).catch(() => {});
      });
  };

  return (
    <div
      className={`relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-black/40 ${className}`}
      style={{ aspectRatio: "9 / 16" }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        playsInline
        muted={muted}
        loop={loop}
        controls={false}
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={() => {
          const el = videoRef.current;
          if (!el || !started) return;
          if (el.paused) el.play().catch(() => {});
          else el.pause();
        }}
      >
        {label ? <track kind="descriptions" label={label} /> : null}
      </video>

      {/* Pink→mint gradient play button overlay. Covers the full poster
          until first play; disappears once video starts. */}
      {!started && (
        <button
          type="button"
          onClick={play}
          aria-label={label ? `Play: ${label}` : "Play video"}
          className="absolute inset-0 flex items-center justify-center group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/60"
        >
          {/* Soft radial halo behind the button */}
          <span
            aria-hidden
            className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity"
            style={{
              background:
                "radial-gradient(circle at center, oklch(0.70 0.28 338 / 0.35), oklch(0.89 0.15 162 / 0.22) 45%, transparent 70%)",
            }}
          />
          <span
            aria-hidden
            className="relative flex items-center justify-center h-24 w-24 sm:h-28 sm:w-28 rounded-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.70 0.28 338) 0%, oklch(0.89 0.15 162) 100%)",
              boxShadow:
                "0 0 0 2px oklch(0.93 0.04 82 / 0.4), 0 0 24px oklch(0.70 0.28 338 / 0.55), 0 0 60px oklch(0.89 0.15 162 / 0.35)",
            }}
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            >
              <path
                d="M8 5.14v13.72a1 1 0 0 0 1.52.85l11-6.86a1 1 0 0 0 0-1.7l-11-6.86A1 1 0 0 0 8 5.14Z"
                fill="oklch(0.98 0.01 82)"
              />
            </svg>
          </span>
        </button>
      )}

      {started && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const next = !muted;
            setMuted(next);
            const el = videoRef.current;
            if (el) el.muted = next;
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white hover:bg-black/60 transition-colors"
        >
          {muted ? "🔇 unmute" : "🔊 mute"}
        </button>
      )}
    </div>
  );
}
