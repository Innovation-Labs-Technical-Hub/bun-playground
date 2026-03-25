import { test, expect, describe } from "bun:test";
import { checkRateLimit } from "../middleware/rate-limiter.ts";

describe("checkRateLimit", () => {
  test("allows first request from a new client", () => {
    const result = checkRateLimit("test-ip-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });

  test("decrements remaining count on subsequent requests", () => {
    const ip = "test-ip-counter";
    const first = checkRateLimit(ip);
    const second = checkRateLimit(ip);
    expect(second.remaining).toBe(first.remaining - 1);
  });

  test("tracks different clients independently", () => {
    const resultA = checkRateLimit("client-a-unique");
    const resultB = checkRateLimit("client-b-unique");
    expect(resultA.remaining).toBe(resultB.remaining);
  });
});
