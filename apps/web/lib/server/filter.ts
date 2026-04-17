const BLOCKED = [
  "kill yourself",
  "kys",
  "you should die",
  "go die",
  "http://",
  "https://",
  "www.",
  ".com/",
  ".net/",
  ".xyz",
  "onlyfans",
  "telegram @",
  "bitcoin",
  "crypto wallet",
];

export function isBlocked(text: string): { blocked: boolean; reason?: string } {
  const t = text.toLowerCase();
  for (const kw of BLOCKED) {
    if (t.includes(kw)) return { blocked: true, reason: `contains: ${kw}` };
  }
  if (!/[a-z]{2,}/i.test(text)) return { blocked: true, reason: "no-letters" };
  return { blocked: false };
}
