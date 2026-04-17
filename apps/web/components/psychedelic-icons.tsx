/**
 * 25 hand-drawn psychedelic SVG glyphs for the live-from-the-hotline
 * marquee. Each icon renders at 40x40, uses a shared set of 5 OKLCH
 * gradients (citrus, coral, mint, magenta, primary), and has a drop
 * shadow so it pops against the card background.
 *
 * Use `pickIcon(id)` to get a deterministic icon for a compliment —
 * same id always resolves to the same glyph, so the marquee looks
 * stable across mount/unmount.
 */

// All icons share these 5 gradients. We scope ids to icon index to
// avoid collisions when multiple icons render on the same page.
const GRADS = [
  { id: "g-citrus", from: "oklch(0.89 0.17 92)", to: "oklch(0.72 0.21 22)" },   // yellow → orange
  { id: "g-coral", from: "oklch(0.72 0.21 22)", to: "oklch(0.70 0.28 338)" },   // orange → magenta
  { id: "g-mint", from: "oklch(0.89 0.15 162)", to: "oklch(0.70 0.28 338)" },   // mint → magenta
  { id: "g-magenta", from: "oklch(0.70 0.28 338)", to: "oklch(0.45 0.27 291)" },// magenta → purple
  { id: "g-primary", from: "oklch(0.45 0.27 291)", to: "oklch(0.89 0.17 92)" }, // purple → yellow
] as const;

type IconProps = { grad?: number };

const S = 40;
const STROKE = "oklch(0.93 0.04 82)";

function Defs({ k }: { k: number }) {
  return (
    <defs>
      {GRADS.map((g) => (
        <linearGradient key={g.id} id={`${g.id}-${k}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g.from} />
          <stop offset="100%" stopColor={g.to} />
        </linearGradient>
      ))}
    </defs>
  );
}

const gradHref = (k: number, grad: number) => `url(#${GRADS[grad % GRADS.length]!.id}-${k})`;

// Each icon takes a unique index so its gradient ids don't collide with
// other icons on the page.
export type IconFn = (props: IconProps & { k: number }) => React.ReactElement;

// 1. inward spiral
const Spiral: IconFn = ({ grad = 0, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path
      d="M20 6 A14 14 0 1 1 6 20 A10 10 0 1 1 20 10 A6 6 0 1 1 14 16 A2 2 0 1 1 18 14"
      fill="none"
      stroke={gradHref(k, grad)}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// 2. eye with rays
const RayEye: IconFn = ({ grad = 1, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      return (
        <line
          key={i}
          x1={20 + Math.cos(a) * 12}
          y1={20 + Math.sin(a) * 12}
          x2={20 + Math.cos(a) * 18}
          y2={20 + Math.sin(a) * 18}
          stroke={gradHref(k, grad)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    })}
    <ellipse cx="20" cy="20" rx="10" ry="6" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" />
    <circle cx="20" cy="20" r="3" fill={gradHref(k, grad)} />
  </svg>
);

// 3. mushroom
const Mushroom: IconFn = ({ grad = 2, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M8 20 Q8 8 20 8 Q32 8 32 20 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.5" />
    <rect x="16" y="20" width="8" height="12" rx="2" fill={gradHref(k, grad)} opacity="0.6" />
    <circle cx="14" cy="16" r="2" fill={STROKE} opacity="0.8" />
    <circle cx="24" cy="14" r="1.5" fill={STROKE} opacity="0.8" />
    <circle cx="20" cy="18" r="1.2" fill={STROKE} opacity="0.8" />
  </svg>
);

// 4. third eye triangle
const ThirdEye: IconFn = ({ grad = 3, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 6 L34 30 L6 30 Z" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" strokeLinejoin="round" />
    <ellipse cx="20" cy="22" rx="8" ry="4" fill="none" stroke={gradHref(k, grad)} strokeWidth="1.8" />
    <circle cx="20" cy="22" r="2.4" fill={gradHref(k, grad)} />
  </svg>
);

// 5. lightning bolt
const Bolt: IconFn = ({ grad = 4, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M22 4 L8 22 L18 22 L14 36 L32 16 L22 16 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);

// 6. curly flame
const Flame: IconFn = ({ grad = 0, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 4 Q8 14 12 24 Q14 32 20 34 Q26 32 28 24 Q30 16 22 12 Q24 18 20 22 Q18 16 20 4 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" />
  </svg>
);

// 7. heart ECG pulse
const HeartPulse: IconFn = ({ grad = 1, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 32 C8 22 8 12 14 10 C18 10 20 14 20 14 C20 14 22 10 26 10 C32 12 32 22 20 32 Z" fill={gradHref(k, grad)} />
    <polyline points="4,22 12,22 15,16 18,26 21,20 24,22 36,22" fill="none" stroke={STROKE} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 8. hexagram
const Hex: IconFn = ({ grad = 2, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 4 L34 28 L6 28 Z" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" strokeLinejoin="round" />
    <path d="M20 36 L6 12 L34 12 Z" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

// 9. sunburst
const Sun: IconFn = ({ grad = 3, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    {Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return (
        <line
          key={i}
          x1={20 + Math.cos(a) * 10}
          y1={20 + Math.sin(a) * 10}
          x2={20 + Math.cos(a) * 18}
          y2={20 + Math.sin(a) * 18}
          stroke={gradHref(k, grad)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      );
    })}
    <circle cx="20" cy="20" r="7" fill={gradHref(k, grad)} />
  </svg>
);

// 10. smiley moon
const Moon: IconFn = ({ grad = 4, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M28 6 A16 16 0 1 0 34 26 A12 12 0 1 1 28 6 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" />
    <circle cx="20" cy="16" r="1.5" fill={STROKE} />
    <path d="M16 22 Q20 26 24 22" fill="none" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 11. peace
const Peace: IconFn = ({ grad = 0, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <circle cx="20" cy="20" r="14" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" />
    <line x1="20" y1="6" x2="20" y2="34" stroke={gradHref(k, grad)} strokeWidth="2" />
    <line x1="20" y1="20" x2="10" y2="30" stroke={gradHref(k, grad)} strokeWidth="2" />
    <line x1="20" y1="20" x2="30" y2="30" stroke={gradHref(k, grad)} strokeWidth="2" />
  </svg>
);

// 12. melting smiley
const Melt: IconFn = ({ grad = 1, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M6 16 A14 14 0 0 1 34 16 L34 26 Q30 34 20 30 Q12 34 6 28 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" />
    <circle cx="14" cy="16" r="2" fill={STROKE} />
    <circle cx="26" cy="16" r="2" fill={STROKE} />
    <path d="M13 22 Q20 28 27 22" fill="none" stroke={STROKE} strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 13. rainbow arc
const Rainbow: IconFn = ({ grad = 2, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M4 30 A16 16 0 0 1 36 30" fill="none" stroke="oklch(0.70 0.28 338)" strokeWidth="3" />
    <path d="M8 30 A12 12 0 0 1 32 30" fill="none" stroke="oklch(0.72 0.21 22)" strokeWidth="3" />
    <path d="M12 30 A8 8 0 0 1 28 30" fill="none" stroke="oklch(0.89 0.17 92)" strokeWidth="3" />
    <path d="M16 30 A4 4 0 0 1 24 30" fill="none" stroke="oklch(0.89 0.15 162)" strokeWidth="3" />
  </svg>
);

// 14. ripple
const Ripple: IconFn = ({ grad = 3, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M4 14 Q10 8 16 14 T28 14 T40 14" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" />
    <path d="M4 22 Q10 16 16 22 T28 22 T40 22" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" opacity="0.7" />
    <path d="M4 30 Q10 24 16 30 T28 30 T40 30" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" opacity="0.4" />
  </svg>
);

// 15. daisy
const Daisy: IconFn = ({ grad = 4, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i * Math.PI) / 3;
      return (
        <ellipse
          key={i}
          cx={20 + Math.cos(a) * 8}
          cy={20 + Math.sin(a) * 8}
          rx="4"
          ry="7"
          fill={gradHref(k, grad)}
          transform={`rotate(${(i * 60) + 90} ${20 + Math.cos(a) * 8} ${20 + Math.sin(a) * 8})`}
          opacity="0.85"
        />
      );
    })}
    <circle cx="20" cy="20" r="4" fill={STROKE} />
  </svg>
);

// 16. ringed planet
const Planet: IconFn = ({ grad = 0, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <ellipse cx="20" cy="20" rx="18" ry="6" fill="none" stroke={gradHref(k, grad)} strokeWidth="2" transform="rotate(-20 20 20)" />
    <circle cx="20" cy="20" r="8" fill={gradHref(k, grad)} />
    <circle cx="17" cy="18" r="1.5" fill={STROKE} opacity="0.8" />
  </svg>
);

// 17. galaxy
const Galaxy: IconFn = ({ grad = 1, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 4 Q34 14 20 20 Q6 26 20 36" fill="none" stroke={gradHref(k, grad)} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="2.5" fill={STROKE} />
    <circle cx="10" cy="28" r="1" fill={STROKE} />
    <circle cx="30" cy="12" r="1" fill={STROKE} />
  </svg>
);

// 18. infinity
const Infinity8: IconFn = ({ grad = 2, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M10 20 Q6 12 14 12 Q22 12 20 20 Q18 28 26 28 Q34 28 30 20 Q26 12 20 20 Q14 28 10 28 Q2 28 10 20 Z" fill="none" stroke={gradHref(k, grad)} strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

// 19. lotus
const Lotus: IconFn = ({ grad = 3, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 30 Q8 22 20 8 Q32 22 20 30 Z" fill={gradHref(k, grad)} opacity="0.85" />
    <path d="M20 30 Q4 26 10 14 Q18 22 20 30 Z" fill={gradHref(k, grad)} opacity="0.7" />
    <path d="M20 30 Q36 26 30 14 Q22 22 20 30 Z" fill={gradHref(k, grad)} opacity="0.7" />
    <path d="M4 30 Q20 36 36 30" fill="none" stroke={STROKE} strokeWidth="1.4" />
  </svg>
);

// 20. yin yang
const Yin: IconFn = ({ grad = 4, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <circle cx="20" cy="20" r="14" fill={gradHref(k, grad)} />
    <path d="M20 6 A14 14 0 0 1 20 34 A7 7 0 0 0 20 20 A7 7 0 0 1 20 6 Z" fill={STROKE} />
    <circle cx="20" cy="13" r="2" fill={gradHref(k, grad)} />
    <circle cx="20" cy="27" r="2" fill={STROKE} />
  </svg>
);

// 21. butterfly
const Butterfly: IconFn = ({ grad = 0, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 20 Q6 6 6 18 Q6 28 20 22 Q6 32 14 34 Q20 34 20 20 Z" fill={gradHref(k, grad)} opacity="0.9" />
    <path d="M20 20 Q34 6 34 18 Q34 28 20 22 Q34 32 26 34 Q20 34 20 20 Z" fill={gradHref(k, grad)} opacity="0.9" />
    <line x1="20" y1="8" x2="20" y2="34" stroke={STROKE} strokeWidth="1.5" />
  </svg>
);

// 22. teardrop
const Drop: IconFn = ({ grad = 1, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 4 Q10 18 10 26 A10 10 0 0 0 30 26 Q30 18 20 4 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" />
    <ellipse cx="16" cy="22" rx="2" ry="3" fill={STROKE} opacity="0.5" />
  </svg>
);

// 23. diamond crystal
const Crystal: IconFn = ({ grad = 2, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M20 4 L32 16 L20 36 L8 16 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M8 16 L32 16 M20 4 L20 36" stroke={STROKE} strokeWidth="1" opacity="0.6" />
  </svg>
);

// 24. cloud + star
const CloudStar: IconFn = ({ grad = 3, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <path d="M10 24 A6 6 0 0 1 14 14 A8 8 0 0 1 28 16 A5 5 0 0 1 30 26 L12 26 A4 4 0 0 1 10 24 Z" fill={gradHref(k, grad)} stroke={STROKE} strokeWidth="1.2" />
    <path d="M32 6 L33 10 L37 11 L33 12 L32 16 L31 12 L27 11 L31 10 Z" fill={STROKE} />
  </svg>
);

// 25. vinyl record
const Vinyl: IconFn = ({ grad = 4, k }) => (
  <svg viewBox={`0 0 ${S} ${S}`}>
    <Defs k={k} />
    <circle cx="20" cy="20" r="16" fill={gradHref(k, grad)} />
    <circle cx="20" cy="20" r="12" fill="none" stroke={STROKE} strokeWidth="0.8" opacity="0.4" />
    <circle cx="20" cy="20" r="9" fill="none" stroke={STROKE} strokeWidth="0.8" opacity="0.4" />
    <circle cx="20" cy="20" r="5" fill={STROKE} />
    <circle cx="20" cy="20" r="1.2" fill={gradHref(k, grad)} />
  </svg>
);

const ICONS: IconFn[] = [
  Spiral, RayEye, Mushroom, ThirdEye, Bolt,
  Flame, HeartPulse, Hex, Sun, Moon,
  Peace, Melt, Rainbow, Ripple, Daisy,
  Planet, Galaxy, Infinity8, Lotus, Yin,
  Butterfly, Drop, Crystal, CloudStar, Vinyl,
];

/**
 * Deterministic per-id pick. Same id always returns the same icon so
 * the marquee doesn't re-shuffle icons between renders.
 */
export function PsychedelicIcon({
  id,
  className,
  size = 40,
}: {
  id: number;
  className?: string;
  size?: number;
}) {
  const idx = Math.abs(id) % ICONS.length;
  const gradIdx = Math.abs(id * 7 + 3) % GRADS.length;
  const Icon = ICONS[idx]!;
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        filter: "drop-shadow(0 0 10px oklch(0.89 0.17 92 / 0.35)) drop-shadow(0 0 2px oklch(0.70 0.28 338 / 0.5))",
      }}
      aria-hidden
    >
      <Icon k={idx} grad={gradIdx} />
    </span>
  );
}

export const ICON_COUNT = ICONS.length;
