import type { CloudflareEnv } from "./env";
import { sha256Hex } from "./hash";

export async function isAdmin(env: CloudflareEnv, request: Request): Promise<boolean> {
  if (!env.ADMIN_TOKEN) return false;
  const sig = await sha256Hex(`${env.ADMIN_TOKEN}:session`);
  const cookie = request.headers.get("Cookie") || "";
  return cookie.includes(`ch_admin=${sig}`);
}
