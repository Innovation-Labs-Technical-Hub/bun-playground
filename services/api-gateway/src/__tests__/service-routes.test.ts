import { test, expect, describe } from "bun:test";
import { findServiceForPath, getRouteMappings } from "../routes/service-routes.ts";

describe("getRouteMappings", () => {
  test("returns an array of route mappings", () => {
    const mappings = getRouteMappings();
    expect(Array.isArray(mappings)).toBe(true);
    expect(mappings.length).toBeGreaterThan(0);
  });

  test("each mapping has required fields", () => {
    const mappings = getRouteMappings();
    for (const mapping of mappings) {
      expect(mapping.prefix).toBeDefined();
      expect(mapping.serviceUrl).toBeDefined();
      expect(mapping.prefix.startsWith("/")).toBe(true);
    }
  });
});

describe("findServiceForPath", () => {
  test("finds service for /api/users path", () => {
    const route = findServiceForPath("/api/users");
    expect(route).toBeDefined();
    expect(route!.prefix).toBe("/api/users");
  });

  test("finds service for nested user paths", () => {
    const route = findServiceForPath("/api/users/123");
    expect(route).toBeDefined();
  });

  test("returns undefined for unknown paths", () => {
    const route = findServiceForPath("/unknown/path");
    expect(route).toBeUndefined();
  });

  test("returns undefined for root path", () => {
    const route = findServiceForPath("/");
    expect(route).toBeUndefined();
  });
});
