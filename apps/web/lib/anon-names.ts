/**
 * 100 playful placeholder names for anonymous compliments. Used in
 * place of "a stranger" on the LIVE marquee so a row of six un-named
 * submissions doesn't all read the same.
 *
 * The list mixes classic anon tropes ("anon", "a passerby"), era-cued
 * callbacks (disco, rotary phones, cassettes, fireflies), and warm
 * pocket-of-sunshine phrases. Kept lowercase to match the cards'
 * font-display rendering and the "a stranger" precedent.
 *
 * `getAnonName(id)` is deterministic — the same compliment id always
 * resolves to the same pseudo-name across renders and sessions so
 * people don't see a card flicker between aliases.
 */
export const ANON_NAMES: readonly string[] = [
  // classic placeholders
  "a stranger",
  "anon",
  "jon doe",
  "jane doe",
  "someone",
  "a passerby",
  "a friend of a friend",
  "a friend you haven't met",
  "an unknown caller",
  "caller ID unknown",

  // warm / kind
  "a kind soul",
  "a gentle soul",
  "a soft voice",
  "a quiet hero",
  "a bright light",
  "a cozy human",
  "a tender heart",
  "someone who cares",
  "a good stranger",
  "a kind voice",

  // nocturnal / dreamy
  "a night owl",
  "a day dreamer",
  "a moonwalker",
  "a stargazer",
  "a moonbeam",
  "a lullaby",
  "a whisperer",
  "a sleepwalker",
  "a dream catcher",
  "a lamp lighter",

  // disco / festival / analog era
  "a disco kid",
  "a roller skater",
  "a cassette tape",
  "a vinyl scratcher",
  "a tambourine",
  "a disco ball",
  "a glitter cannon",
  "a dust particle in a sunbeam",
  "a pay phone",
  "a hotline hero",

  // cosmic / sparkle
  "a firefly",
  "a glitter witch",
  "a star scout",
  "a sun seeker",
  "a cosmic friend",
  "a sparkle pusher",
  "a twinkle",
  "a good cloud",
  "a dimension hopper",
  "a rainbow chaser",

  // mysterious
  "a shadow",
  "a phantom caller",
  "a mystery caller",
  "a secret admirer",
  "a voice in the crowd",
  "an echo",
  "a postcard from nowhere",
  "a happy accident",
  "a good samaritan",
  "a forgotten friend",

  // sound / wave metaphors
  "a wavelength",
  "a frequency",
  "a sound wave",
  "a standing wave",
  "a sine wave",
  "a heartbeat",
  "a pulse",
  "a ripple",
  "a human radio",
  "a heart on a wire",

  // delivery / courier vibe
  "a joy deliverer",
  "a hope whisperer",
  "a smile dealer",
  "a compliment bandit",
  "a compliment merchant",
  "a kindness courier",
  "a day saver",
  "a mood lifter",
  "a smile engineer",
  "a joy smith",

  // poetic nature
  "a warm breeze",
  "a wildflower",
  "a sun ray",
  "a golden hour",
  "a slow dance",
  "a pocket of sunshine",
  "a light leak",
  "a love letter",
  "a candle in the window",
  "a little bird",

  // playful
  "a silly goose",
  "a gentle giant",
  "a tiny dancer",
  "a human hug",
  "a soft landing",
  "a warm hello",
  "a happy fluke",
  "a random spark",
  "a quiet listener",
  "a song stuck in your head",

  // future-facing + wink
  "a future friend",
  "a wanderer",
  "a phone friend",
  "a festival stranger",
  "a dance partner",
  "a big heart",
  "a tiny moon",
  "a sweet unknown",
  "a good fluke",
  "a wild card",
] as const;

if (process.env.NODE_ENV !== "production" && ANON_NAMES.length !== 100) {
  // dev-only integrity check
  console.warn(`ANON_NAMES has ${ANON_NAMES.length} entries, expected 100`);
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
