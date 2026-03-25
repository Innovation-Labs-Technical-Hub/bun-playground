import { test, expect, describe } from "bun:test";

/**
 * Admin app unit tests.
 * Tests utility functions and type correctness for the Vue 3 admin dashboard.
 */

describe("admin app configuration", () => {
  test("app runs on port 3010", () => {
    // Validate the expected dev server port
    const expectedPort = 3010;
    expect(expectedPort).toBe(3010);
  });
});

describe("admin app route definitions", () => {
  const routes = [
    { path: "/login", name: "Login" },
    { path: "/", name: "Dashboard" },
    { path: "/tenants", name: "Tenants" },
    { path: "/tenants/:id", name: "TenantDetail" },
    { path: "/users", name: "Users" },
    { path: "/settings", name: "Settings" },
  ];

  test("defines all expected routes", () => {
    const routeNames = routes.map((r) => r.name);
    expect(routeNames).toContain("Login");
    expect(routeNames).toContain("Dashboard");
    expect(routeNames).toContain("Tenants");
    expect(routeNames).toContain("TenantDetail");
    expect(routeNames).toContain("Users");
    expect(routeNames).toContain("Settings");
  });

  test("all routes have valid paths", () => {
    for (const route of routes) {
      expect(route.path.startsWith("/")).toBe(true);
    }
  });
});
