import { test, expect, describe } from "bun:test";
import {
  createTestUser,
  createTestTenant,
  createTestSession,
  createTestServiceConfig,
} from "../fixtures.ts";

describe("createTestUser", () => {
  test("returns user with all required fields", () => {
    const user = createTestUser();
    expect(user.id).toBeDefined();
    expect(user.email).toContain("@test.local");
    expect(user.name).toBeDefined();
    expect(user.role).toBe("user");
    expect(user.active).toBe(true);
    expect(user.createdAt).toBeDefined();
  });

  test("accepts overrides", () => {
    const user = createTestUser({ role: "admin", active: false });
    expect(user.role).toBe("admin");
    expect(user.active).toBe(false);
  });

  test("generates unique ids", () => {
    const a = createTestUser();
    const b = createTestUser();
    expect(a.id).not.toBe(b.id);
  });
});

describe("createTestTenant", () => {
  test("returns tenant with all required fields", () => {
    const tenant = createTestTenant();
    expect(tenant.id).toBeDefined();
    expect(tenant.name).toBeDefined();
    expect(tenant.slug).toBeDefined();
    expect(tenant.status).toBe("ACTIVE");
    expect(tenant.plan).toBe("FREE");
  });

  test("accepts overrides", () => {
    const tenant = createTestTenant({ plan: "ENTERPRISE", status: "SUSPENDED" });
    expect(tenant.plan).toBe("ENTERPRISE");
    expect(tenant.status).toBe("SUSPENDED");
  });
});

describe("createTestSession", () => {
  test("returns session with valid expiry", () => {
    const session = createTestSession();
    expect(session.token).toBeDefined();
    expect(session.refreshToken).toBeDefined();
    expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});

describe("createTestServiceConfig", () => {
  test("returns valid config with defaults", () => {
    const config = createTestServiceConfig();
    expect(config.name).toBe("test-service");
    expect(config.port).toBe(3099);
    expect(config.environment).toBe("development");
  });

  test("accepts overrides", () => {
    const config = createTestServiceConfig({ name: "my-svc", port: 8080 });
    expect(config.name).toBe("my-svc");
    expect(config.port).toBe(8080);
  });
});
