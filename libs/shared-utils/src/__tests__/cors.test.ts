import { test, expect, describe } from "bun:test";
import { corsHeaders, handleCorsPreFlight } from "../middleware/cors.ts";

describe("corsHeaders", () => {
  test("returns default CORS headers", () => {
    const headers = corsHeaders();
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(headers["Access-Control-Allow-Methods"]).toContain("GET");
    expect(headers["Access-Control-Allow-Methods"]).toContain("POST");
    expect(headers["Access-Control-Allow-Headers"]).toContain("Authorization");
  });

  test("allows custom origins", () => {
    const headers = corsHeaders({ origins: ["https://example.com"] });
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://example.com");
  });

  test("includes credentials header when enabled", () => {
    const headers = corsHeaders({ credentials: true });
    expect(headers["Access-Control-Allow-Credentials"]).toBe("true");
  });

  test("excludes credentials header when disabled", () => {
    const headers = corsHeaders({ credentials: false });
    expect(headers["Access-Control-Allow-Credentials"]).toBeUndefined();
  });
});

describe("handleCorsPreFlight", () => {
  test("returns 204 response", () => {
    const response = handleCorsPreFlight();
    expect(response.status).toBe(204);
  });

  test("sets CORS headers on response", () => {
    const response = handleCorsPreFlight();
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toContain("GET");
  });
});
