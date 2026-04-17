import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";
import { transcribeCompliment } from "@/lib/server/transcribe";

/**
 * Admin batch: transcribe every approved row that has audio but no
 * transcript yet. Runs sequentially (Workers AI is rate-limited per
 * account) and returns a per-id summary.
 *
 * Workers have a wall-clock limit but no CPU limit during AI calls — in
 * practice ~20 clips finish comfortably inside one request. For larger
 * backlogs the admin can just click again.
 */
export async function POST(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  const rows = await env.DB.prepare(
    `SELECT id FROM compliments
     WHERE status = 'approved'
       AND audio_key IS NOT NULL
       AND (transcript IS NULL OR transcript = '')
     ORDER BY id ASC
     LIMIT 50`,
  ).all<{ id: number }>();

  const ids = (rows.results || []).map((r) => r.id);
  const results: Array<{ id: number; ok: boolean; reason?: string }> = [];

  for (const id of ids) {
    const r = await transcribeCompliment(env, id);
    results.push({ id, ok: r.ok, reason: r.reason });
  }

  return ok({
    processed: ids.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
