import { loadServiceConfig, loadKafkaConfig, loadRedisConfig } from "@bun-playground/shared-utils";

export const serviceConfig = loadServiceConfig({
  name: "user-service",
  port: Number(process.env.PORT ?? 3001),
});

export const kafkaConfig = loadKafkaConfig({
  clientId: "user-service",
  groupId: "user-service-group",
});

export const redisConfig = loadRedisConfig();
