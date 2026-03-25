import { test, expect, describe } from "bun:test";
import { healthCheck } from "../health.ts";

describe("healthCheck", () => {
  test("returns 200 with status ok", async () => {
    const response = healthCheck();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("api-gateway");
    expect(body.timestamp).toBeDefined();
    expect(typeof body.uptime).toBe("number");
  });
});
