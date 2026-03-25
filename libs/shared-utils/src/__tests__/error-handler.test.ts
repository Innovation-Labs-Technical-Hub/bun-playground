import { test, expect, describe, spyOn } from "bun:test";
import { HttpStatus } from "@bun-playground/shared-types";
import { createErrorResponse, handleError } from "../middleware/error-handler.ts";

describe("createErrorResponse", () => {
  test("returns JSON response with error shape", async () => {
    const response = createErrorResponse(
      HttpStatus.NOT_FOUND,
      "NOT_FOUND",
      "User not found",
      "test-service",
      "req-123",
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBe("User not found");
    expect(body.meta.service).toBe("test-service");
    expect(body.meta.requestId).toBe("req-123");
    expect(body.meta.timestamp).toBeDefined();
  });

  test("works without requestId", async () => {
    const response = createErrorResponse(
      HttpStatus.BAD_REQUEST,
      "VALIDATION",
      "Invalid input",
      "svc",
    );

    const body = await response.json();
    expect(body.meta.requestId).toBeUndefined();
  });
});

describe("handleError", () => {
  test("returns 500 response for unknown errors", async () => {
    spyOn(console, "error").mockImplementation(() => {});
    const response = handleError(new Error("boom"), "test-svc", "req-1");

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});
