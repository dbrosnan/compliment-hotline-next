import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return err("invalid id", 400);

  const row = await env.DB.prepare(
    `SELECT audio_key, mime_type FROM compliments WHERE id = ?`,
  )
    .bind(id)
    .first<{ audio_key: string | null; mime_type: string | null }>();

  if (!row || !row.audio_key) return err("not found", 404);
  const obj = await env.AUDIO.get(row.audio_key);
  if (!obj) return err("audio missing", 404);

  return new Response(obj.body as ReadableStream, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || row.mime_type || "audio/webm",
      "Content-Length": String(obj.size),
      "Cache-Control": "private, no-store",
    },
  });
}
