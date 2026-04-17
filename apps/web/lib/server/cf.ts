import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareEnv } from "./env";

/**
 * Unified helper for accessing Cloudflare bindings from Next.js route handlers.
 * Uses the async form of getCloudflareContext which works even outside of
 * a pre-initialized request context (e.g. during early route boot).
 */
export async function cfEnv(): Promise<CloudflareEnv> {
  const ctx = await getCloudflareContext({ async: true });
  return ctx.env as unknown as CloudflareEnv;
}
