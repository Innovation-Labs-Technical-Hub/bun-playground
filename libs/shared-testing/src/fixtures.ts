/**
 * Reusable test fixture factories.
 * Each factory returns a valid object with sensible defaults that can be overridden.
 */

import type { ServiceConfig } from "@bun-playground/shared-types";

interface TestUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TestTenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  plan: "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  createdAt: string;
  updatedAt: string;
}

interface TestSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

let fixtureCounter = 0;
function nextId(): string {
  fixtureCounter++;
  return `test-${fixtureCounter.toString().padStart(4, "0")}`;
}

/** Reset the fixture counter between test suites if needed. */
export function resetFixtures() {
  fixtureCounter = 0;
}

export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const id = nextId();
  return {
    id,
    email: `user-${id}@test.local`,
    name: `Test User ${id}`,
    role: "user",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestTenant(overrides: Partial<TestTenant> = {}): TestTenant {
  const id = nextId();
  return {
    id,
    name: `Tenant ${id}`,
    slug: `tenant-${id}`,
    domain: null,
    status: "ACTIVE",
    plan: "FREE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestSession(overrides: Partial<TestSession> = {}): TestSession {
  const id = nextId();
  return {
    id,
    userId: nextId(),
    token: `tok_${id}`,
    refreshToken: `ref_${id}`,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    ipAddress: "127.0.0.1",
    userAgent: "test-agent/1.0",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createTestServiceConfig(overrides: Partial<ServiceConfig> = {}): ServiceConfig {
  return {
    name: "test-service",
    port: 3099,
    host: "127.0.0.1",
    environment: "development",
    logLevel: "debug",
    ...overrides,
  };
}
