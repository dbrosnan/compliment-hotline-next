import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { asInt } from "@/lib/server/env";
import { err, ok } from "@/lib/server/response";


type Row = {
  id: number;
  name: string | null;
  message: string | null;
  audio_key: string | null;
  duration_ms: number | null;
  created_at: number;
};

const encodeCursor = (ts: number, id: number) => btoa(`${ts}_${id}`).replace(/=+$/, "");

const decodeCursor = (cursor: string): { ts: number; id: number } | null => {
  try {
    const [tsStr, idStr] = atob(cursor).split("_");
    const ts = Number(tsStr);
    const id = Number(idStr);
    if (!Number.isFinite(ts) || !Number.isFinite(id)) return null;
    return { ts, id };
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const env = await cfEnv();
  const url = new URL(request.url);
  const limit = Math.min(
    50,
    Math.max(1, asInt(url.searchParams.get("limit") || "", asInt(env.FEED_PAGE_SIZE, 20))),
  );
  const cursor = url.searchParams.get("cursor");

  const stmt = cursor
    ? (() => {
        const c = decodeCursor(cursor);
        if (!c) return null;
        return env.DB.prepare(
          `SELECT id, name, message, audio_key, duration_ms, created_at
           FROM compliments
           WHERE status IN ('approved','seed')
             AND (created_at < ? OR (created_at = ? AND id < ?))
           ORDER BY created_at DESC, id DESC
           LIMIT ?`,
        ).bind(c.ts, c.ts, c.id, limit);
      })()
    : env.DB.prepare(
        `SELECT id, name, message, audio_key, duration_ms, created_at
         FROM compliments
         WHERE status IN ('approved','seed')
         ORDER BY created_at DESC, id DESC
         LIMIT ?`,
      ).bind(limit);

  if (!stmt) return err("invalid cursor", 400);

  const res = await stmt.all<Row>();
  const rows = res.results || [];
  const items = rows.map((r) => ({
    id: r.id,
    name: r.name,
    message: r.message,
    has_audio: !!r.audio_key,
    duration_ms: r.duration_ms,
    created_at: r.created_at,
  }));
  const last = rows[rows.length - 1];
  const next_cursor = rows.length === limit && last ? encodeCursor(last.created_at, last.id) : null;

  return ok({ items, next_cursor }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=30" } });
}
