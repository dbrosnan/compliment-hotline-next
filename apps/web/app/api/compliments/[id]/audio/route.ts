import { cfEnv } from "@/lib/server/cf";
import { err } from "@/lib/server/response";


export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const env = await cfEnv();
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return err("invalid id", 400);

  const row = await env.DB.prepare(
    `SELECT audio_key, mime_type, status FROM compliments WHERE id = ?`,
  )
    .bind(id)
    .first<{ audio_key: string | null; mime_type: string | null; status: string }>();

  if (!row || !row.audio_key) return err("not found", 404);
  if (row.status !== "approved") return err("not available", 404);

  const obj = await env.AUDIO.get(row.audio_key);
  if (!obj) return err("audio missing", 404);

  return new Response(obj.body as ReadableStream, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || row.mime_type || "audio/webm",
      "Content-Length": String(obj.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
      "Accept-Ranges": "bytes",
    },
  });
}
