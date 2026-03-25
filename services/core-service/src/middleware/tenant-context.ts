import type { Context, Next } from "hono";

export async function tenantContext(c: Context, next: Next) {
  const tenantId = c.req.header("x-tenant-id");
  if (tenantId) {
    c.set("tenantId", tenantId);
  }
  await next();
}
