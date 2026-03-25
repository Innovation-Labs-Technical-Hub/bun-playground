import type { ServiceConfig, KafkaConfig, RedisConfig } from "@bun-playground/shared-types";

export function loadServiceConfig(overrides?: Partial<ServiceConfig>): ServiceConfig {
  return {
    name: process.env.SERVICE_NAME ?? "unknown",
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
    environment: (process.env.NODE_ENV as ServiceConfig["environment"]) ?? "development",
    logLevel: (process.env.LOG_LEVEL as ServiceConfig["logLevel"]) ?? "info",
    ...overrides,
  };
}

export function loadKafkaConfig(overrides?: Partial<KafkaConfig>): KafkaConfig {
  return {
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
    clientId: process.env.KAFKA_CLIENT_ID ?? process.env.SERVICE_NAME ?? "unknown",
    groupId: process.env.KAFKA_GROUP_ID,
    ...overrides,
  };
}

export function loadRedisConfig(overrides?: Partial<RedisConfig>): RedisConfig {
  return {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
    ...overrides,
  };
}
