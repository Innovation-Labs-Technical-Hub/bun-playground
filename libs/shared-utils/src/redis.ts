import { createLogger } from "./logger.ts";

const logger = createLogger("redis");

let redisClient: ReturnType<typeof createRedisClient> | null = null;

function createRedisClient(url: string) {
  // Using Bun's built-in Redis client
  return new Bun.RedisClient(url);
}

export function getRedisClient(url?: string): ReturnType<typeof createRedisClient> {
  if (redisClient) return redisClient;

  const redisUrl = url ?? process.env.REDIS_URL ?? "redis://localhost:6379";
  redisClient = createRedisClient(redisUrl);
  logger.info("Redis client created", { url: redisUrl.replace(/\/\/.*@/, "//***@") });

  return redisClient;
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedisClient();
  return client.get(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  const client = getRedisClient();
  if (ttlSeconds) {
    await client.set(key, value, { EX: ttlSeconds });
  } else {
    await client.set(key, value);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  const client = getRedisClient();
  await client.del(key);
}
