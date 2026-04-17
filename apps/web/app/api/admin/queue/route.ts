import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";


export async function GET(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  const res = await env.DB.prepare(
    `SELECT id, name, message, audio_key, mime_type, duration_ms, status, created_at
     FROM compliments
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT 200`,
  ).all();

  return ok({ items: res.results || [] });
}
