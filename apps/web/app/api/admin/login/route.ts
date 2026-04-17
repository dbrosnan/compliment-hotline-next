import { NextRequest } from "next/server";
import { cfEnv } from "@/lib/server/cf";
import { err, ok } from "@/lib/server/response";
import { sha256Hex } from "@/lib/server/hash";


export async function GET(request: NextRequest) {
  const env = await cfEnv();
  if (!env.ADMIN_TOKEN) return err("admin not configured", 503);
  const cookie = request.headers.get("Cookie") || "";
  const sig = await sha256Hex(`${env.ADMIN_TOKEN}:session`);
  const logged_in = cookie.includes(`ch_admin=${sig}`);
  return ok({ logged_in });
}

export async function POST(request: NextRequest) {
  const env = await cfEnv();
  if (!env.ADMIN_TOKEN) return err("admin not configured", 503);
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return err("invalid JSON", 400);
  }
  if (body.token !== env.ADMIN_TOKEN) return err("unauthorized", 401);

  const sig = await sha256Hex(`${env.ADMIN_TOKEN}:session`);
  const cookie = `ch_admin=${sig}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`;
  return ok({ logged_in: true }, { headers: { "Set-Cookie": cookie } });
}
