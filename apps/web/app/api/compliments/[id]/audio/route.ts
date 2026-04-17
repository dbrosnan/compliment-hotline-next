import { cfEnv } from "@/lib/server/cf";
import { err } from "@/lib/server/response";

/**
 * Stream an approved compliment's audio from R2.
 *
 * Handles HTTP Range requests — iOS Safari and Discord's webview will
 * often send `Range: bytes=0-1` or `bytes=0-` to probe the file before
 * playback; if we respond with a full 200, iOS silently fails ("line
 * dropped"). So: parse the Range header, fetch only that slice from
 * R2, and respond with 206 Partial Content.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const headObj = await env.AUDIO.head(row.audio_key);
  if (!headObj) return err("audio missing", 404);
  const size = headObj.size;
  const contentType = headObj.httpMetadata?.contentType || row.mime_type || "audio/webm";

  const rangeHeader = request.headers.get("range");
  const match = rangeHeader?.match(/^bytes=(\d+)-(\d*)$/);

  if (match) {
    const start = Math.max(0, Number(match[1]));
    const end = match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
    if (start >= size || start > end) {
      return new Response("range not satisfiable", {
        status: 416,
        headers: { "Content-Range": `bytes */${size}` },
      });
    }
    const length = end - start + 1;
    const obj = await env.AUDIO.get(row.audio_key, {
      range: { offset: start, length },
    });
    if (!obj) return err("audio missing", 404);
    return new Response(obj.body as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(length),
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes",
      },
    });
  }

  const obj = await env.AUDIO.get(row.audio_key);
  if (!obj) return err("audio missing", 404);
  return new Response(obj.body as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": "inline",
      "Accept-Ranges": "bytes",
    },
  });
}
