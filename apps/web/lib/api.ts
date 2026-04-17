export type ComplimentItem = {
  id: number;
  name: string | null;
  has_audio: boolean;
  /** MIME type of the stored audio, e.g. "audio/webm;codecs=opus" or
   *  "audio/mp4". Used to pre-filter clips the device's browser can't
   *  decode (notably iOS Safari can't play WebM/Opus). */
  mime_type?: string | null;
  duration_ms: number | null;
  /** Populated by Workers AI Whisper after approval. Used for a11y
   *  (aria-label on the marquee + pickup modal) — NOT displayed as
   *  decorative text, so we preserve the surprise of picking up. */
  transcript?: string | null;
  created_at: number;
  /** Only present on /recent responses. Omitted by older clients / fallback data. */
  status?: "approved";
};

export type RecentResponse = {
  items: ComplimentItem[];
  next_cursor: string | null;
};

type Envelope<T> = { ok: true; data: T } | { ok: false; error: string };

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body: Envelope<T> = await res.json();
  if (!body.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body.data;
}

export const fetchRecent = (cursor?: string) =>
  req<RecentResponse>(`/api/compliments/recent${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);

export const fetchStats = () => req<{ total: number }>("/api/compliments/stats");

export const initAudio = (body: { name?: string; duration_ms: number; mime_type: string }) =>
  req<{ id: number; put_url: string; audio_key: string }>("/api/compliments/audio/init", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const finalizeAudio = (body: { id: number }) =>
  req<{ id: number; status: string }>("/api/compliments/audio/finalize", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const audioUrl = (id: number) => `/api/compliments/${id}/audio`;
