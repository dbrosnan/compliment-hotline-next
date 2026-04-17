import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { isAdmin } from "@/lib/server/admin";


export async function POST(request: NextRequest) {
  const env = await cfEnv();
  if (!(await isAdmin(env, request))) return err("unauthorized", 401);

  let body: { id?: number };
  try {
    body = await request.json();
  } catch {
    return err("invalid JSON", 400);
  }
  const id = Number(body.id);
  if (!Number.isFinite(id)) return err("invalid id", 400);

  await env.DB.prepare(`UPDATE compliments SET status = 'approved' WHERE id = ?`).bind(id).run();
  return ok({ id, status: "approved" });
}
