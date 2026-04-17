/**
 * 100 short (<8 char) placeholder names for anonymous compliments.
 * Every entry is a single word, 3–7 characters, lowercase.
 *
 * Grouped by flavor — classic anon, nature, cosmic, music/era, small
 * animals, playful foods, mysterious, gems, warm vibes, and bright
 * one-word nicknames.
 *
 * `getAnonName(id)` is deterministic — the same compliment id always
 * resolves to the same alias across renders and sessions.
 */
export const ANON_NAMES: readonly string[] = [
  // classic anon (10)
  "anon", "jon", "jane", "doe", "nemo", "x", "y", "z", "nobody", "stealth",

  // nature / flora (10)
  "moon", "sun", "star", "sky", "bloom", "leaf", "fern", "sage", "ivy", "poppy",

  // more nature (10)
  "daisy", "clover", "mist", "dusk", "dawn", "rain", "cloud", "river", "pebble", "breeze",

  // cosmic / sparkle (10)
  "nova", "orbit", "halo", "echo", "glow", "flare", "spark", "ember", "blaze", "prism",

  // music / era (10)
  "disco", "vinyl", "funk", "groove", "beat", "pulse", "tempo", "tune", "jazzy", "retro",

  // small animals (10)
  "owl", "bee", "fox", "cat", "mouse", "bunny", "koala", "otter", "puffin", "ferret",

  // nicknames (10)
  "pip", "scout", "ziggy", "bingo", "cosmo", "dizzy", "fizzy", "lucky", "ducky", "happy",

  // playful / foods (10)
  "giggle", "wiggle", "noodle", "waffle", "pickle", "bagel", "cookie", "muffin", "peanut", "pepper",

  // mysterious (10)
  "ghost", "mystic", "shadow", "wraith", "phantom", "cipher", "rogue", "bandit", "hush", "oracle",

  // gems + warm vibes (10)
  "onyx", "opal", "ruby", "pearl", "jade", "amber", "topaz", "coral", "crystal", "agate",
] as const;

if (process.env.NODE_ENV !== "production") {
  if (ANON_NAMES.length !== 100) {
    console.warn(`ANON_NAMES has ${ANON_NAMES.length} entries, expected 100`);
  }
  const tooLong = ANON_NAMES.filter((n) => n.length >= 8);
  if (tooLong.length) console.warn(`ANON_NAMES entries >=8 chars:`, tooLong);
}

/**
 * Deterministic per-id pick so the same compliment always shows the
 * same placeholder. Skewed sine hash to avoid modulo bias on small
 * id ranges.
 */
export function getAnonName(id: number | string | null | undefined): string {
  if (id === null || id === undefined) return ANON_NAMES[0]!;
  const n = typeof id === "number" ? id : id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const x = Math.sin(n * 9301 + 49297) * 233280;
  const idx = Math.floor(Math.abs(x - Math.floor(x)) * ANON_NAMES.length);
  return ANON_NAMES[idx % ANON_NAMES.length]!;
}
