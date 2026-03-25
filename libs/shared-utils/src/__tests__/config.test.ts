import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { loadServiceConfig, loadKafkaConfig, loadRedisConfig } from "../config.ts";

describe("loadServiceConfig", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("returns defaults when no env vars set", () => {
    delete process.env.SERVICE_NAME;
    delete process.env.PORT;
    delete process.env.HOST;
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;

    const config = loadServiceConfig();
    expect(config.name).toBe("unknown");
    expect(config.port).toBe(3000);
    expect(config.host).toBe("0.0.0.0");
    expect(config.environment).toBe("development");
    expect(config.logLevel).toBe("info");
  });

  test("reads from environment variables", () => {
    process.env.SERVICE_NAME = "my-svc";
    process.env.PORT = "4000";
    process.env.HOST = "127.0.0.1";
    process.env.NODE_ENV = "production";
    process.env.LOG_LEVEL = "error";

    const config = loadServiceConfig();
    expect(config.name).toBe("my-svc");
    expect(config.port).toBe(4000);
    expect(config.host).toBe("127.0.0.1");
    expect(config.environment).toBe("production");
    expect(config.logLevel).toBe("error");
  });

  test("applies overrides on top of env vars", () => {
    process.env.SERVICE_NAME = "from-env";
    const config = loadServiceConfig({ name: "overridden", port: 9999 });
    expect(config.name).toBe("overridden");
    expect(config.port).toBe(9999);
  });
});

describe("loadKafkaConfig", () => {
  test("returns defaults", () => {
    const config = loadKafkaConfig();
    expect(config.brokers).toContain("localhost:9092");
    expect(config.clientId).toBeDefined();
  });

  test("splits comma-separated brokers", () => {
    process.env.KAFKA_BROKERS = "broker1:9092,broker2:9092";
    const config = loadKafkaConfig();
    expect(config.brokers).toEqual(["broker1:9092", "broker2:9092"]);
    delete process.env.KAFKA_BROKERS;
  });
});

describe("loadRedisConfig", () => {
  test("returns default redis URL", () => {
    const config = loadRedisConfig();
    expect(config.url).toBe("redis://localhost:6379");
  });

  test("accepts override", () => {
    const config = loadRedisConfig({ url: "redis://custom:6380" });
    expect(config.url).toBe("redis://custom:6380");
  });
});
