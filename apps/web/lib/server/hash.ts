const enc = new TextEncoder();

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashIp(ip: string, seed: string | undefined): Promise<string> {
  const day = new Date().toISOString().slice(0, 10);
  const salt = seed ? `${seed}:${day}` : `unsalted:${day}`;
  return (await sha256Hex(`${ip}|${salt}`)).slice(0, 32);
}

export async function hashUa(ua: string): Promise<string> {
  return (await sha256Hex(ua)).slice(0, 16);
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "0.0.0.0"
  );
}
