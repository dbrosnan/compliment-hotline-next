import type { CloudflareEnv } from "./env";

/**
 * Fetch the audio for a compliment from R2 and transcribe via Workers AI
 * (`@cf/openai/whisper`). Save the resulting text back to D1.
 *
 * Intended to be called via `ctx.waitUntil(...)` so the admin approve
 * request returns immediately — transcription takes a few seconds.
 *
 * Skips silently if:
 *  - row missing
 *  - no audio_key (text-only, shouldn't exist now but safe)
 *  - transcript already populated
 *  - R2 object missing
 *
 * Failures are swallowed to a console.warn; the compliment stays approved
 * either way. Transcript is for a11y/moderator search, not a hard dep.
 */
export async function transcribeCompliment(
  env: CloudflareEnv,
  id: number,
  opts: { force?: boolean } = {},
): Promise<{ ok: boolean; reason?: string; transcript?: string }> {
  const row = await env.DB.prepare(
    `SELECT audio_key, transcript FROM compliments WHERE id = ?`,
  )
    .bind(id)
    .first<{ audio_key: string | null; transcript: string | null }>();

  if (!row) return { ok: false, reason: "not-found" };
  if (!row.audio_key) return { ok: false, reason: "no-audio" };
  if (row.transcript && !opts.force) {
    return { ok: true, reason: "already-transcribed", transcript: row.transcript };
  }

  const obj = await env.AUDIO.get(row.audio_key);
  if (!obj) return { ok: false, reason: "audio-missing-from-r2" };

  const buf = await obj.arrayBuffer();
  const bytes = [...new Uint8Array(buf)];

  try {
    const res = (await env.AI.run("@cf/openai/whisper" as never, {
      audio: bytes,
    } as never)) as { text?: string } | null;

    const text = (res?.text || "").trim();
    if (!text) return { ok: false, reason: "empty-transcript" };

    await env.DB.prepare(
      `UPDATE compliments SET transcript = ? WHERE id = ?`,
    )
      .bind(text, id)
      .run();

    return { ok: true, transcript: text };
  } catch (e) {
    console.warn(`[transcribe] id=${id} failed:`, e);
    return { ok: false, reason: "ai-error" };
  }
}
