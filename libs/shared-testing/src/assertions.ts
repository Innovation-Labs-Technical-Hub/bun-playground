/**
 * Custom assertion helpers for testing HTTP responses.
 * Designed for use with bun:test's expect().
 */

import { expect } from "bun:test";
import type { ServiceResponse, PaginatedResponse } from "@bun-playground/shared-types";

/** Assert a Response is JSON with the expected status and return the parsed body. */
export async function assertJsonResponse<T = unknown>(
  response: Response,
  expectedStatus = 200,
): Promise<T> {
  expect(response.status).toBe(expectedStatus);
  expect(response.headers.get("content-type")).toContain("application/json");
  return (await response.json()) as T;
}

/** Assert a Response is a ServiceResponse error shape. */
export async function assertErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedCode?: string,
): Promise<ServiceResponse> {
  const body = await assertJsonResponse<ServiceResponse>(response, expectedStatus);
  expect(body.success).toBe(false);
  expect(body.error).toBeDefined();
  if (expectedCode) {
    expect(body.error!.code).toBe(expectedCode);
  }
  return body;
}

/** Assert a Response matches the PaginatedResponse shape. */
export async function assertPaginatedResponse<T = unknown>(
  response: Response,
): Promise<PaginatedResponse<T>> {
  const body = await assertJsonResponse<PaginatedResponse<T>>(response, 200);
  expect(body.success).toBe(true);
  expect(body.pagination).toBeDefined();
  expect(typeof body.pagination.page).toBe("number");
  expect(typeof body.pagination.limit).toBe("number");
  expect(typeof body.pagination.total).toBe("number");
  expect(typeof body.pagination.totalPages).toBe("number");
  return body;
}
