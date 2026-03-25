import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    switch (message) {
      case "TENANT_NOT_FOUND":
        return c.json({ success: false, error: "Tenant not found" }, 404);
      case "SLUG_ALREADY_EXISTS":
        return c.json({ success: false, error: "Slug already in use" }, 409);
      case "CONFIG_NOT_FOUND":
        return c.json({ success: false, error: "Config not found" }, 404);
      case "METADATA_NOT_FOUND":
        return c.json({ success: false, error: "Metadata not found" }, 404);
    }

    // Prisma not found
    if (message.includes("Record to") && message.includes("not found")) {
      return c.json({ success: false, error: "Resource not found" }, 404);
    }

    console.error(`[core-service] Unhandled error:`, err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
}
