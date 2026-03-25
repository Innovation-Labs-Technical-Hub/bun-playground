import { test, expect, describe } from "bun:test";
import type {
  ServiceResponse,
  PaginatedResponse,
  PaginationMeta,
  ServiceConfig,
  BaseEntity,
} from "../index.ts";

describe("ServiceResponse type", () => {
  test("success response shape", () => {
    const response: ServiceResponse<{ id: string }> = {
      success: true,
      data: { id: "123" },
      meta: {
        requestId: "req-1",
        timestamp: new Date().toISOString(),
        service: "test",
      },
    };

    expect(response.success).toBe(true);
    expect(response.data?.id).toBe("123");
    expect(response.error).toBeUndefined();
  });

  test("error response shape", () => {
    const response: ServiceResponse = {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    };

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe("NOT_FOUND");
  });
});

describe("PaginatedResponse type", () => {
  test("paginated response shape", () => {
    const response: PaginatedResponse<string> = {
      success: true,
      data: ["a", "b", "c"],
      pagination: {
        page: 1,
        limit: 20,
        total: 3,
        totalPages: 1,
      },
    };

    expect(response.data).toHaveLength(3);
    expect(response.pagination.totalPages).toBe(1);
  });
});

describe("BaseEntity type", () => {
  test("base entity shape", () => {
    const entity: BaseEntity = {
      id: "abc-123",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
    };

    expect(entity.id).toBe("abc-123");
    expect(entity.createdAt).toMatch(/^\d{4}-/);
  });
});
