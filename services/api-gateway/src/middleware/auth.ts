import { HttpStatus } from "@bun-playground/shared-types";
import { createErrorResponse } from "@bun-playground/shared-utils";

const SERVICE = "api-gateway";

// Paths that don't require authentication
const PUBLIC_PATHS = ["/health", "/ready", "/api/users"];

export function requireAuth(req: Request, requestId: string): Response | null {
  const path = new URL(req.url).pathname;

  // Skip auth for public paths
  if (PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"))) {
    return null;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return createErrorResponse(
      HttpStatus.UNAUTHORIZED,
      "UNAUTHORIZED",
      "Missing or invalid authorization header",
      SERVICE,
      requestId,
    );
  }

  // TODO: Validate JWT token here
  // For now, just check that a token is present
  return null;
}
