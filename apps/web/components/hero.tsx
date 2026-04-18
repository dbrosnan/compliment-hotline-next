"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { ShimmerButton } from "@workspace/ui/components/shimmer-button";
import { DiscoBall } from "./disco-ball";
import { SparkleField } from "./sparkle-field";
import { PhoneParade } from "./phone-parade";
import { PickUpModal } from "./pick-up-modal";
import { fetchRecent, type ComplimentItem } from "@/lib/api";

const WORDS = "COMPLIMENT".split("");

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pool contains ONLY approved audio compliments. On a fresh deploy with
  // nothing approved yet, pool stays empty and clicking pick-up is a no-op.
  const [pool, setPool] = useState<ComplimentItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<ComplimentItem | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchRecent()
      .then((data) => {
        // Only approved audio compliments enter the random-pick pool.
        const approvedAudio = data.items.filter(
          (c) => c.status === "approved" && c.has_audio,
        );
        // Pre-filter by what THIS browser can actually decode. iOS
        // Safari returns "" for WebM/Opus canPlayType — we drop those
        // so iPhone only sees mp4 clips.
        const probe = typeof document !== "undefined" ? document.createElement("audio") : null;
        const debug: Array<{ id: number; mime: string | null | undefined; full: string; bare: string; kept: boolean }> = [];
        const playable = approvedAudio.filter((c) => {
          if (!probe) return true;
          const mime = c.mime_type;
          if (!mime) {
            debug.push({ id: c.id, mime, full: "(no mime)", bare: "(no mime)", kept: true });
            return true;
          }
          const bare = mime.split(";")[0]!.trim();
          const full = probe.canPlayType(mime);
          const bareResult = probe.canPlayType(bare);
          const kept = !!full || !!bareResult;
          debug.push({ id: c.id, mime, full: full || "(empty)", bare: bareResult || "(empty)", kept });
          return kept;
        });
        console.log("[hero] playable filter", {
          total: approvedAudio.length,
          kept: playable.length,
          ua: typeof navigator !== "undefined" ? navigator.userAgent : "(no nav)",
          rows: debug,
        });
        setPool(playable);
      })
      .catch((e) => {
        console.warn("[hero] fetchRecent failed", e);
        setPool([]);
      });
  }, []);

  const pickUp = () => {
    if (pool.length === 0) {
      // No approved audio yet — scroll to the record section so the
      // first-ever compliment can be dropped.
      document.getElementById("submit")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (!c) return;
    setSelected(c);
    setModalOpen(true);
  };

  const tryAnother = () => {
    if (pool.length < 2) return;
    // Pick any other compliment from the pool, excluding the current one.
    const others = pool.filter((c) => c.id !== selected?.id);
    const c = others[Math.floor(Math.random() * others.length)] ?? pool[0];
    if (!c) return;
    setSelected(c);
  };

  const onFinished = () => {
    setModalOpen(false);
    setTimeout(() => {
      const el = document.getElementById("submit");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Remotion hero video — our 18s animated reel of phones + disco ball +
          cart + record invite. Bumped to 75% opacity so it actually reads. */}
      {videoOk && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain opacity-55"
          style={{
            transform: "scale(0.85)",
            transformOrigin: "center",
            // Feather the video edges so its own background color never
            // shows as a hard rectangle against the page bg. Radial mask
            // fades the corners into transparency; mix-blend-mode:screen
            // then makes any remaining dark video pixels drop to the
            // page bg instead of rendering as a lighter box.
            maskImage:
              "radial-gradient(ellipse 75% 75% at center, black 55%, transparent 95%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 75% 75% at center, black 55%, transparent 95%)",
            mixBlendMode: "screen",
          }}
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
          onError={() => setVideoOk(false)}
          aria-hidden
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* Kinetic phone parade — 6 floating + ringing rotary phones */}
      <PhoneParade />

      {/* Ambient atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <SparkleField count={48} />
        <div className="absolute top-6 right-6 h-20 w-20 sm:top-8 sm:right-8 sm:h-28 sm:w-28 md:h-32 md:w-32 opacity-90 drop-shadow-[0_0_40px_oklch(0.70_0.28_338/0.45)]">
          <DiscoBall />
        </div>
        <div className="hidden sm:block absolute top-24 left-12 h-16 w-16 opacity-50 drop-shadow-[0_0_30px_oklch(0.89_0.17_92/0.4)]">
          <DiscoBall />
        </div>
      </div>

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)",
        }}
        aria-hidden
      />
      {/* Layered vignette: top+bottom fade to bg so content has contrast */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/50 via-background/20 to-background/80" aria-hidden />
      {/* Soft radial under the copy column so the tagline + CTA stay readable */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.17 0.08 290 / 0.65) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 text-center">
        <p className="font-mono mb-6 text-xs uppercase tracking-[0.3em] text-muted-foreground opacity-0 animate-[ch-fade_800ms_ease_forwards] [animation-delay:1400ms]">
          📞 An analog art piece for a digital disco
        </p>

        <h1 className="font-display md:whitespace-nowrap text-[clamp(2rem,11vw,7rem)] leading-[0.95] tracking-wide text-foreground text-balance">
          {WORDS.map((ch, i) => (
            <span
              key={i}
              className="inline-block opacity-0"
              style={{
                animation: mounted ? "ch-drop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" : "none",
                animationDelay: `${i * 60}ms`,
                textShadow: "2px 0 0 oklch(0.70 0.28 338 / 0.7), -2px 0 0 oklch(0.89 0.15 162 / 0.7)",
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        <div className="font-display mt-2 text-[clamp(1.75rem,7vw,4.5rem)] leading-none tracking-widest text-accent">
          HOTLINE
        </div>

        <p
          className="font-serif italic mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed opacity-0 animate-[ch-fade_800ms_ease_forwards] [animation-delay:1600ms]"
          style={{ display: "block", width: "100%", maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}
        >
          Pick up the phone. Hear a compliment from a stranger. Leave one for the next person.
        </p>

        {/* The big pick-up button */}
        <div className="mt-10 opacity-0 animate-[ch-fade_800ms_ease_forwards] [animation-delay:2000ms]">
          <button
            onClick={pickUp}
            aria-label="Pick up the phone to hear a compliment"
            className="group relative inline-flex flex-col items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/40 rounded-3xl"
          >
            <div className="absolute -inset-8 rounded-full bg-primary/20 blur-2xl transition-all duration-500 group-hover:bg-primary/40 group-hover:scale-110" />
            <div className="absolute -inset-4 rounded-full bg-magenta/20 blur-xl transition-all duration-500 group-hover:bg-magenta/30" />

            <div className="relative">
              <div className="animate-[ch-ring_4s_ease-in-out_infinite]">
                <HandsetSVG />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-full bg-cream text-midnight shadow-glow ring-4 ring-primary/40 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 animate-pulse">
                  <PlayIcon />
                </div>
              </div>
            </div>

            <div
              className="font-display mt-8 text-[clamp(1.5rem,5vw,3rem)] leading-tight tracking-wide text-accent drop-shadow-[0_4px_20px_oklch(0.89_0.17_92/0.4)]"
              style={{ display: "block", width: "100%", textAlign: "center" }}
            >
              pick up the phone
              <br />
              <span className="text-coral">for a pick-me-up</span>
            </div>

            <div className="font-mono mt-4 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              ▸ click to answer
            </div>
          </button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4 opacity-0 animate-[ch-fade_800ms_ease_forwards] [animation-delay:2200ms]">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <a href="#how">How it works</a>
          </Button>
          <ShimmerButton
            onClick={() => document.getElementById("submit")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            shimmerColor="oklch(0.89 0.17 92)"
            background="oklch(0.70 0.28 338)"
            borderRadius="9999px"
            shimmerDuration="2.4s"
            className="h-8 text-xs font-semibold text-midnight px-4"
          >
            Skip to leaving one →
          </ShimmerButton>
        </div>
      </div>

      <PickUpModal
        open={modalOpen}
        compliment={selected}
        onOpenChange={setModalOpen}
        onFinished={onFinished}
        onTryAnother={tryAnother}
      />

      <style>{`
        @keyframes ch-drop {
          0% { transform: translateY(-40px); opacity: 0; filter: blur(8px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }
        @keyframes ch-fade {
          to { opacity: 1; }
        }
        @keyframes ch-ring {
          0%, 92%, 100% { transform: rotate(0deg); }
          94% { transform: rotate(-3deg); }
          96% { transform: rotate(3deg); }
          98% { transform: rotate(-1.5deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-7 w-7 sm:h-9 sm:w-9 md:h-11 md:w-11 ml-0.5">
      <path d="M6 4.5v15a1 1 0 0 0 1.555.832l12-7.5a1 1 0 0 0 0-1.664l-12-7.5A1 1 0 0 0 6 4.5Z" />
    </svg>
  );
}

function HandsetSVG() {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      aria-hidden
      className="h-40 w-40 sm:h-52 sm:w-52 md:h-56 md:w-56 drop-shadow-[0_10px_40px_oklch(0.72_0.21_22/0.55)]"
    >
      <defs>
        <linearGradient id="handsetGradHero" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.21 22)" />
          <stop offset="100%" stopColor="oklch(0.70 0.28 338)" />
        </linearGradient>
      </defs>
      <path
        d="M30 45 C30 25, 50 15, 70 25 L95 50 C115 70, 105 90, 85 100 L75 90 C65 80, 55 70, 45 60 Z"
        fill="url(#handsetGradHero)"
        stroke="oklch(0.93 0.04 82)"
        strokeWidth="2"
      />
      <circle cx="40" cy="40" r="3" fill="oklch(0.93 0.04 82)" opacity="0.6" />
      <circle cx="47" cy="35" r="3" fill="oklch(0.93 0.04 82)" opacity="0.6" />
      <circle cx="35" cy="47" r="3" fill="oklch(0.93 0.04 82)" opacity="0.6" />
      <path
        d="M35 50 Q 25 60, 32 70 Q 20 78, 28 88 Q 15 96, 24 108 Q 12 116, 22 128"
        stroke="oklch(0.72 0.21 22)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
