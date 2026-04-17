import { cfEnv } from "@/lib/server/cf";
import { ok } from "@/lib/server/response";


export async function GET() {
  const env = await cfEnv();
  const res = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM compliments WHERE status IN ('approved','seed')`,
  ).first<{ n: number }>();
  return ok({ total: res?.n ?? 0 }, { headers: { "Cache-Control": "public, max-age=60" } });
}
