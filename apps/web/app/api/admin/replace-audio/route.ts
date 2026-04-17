import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";

/**
 * Admin: replace a compliment's audio with a new blob. Used to
 * backfill legacy WebM uploads to mp4 so iOS can play them.
 *
 * POST /api/admin/replace-audio?id=17
 * Content-Type: audio/mp4
 * body: raw bytes
 */
export async function POST(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id)) return err("invalid id", 400);

  const mimeType = request.headers.get("content-type") || "audio/mp4";
  if (!/^audio\//.test(mimeType)) return err("body must be audio/*", 400);

  const row = await env.DB.prepare(`SELECT audio_key FROM compliments WHERE id = ?`)
    .bind(id)
    .first<{ audio_key: string | null }>();
  if (!row?.audio_key) return err("no audio to replace", 404);

  const body = await request.arrayBuffer();
  if (!body.byteLength) return err("empty body", 400);

  const ext = mimeType.includes("mp4") ? "mp4" : "bin";
  const newKey = `${row.audio_key.replace(/\.[a-z0-9]+$/, "")}.${ext}`;

  await env.AUDIO.put(newKey, body, { httpMetadata: { contentType: mimeType } });
  await env.DB.prepare(`UPDATE compliments SET audio_key = ?, mime_type = ? WHERE id = ?`)
    .bind(newKey, mimeType, id)
    .run();

  return ok({ id, audio_key: newKey, mime_type: mimeType, bytes: body.byteLength });
}
