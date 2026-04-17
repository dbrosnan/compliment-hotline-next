"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Public path like `/my-video.mp4`. Drop the file in `apps/web/public/`. */
  src: string;
  /** First-frame poster so there's no blank box while metadata loads. */
  poster?: string;
  /** Wrapper className — size the container here (width, max-width). */
  className?: string;
  /** Caption / aria-label for screen readers. */
  label?: string;
  /** Autoplay muted on view (default true). iOS requires muted + playsInline. */
  autoPlay?: boolean;
  /** Loop the video (default true). */
  loop?: boolean;
  /** Show a small tap-to-unmute button so folks can hear it (default true). */
  showUnmute?: boolean;
};

/**
 * Vertical (9:16) video player optimized for low-overhead cross-device
 * playback. Defaults:
 *   - aspect-ratio 9/16 container so layout is stable before load
 *   - preload="metadata" — browsers fetch dimensions + poster frame
 *     only (~100 KB), full bytes stream in when playback starts
 *   - playsInline muted loop autoplay — iOS's silent-autoplay deal
 *   - IntersectionObserver pauses when off-screen (saves bandwidth +
 *     battery when the user scrolls past)
 *   - Optional tap-to-unmute chip so visitors can hear it
 *
 * The underlying file should be encoded with H.264 + AAC in mp4 with
 * +faststart (see the project README). That format is the widest-
 * compatible codec combo — plays on every iOS/Android/desktop browser.
 */
export function VerticalVideo({
  src,
  poster,
  className = "",
  label,
  autoPlay = true,
  loop = true,
  showUnmute = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [inView, setInView] = useState(false);

  // Pause when off-screen; resume when back in view.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !autoPlay) return;
    if (inView) {
      el.play().catch(() => {
        /* autoplay blocked — user taps the poster to start */
      });
    } else {
      el.pause();
    }
  }, [inView, autoPlay]);

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
        autoPlay={autoPlay}
        controls={false}
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
        onClick={() => {
          const el = videoRef.current;
          if (!el) return;
          if (el.paused) el.play().catch(() => {});
          else el.pause();
        }}
      >
        {/* Text for screen readers / no-JS */}
        {label ? <track kind="descriptions" label={label} /> : null}
      </video>

      {showUnmute && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => !m);
          }}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/20 text-white hover:bg-black/60 transition-colors"
        >
          {muted ? "🔇 tap for sound" : "🔊 mute"}
        </button>
      )}
    </div>
  );
}
