import { loadServiceConfig, loadRedisConfig } from "@bun-playground/shared-utils";
import type { ServiceRegistryEntry } from "@bun-playground/shared-types";

export const serviceConfig = loadServiceConfig({
  name: "api-gateway",
  port: Number(process.env.PORT ?? 3000),
});

export const redisConfig = loadRedisConfig();

export const serviceRegistry: ServiceRegistryEntry[] = [
  {
    name: "user-service",
    url: process.env.USER_SERVICE_URL ?? "http://localhost:3001",
    healthCheck: "/health",
  },
];

export const rateLimitConfig = {
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 100),
};
