type Ok<T> = { ok: true; data: T };
type Err = { ok: false; error: string };

export const ok = <T>(data: T, init: ResponseInit = {}): Response =>
  new Response(JSON.stringify({ ok: true, data } satisfies Ok<T>), {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });

export const err = (message: string, status = 400, extraHeaders: HeadersInit = {}): Response =>
  new Response(JSON.stringify({ ok: false, error: message } satisfies Err), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
