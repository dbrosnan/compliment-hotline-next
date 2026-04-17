export type ComplimentItem = {
  id: number;
  name: string | null;
  message: string | null;
  has_audio: boolean;
  duration_ms: number | null;
  created_at: number;
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

export const submitText = (body: { name?: string; message: string; hp?: string }) =>
  req<{ id: number }>("/api/compliments/text", { method: "POST", body: JSON.stringify(body) });

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
