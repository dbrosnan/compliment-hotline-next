import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";
import { transcribeCompliment } from "@/lib/server/transcribe";

/**
 * Admin: approve one or many compliments.
 * Body: { id: number } OR { ids: number[] }
 *
 * After approving, kicks off Whisper transcription for each approved row
 * via ctx.waitUntil — fire-and-forget. Transcript lands in D1 a few
 * seconds later; admin doesn't wait.
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
  const res = await env.DB.prepare(
    `UPDATE compliments SET status = 'approved' WHERE id IN (${placeholders})`,
  )
    .bind(...ids)
    .run();

  // Fire transcription in the background so approve returns immediately.
  const ctx = await getCloudflareContext({ async: true });
  for (const id of ids) {
    ctx.ctx.waitUntil(transcribeCompliment(env, id));
  }

  return ok({ approved: res.meta.changes ?? ids.length, ids });
}
