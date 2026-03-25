import type { Context, Next } from "hono";

export async function requestId(c: Context, next: Next) {
  const id = c.req.header("x-request-id") || crypto.randomUUID();
  c.header("X-Request-Id", id);
  await next();
}
