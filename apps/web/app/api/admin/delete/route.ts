import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";

/**
 * Admin: permanently delete one or many compliments.
 * Body: { ids: number[] } OR { id: number }
 * Removes the R2 audio blob (if any) AND the D1 row.
 */
export async function POST(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  let body: { id?: number; ids?: number[] };
  try {
    body = await request.json();
  } catch {
    return err("invalid JSON", 400);
  }
  const ids = (Array.isArray(body.ids) ? body.ids : body.id != null ? [body.id] : [])
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n));
  if (!ids.length) return err("no ids provided", 400);

  const placeholders = ids.map(() => "?").join(",");
  const rows = await env.DB.prepare(
    `SELECT id, audio_key FROM compliments WHERE id IN (${placeholders})`,
  )
    .bind(...ids)
    .all<{ id: number; audio_key: string | null }>();

  for (const r of rows.results || []) {
    if (r.audio_key) {
      try {
        await env.AUDIO.delete(r.audio_key);
      } catch {
        /* best-effort */
      }
    }
  }

  const del = await env.DB.prepare(
    `DELETE FROM compliments WHERE id IN (${placeholders})`,
  )
    .bind(...ids)
    .run();

  return ok({ deleted: del.meta.changes ?? ids.length, ids });
}
