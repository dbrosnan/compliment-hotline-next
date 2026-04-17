import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";
import { transcribeCompliment } from "@/lib/server/transcribe";

/**
 * Admin: manually (re)transcribe a compliment. Body: { id, force? }.
 * Synchronous — returns the transcript or the reason it couldn't.
 * Used for backfilling rows approved before transcription was wired up,
 * or re-running Whisper on a bad transcript.
 */
export async function POST(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  let body: { id?: number; force?: boolean };
  try {
    body = await request.json();
  } catch {
    return err("invalid JSON", 400);
  }
  const id = Number(body.id);
  if (!Number.isFinite(id)) return err("invalid id", 400);

  const result = await transcribeCompliment(env, id, { force: !!body.force });
  return ok(result);
}
