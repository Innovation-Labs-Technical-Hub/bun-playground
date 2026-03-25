import { test, expect, describe } from "bun:test";
import { HttpStatus, ServiceName } from "../index.ts";

describe("HttpStatus enum", () => {
  test("contains standard success codes", () => {
    expect(HttpStatus.OK).toBe(200);
    expect(HttpStatus.CREATED).toBe(201);
    expect(HttpStatus.NO_CONTENT).toBe(204);
  });

  test("contains standard client error codes", () => {
    expect(HttpStatus.BAD_REQUEST).toBe(400);
    expect(HttpStatus.UNAUTHORIZED).toBe(401);
    expect(HttpStatus.FORBIDDEN).toBe(403);
    expect(HttpStatus.NOT_FOUND).toBe(404);
    expect(HttpStatus.CONFLICT).toBe(409);
    expect(HttpStatus.UNPROCESSABLE_ENTITY).toBe(422);
  });

  test("contains standard server error codes", () => {
    expect(HttpStatus.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HttpStatus.BAD_GATEWAY).toBe(502);
    expect(HttpStatus.SERVICE_UNAVAILABLE).toBe(503);
    expect(HttpStatus.GATEWAY_TIMEOUT).toBe(504);
  });
});

describe("ServiceName enum", () => {
  test("lists all known services", () => {
    expect(ServiceName.API_GATEWAY).toBe("api-gateway");
    expect(ServiceName.USER_SERVICE).toBe("user-service");
    expect(ServiceName.AUTH_SERVICE).toBe("auth-service");
    expect(ServiceName.CORE_SERVICE).toBe("core-service");
  });

  test("has exactly 4 services", () => {
    const values = Object.values(ServiceName);
    expect(values).toHaveLength(4);
  });
});
