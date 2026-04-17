import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";

/**
 * Admin: list EVERY compliment (pending, approved, rejected).
 * Used by /compliments moderation page.
 */
export async function GET(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  const url = new URL(request.url);
  const status = url.searchParams.get("status"); // optional filter

  const stmt = status
    ? env.DB.prepare(
        `SELECT id, name, audio_key, mime_type, duration_ms, status, reject_reason, created_at
         FROM compliments
         WHERE status = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 500`,
      ).bind(status)
    : env.DB.prepare(
        `SELECT id, name, audio_key, mime_type, duration_ms, status, reject_reason, created_at
         FROM compliments
         ORDER BY created_at DESC, id DESC
         LIMIT 500`,
      );

  const res = await stmt.all();
  return ok({ items: res.results || [] });
}
