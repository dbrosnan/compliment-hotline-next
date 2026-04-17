import type {
  D1Database,
  R2Bucket,
  KVNamespace,
} from "@cloudflare/workers-types";

export interface CloudflareEnv {
  DB: D1Database;
  AUDIO: R2Bucket;
  RATE_LIMIT: KVNamespace;

  MAX_AUDIO_BYTES: string;
  MAX_AUDIO_DURATION_MS: string;
  MAX_MESSAGE_CHARS: string;
  MAX_NAME_CHARS: string;
  FEED_PAGE_SIZE: string;
  ALLOWED_MIME: string;

  ADMIN_TOKEN?: string;
  IP_HASH_SALT_SEED?: string;
}

export const asInt = (v: string | undefined, fallback: number): number => {
  if (v === undefined || v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
