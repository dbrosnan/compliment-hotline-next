import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { asInt } from "@/lib/server/env";
import { err, ok } from "@/lib/server/response";
import { clientIp, hashIp, hashUa } from "@/lib/server/hash";
import { checkRateLimit, LIMITS } from "@/lib/server/ratelimit";


type Body = { name?: string; duration_ms?: number; mime_type?: string };

const uuid = () => crypto.randomUUID();

const buildKey = (id: string, mime: string) => {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm";
  return `audio/${yyyy}/${mm}/${dd}/${id}.${ext}`;
};

export async function POST(request: NextRequest) {
  const env = await cfEnv();
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return err("invalid JSON", 400);
  }

  const duration = Number(body.duration_ms);
  const maxDuration = asInt(env.MAX_AUDIO_DURATION_MS, 30_000);
  if (!Number.isFinite(duration) || duration <= 0 || duration > maxDuration) {
    return err(`duration must be 1-${maxDuration}ms`, 400);
  }

  const mime = (body.mime_type || "").toLowerCase();
  const allowed = env.ALLOWED_MIME.split(",").map((s) => s.trim().toLowerCase());
  if (!allowed.some((a) => mime.startsWith(a.split(";")[0]!))) {
    return err(`mime_type not allowed: ${mime}`, 400);
  }

  const maxName = asInt(env.MAX_NAME_CHARS, 60);
  const name = (body.name || "").trim();
  if (name.length > maxName) return err(`name exceeds ${maxName} chars`, 400);

  const ip = clientIp(request);
  const ipHash = await hashIp(ip, env.IP_HASH_SALT_SEED);
  const uaHash = await hashUa(request.headers.get("User-Agent") || "");

  const rl = await checkRateLimit(env, "audio_init", ipHash, [...LIMITS.audioInit]);
  if (!rl.allowed) {
    return err("too many requests", 429, { "Retry-After": String(rl.retryAfter) });
  }

  const audio_id = uuid();
  const audio_key = buildKey(audio_id, mime);

  const res = await env.DB.prepare(
    `INSERT INTO compliments (name, audio_key, mime_type, duration_ms, status, ip_hash, user_agent_hash)
     VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
  )
    .bind(name || null, audio_key, mime, Math.round(duration), ipHash, uaHash)
    .run();

  const id = res.meta.last_row_id;
  const origin = new URL(request.url).origin;
  const put_url = `${origin}/api/compliments/audio/upload?key=${encodeURIComponent(audio_key)}&id=${id}`;

  return ok({ id, audio_key, put_url }, { status: 201 });
}
