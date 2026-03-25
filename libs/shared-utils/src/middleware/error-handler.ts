import { HttpStatus } from "@bun-playground/shared-types";
import type { ServiceResponse } from "@bun-playground/shared-types";

export function createErrorResponse(
  status: HttpStatus,
  code: string,
  message: string,
  service: string,
  requestId?: string,
): Response {
  const body: ServiceResponse = {
    success: false,
    error: { code, message },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      service,
    },
  };

  return Response.json(body, { status });
}

export function handleError(error: unknown, service: string, requestId?: string): Response {
  console.error("Unhandled error:", error);

  return createErrorResponse(
    HttpStatus.INTERNAL_SERVER_ERROR,
    "INTERNAL_ERROR",
    "An unexpected error occurred",
    service,
    requestId,
  );
}
