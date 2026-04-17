import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { asInt } from "@/lib/server/env";
import { err, ok } from "@/lib/server/response";


export async function PUT(request: NextRequest) {
  const env = await cfEnv();
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const idStr = url.searchParams.get("id");
  if (!key || !idStr) return err("missing key or id", 400);
  const id = Number(idStr);
  if (!Number.isFinite(id)) return err("invalid id", 400);

  const row = await env.DB.prepare(
    `SELECT audio_key, mime_type, status FROM compliments WHERE id = ?`,
  )
    .bind(id)
    .first<{ audio_key: string; mime_type: string; status: string }>();

  if (!row) return err("not found", 404);
  if (row.audio_key !== key) return err("key mismatch", 403);
  if (row.status !== "pending") return err("already finalized", 409);

  const maxBytes = asInt(env.MAX_AUDIO_BYTES, 2_097_152);
  const contentLength = Number(request.headers.get("Content-Length") || "0");
  if (contentLength <= 0) return err("content-length required", 411);
  if (contentLength > maxBytes) return err(`payload exceeds ${maxBytes} bytes`, 413);

  const contentType = request.headers.get("Content-Type") || row.mime_type || "application/octet-stream";

  if (!request.body) return err("no body", 400);
  // Workers-types redefines ReadableStream; R2 accepts ArrayBuffer just fine at
  // our 2 MiB cap, so buffer first to sidestep the type clash.
  const buf = await request.arrayBuffer();
  await env.AUDIO.put(key, buf, {
    httpMetadata: { contentType },
  });

  return ok({ key, bytes: contentLength }, { status: 201 });
}
