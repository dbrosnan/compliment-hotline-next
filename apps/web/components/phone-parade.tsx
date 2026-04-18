"use client";

/**
 * Decorative kinetic wallpaper layer: floating + ringing rotary phones
 * drift across the hero in monochrome midnight-on-cream with a single
 * coral dial accent — reads as Knoll-era wallpaper motif, not foreground.
 * Purely ambient — pointer-events:none, aria-hidden, motion-reduce safe.
 */
export function PhoneParade() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {PHONES.map((p, i) => (
        <div
          key={i}
          className="absolute sm:[transform:scale(1.4)] md:[transform:scale(1.7)] origin-center"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `pp-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        >
          <div
            style={{
              animation: `pp-ring ${2 + (i % 3) * 0.3}s ease-in-out ${p.delay}s infinite`,
              transform: `rotate(${p.tilt}deg)`,
              filter: "drop-shadow(4px 4px 0 oklch(0.17 0.08 290 / 0.35))",
            }}
          >
            <RotaryPhone />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pp-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-28px) translateX(14px); }
        }
        @keyframes pp-ring {
          0%, 86%, 100% { rotate: 0deg; }
          88% { rotate: -6deg; }
          91% { rotate: 6deg; }
          94% { rotate: -3deg; }
          97% { rotate: 2deg; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="pointer-events-none"] [style*="pp-float"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// Opacity halved from original dark-mode values — these phones now read
// as pale wallpaper on butter yellow, not foreground objects.
const PHONES = [
  { x: 6, y: 14, size: 42, tilt: -14, opacity: 0.15, duration: 14, delay: 0 },
  { x: 86, y: 22, size: 34, tilt: 18, opacity: 0.12, duration: 16, delay: 2 },
  { x: 16, y: 72, size: 40, tilt: 22, opacity: 0.14, duration: 13, delay: 4 },
  { x: 80, y: 80, size: 32, tilt: -26, opacity: 0.11, duration: 15, delay: 1 },
  { x: 2, y: 48, size: 28, tilt: 12, opacity: 0.09, duration: 17, delay: 3 },
  { x: 94, y: 54, size: 30, tilt: -18, opacity: 0.1, duration: 12, delay: 5 },
];

function RotaryPhone() {
  const cream = "oklch(0.93 0.04 82)";
  const midnight = "oklch(0.17 0.08 290)";
  return (
    <svg viewBox="0 0 160 130" width="100%" height="100%">
      <defs>
        <linearGradient id="ppDial" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.21 22 / 0.9)" />
          <stop offset="100%" stopColor="oklch(0.72 0.21 22 / 0.6)" />
        </linearGradient>
      </defs>
      {/* base */}
      <rect x="10" y="65" width="140" height="55" rx="10" fill={cream} stroke={midnight} strokeWidth="2" />
      {/* dial — the one spot of coral color */}
      <circle cx="80" cy="92" r="26" fill="url(#ppDial)" stroke={midnight} strokeWidth="2" />
      <circle cx="80" cy="92" r="9" fill={midnight} />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={80 + Math.cos(a) * 17} cy={92 + Math.sin(a) * 17} r="2.5" fill={midnight} />;
      })}
      {/* cradle hooks */}
      <rect x="18" y="58" width="20" height="8" rx="2" fill={midnight} />
      <rect x="122" y="58" width="20" height="8" rx="2" fill={midnight} />
      {/* receiver */}
      <path
        d="M10 40 C10 25, 32 18, 46 30 L115 30 C129 18, 150 25, 150 40 C150 55, 129 62, 115 50 L46 50 C32 62, 10 55, 10 40 Z"
        fill={cream}
        stroke={midnight}
        strokeWidth="2"
      />
      <circle cx="24" cy="40" r="5" fill={midnight} opacity="0.7" />
      <circle cx="136" cy="40" r="5" fill={midnight} opacity="0.7" />
    </svg>
  );
}
