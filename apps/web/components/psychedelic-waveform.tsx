"use client";

import { useEffect, useRef } from "react";

/**
 * Full-width psychedelic oscilloscope waveform.
 *
 * Layered effects, per frame:
 *   1. Radial bloom gradient (background glow)
 *   2. Mirror fold: top-half waveform reflected below the midline
 *   3. 5 sine waves at coprime frequencies, each on its own phase drift
 *   4. Chromatic aberration: each wave drawn 3× with R/G/B offset
 *   5. Spark particles emitted at wave crests, fade + rise
 *   6. Shockwave rings every ~4s, expanding from center
 *   7. Scan lines (static CSS overlay)
 *
 * Era cues: CRT artifacts (aberration + scanlines), analog oscilloscope
 * single-stroke glowing lines, and the site's citrus / coral / mint /
 * magenta palette cycling along the path. Honors prefers-reduced-motion
 * by rendering a single static frame.
 */
export function PsychedelicWaveform({
  className = "",
  intensity = 1,
}: {
  className?: string;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── DPR-aware sizing ─────────────────────────────────────────────
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // 5 waves. Frequencies are coprime-ish so compound pattern never repeats.
    // Phase speed (radians/sec), amplitude (fraction of canvas height),
    // hue palette in OKLCH lightness/chroma/hue.
    type Wave = { freq: number; speedX: number; speedPhase: number; amp: number; color: string };
    const WAVES: Wave[] = [
      { freq: 1.3, speedX: 0.35, speedPhase: 0.9, amp: 0.28, color: "oklch(0.89 0.17 92)" },   // citrus
      { freq: 2.1, speedX: 0.50, speedPhase: 1.3, amp: 0.22, color: "oklch(0.72 0.21 22)" },   // coral
      { freq: 3.7, speedX: 0.25, speedPhase: 1.8, amp: 0.16, color: "oklch(0.70 0.28 338)" },  // magenta
      { freq: 5.2, speedX: 0.70, speedPhase: 0.6, amp: 0.12, color: "oklch(0.89 0.15 162)" },  // mint
      { freq: 8.3, speedX: 0.40, speedPhase: 2.2, amp: 0.08, color: "oklch(0.45 0.27 291)" },  // primary
    ];

    // Chromatic aberration offset (pixels)
    const ABER = 3 * intensity;

    // Particles: spawned at wave crests, float up + fade
    type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string };
    const particles: Particle[] = [];
    const MAX_PARTICLES = 120;

    // Shockwaves: radial rings expanding from center
    type Shockwave = { bornAt: number; color: string };
    const shockwaves: Shockwave[] = [];
    const SHOCKWAVE_PERIOD_MS = 4200;
    let lastShockwave = 0;

    const start = performance.now();
    let raf = 0;

    const render = () => {
      const now = performance.now();
      const t = (now - start) / 1000;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const mid = h / 2;

      // Clear with subtle trail (low-alpha black) for motion smearing.
      // globalCompositeOperation 'source-over' with fillRect gives us
      // a persistence-of-vision effect without full clear each frame.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(10, 6, 24, 0.22)";
      ctx.fillRect(0, 0, w, h);

      // 1) Radial bloom background
      const bloom = ctx.createRadialGradient(w / 2, mid, 20, w / 2, mid, Math.max(w, h) * 0.65);
      bloom.addColorStop(0, "oklch(0.45 0.27 291 / 0.22)");
      bloom.addColorStop(0.5, "oklch(0.70 0.28 338 / 0.10)");
      bloom.addColorStop(1, "transparent");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      // 2) Spawn shockwave periodically
      if (now - lastShockwave > SHOCKWAVE_PERIOD_MS) {
        lastShockwave = now;
        const colors = ["oklch(0.89 0.17 92)", "oklch(0.70 0.28 338)", "oklch(0.89 0.15 162)"];
        shockwaves.push({
          bornAt: now,
          color: colors[Math.floor(Math.random() * colors.length)]!,
        });
      }
      // Draw + update shockwaves
      ctx.globalCompositeOperation = "screen";
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const s = shockwaves[i]!;
        const age = (now - s.bornAt) / 1000;
        if (age > 3) {
          shockwaves.splice(i, 1);
          continue;
        }
        const radius = age * Math.max(w, h) * 0.35;
        const alpha = Math.max(0, 1 - age / 3);
        ctx.strokeStyle = s.color.replace(")", ` / ${alpha * 0.5})`);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w / 2, mid, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3) Waves with chromatic aberration
      ctx.globalCompositeOperation = "screen";
      const STEPS = 180;
      const sampleY = (wave: Wave, tt: number, nx: number) => {
        // nx is 0..1 across screen
        const shift = tt * wave.speedX;
        const phase = tt * wave.speedPhase;
        // two-part wave: primary sine + secondary for richness
        const y1 = Math.sin((nx + shift) * Math.PI * 2 * wave.freq + phase);
        const y2 = Math.sin((nx - shift * 0.5) * Math.PI * 2 * (wave.freq * 1.7) + phase * 0.6) * 0.35;
        return (y1 + y2) * wave.amp * h * 0.5;
      };

      for (let wi = 0; wi < WAVES.length; wi++) {
        const wave = WAVES[wi]!;
        // Breathing amplitude
        const envelope = 0.7 + 0.3 * Math.sin(t * 0.6 + wi * 1.3);

        for (let pass = 0; pass < 3; pass++) {
          // Pass 0 = red offset left, 1 = green center, 2 = blue offset right
          const xOff = pass === 0 ? -ABER : pass === 2 ? ABER : 0;
          const passColor = pass === 1 ? wave.color : pass === 0 ? "oklch(0.72 0.21 22 / 0.6)" : "oklch(0.70 0.28 338 / 0.6)";
          ctx.strokeStyle = passColor;
          ctx.lineWidth = pass === 1 ? 2 : 1;
          ctx.shadowColor = wave.color;
          ctx.shadowBlur = pass === 1 ? 18 : 0;
          ctx.beginPath();
          for (let s = 0; s <= STEPS; s++) {
            const nx = s / STEPS;
            const x = nx * w + xOff;
            const y = mid + sampleY(wave, t, nx) * envelope;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Mirror fold — same wave reflected below the midline
          ctx.beginPath();
          for (let s = 0; s <= STEPS; s++) {
            const nx = s / STEPS;
            const x = nx * w + xOff;
            const y = mid - sampleY(wave, t, nx) * envelope;
            if (s === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // 4) Emit sparks at crests of this wave (probabilistic)
        if (particles.length < MAX_PARTICLES && Math.random() < 0.25 * intensity) {
          const nx = Math.random();
          const x = nx * w;
          const y = mid + sampleY(wave, t, nx) * envelope;
          particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 20,
            vy: -20 - Math.random() * 40,
            life: 0,
            max: 0.8 + Math.random() * 0.8,
            color: wave.color,
          });
          // mirrored crest
          particles.push({
            x,
            y: mid - (y - mid),
            vx: (Math.random() - 0.5) * 20,
            vy: 20 + Math.random() * 40,
            life: 0,
            max: 0.8 + Math.random() * 0.8,
            color: wave.color,
          });
        }
      }

      // 5) Update + draw particles
      const dt = 1 / 60;
      ctx.globalCompositeOperation = "screen";
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life += dt;
        if (p.life > p.max) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy *= 0.98; // slight deceleration
        const a = 1 - p.life / p.max;
        ctx.fillStyle = p.color.replace(")", ` / ${a})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.8 * a + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) raf = requestAnimationFrame(render);
    };

    if (reducedMotion) {
      render();
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [intensity]);

  return (
    <div
      className={`relative w-full h-full ${className}`}
      aria-hidden
      style={{
        // Philco-Predicta-style cream bezel
        background: "oklch(0.93 0.04 82)",
        padding: "24px",
        borderRadius: "28px",
        border: "2px solid oklch(0.17 0.08 290)",
        boxShadow: "8px 8px 0 oklch(0.17 0.08 290)",
      }}
    >
      {/* Inner CRT screen — hosts canvas + overlays */}
      <div
        className="relative w-full h-full"
        style={{
          background: "oklch(0.12 0.05 285)",
          borderRadius: "18px",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ background: "transparent" }}
        />
        {/* Scan lines overlay for CRT feel */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-40"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 3px)",
          }}
        />
        {/* Soft top/bottom vignette so the waveform fades into screen edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.12 0.05 285) 0%, transparent 15%, transparent 85%, oklch(0.12 0.05 285) 100%)",
          }}
        />
      </div>

      {/* ON LED — top-left of bezel */}
      <div
        className="ch-tv-led pointer-events-none absolute"
        style={{
          top: "10px",
          left: "14px",
          width: "8px",
          height: "8px",
          borderRadius: "9999px",
          background: "oklch(0.72 0.21 22)",
          boxShadow: "0 0 14px oklch(0.72 0.21 22 / 0.8)",
        }}
      />

      {/* Tuning knob — right side of bezel, vertically centered */}
      <div
        className="ch-tv-knob pointer-events-none absolute flex items-center justify-center"
        style={{
          top: "50%",
          right: "2px",
          transform: "translateY(-50%)",
          width: "20px",
          height: "20px",
          borderRadius: "9999px",
          background: "oklch(0.17 0.08 290)",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "9999px",
            background: "oklch(0.72 0.21 22)",
          }}
        />
      </div>

      {/* Model plate — bottom-right of bezel */}
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          bottom: "8px",
          right: "12px",
          width: "18px",
          height: "8px",
          background: "oklch(0.17 0.08 290 / 0.15)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "6px",
          letterSpacing: "0.05em",
          color: "oklch(0.17 0.08 290 / 0.55)",
          lineHeight: 1,
        }}
      >
        MCM-62
      </div>

      <style>{`
        @keyframes ch-tv-led-pulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes ch-tv-knob-idle {
          0%, 100% { transform: translateY(-50%) rotate(-8deg); }
          50%      { transform: translateY(-50%) rotate(8deg); }
        }
        .ch-tv-led {
          animation: ch-tv-led-pulse 1.4s ease-in-out infinite;
        }
        .ch-tv-knob {
          animation: ch-tv-knob-idle 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ch-tv-led { animation: none !important; opacity: 1 !important; }
          .ch-tv-knob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
