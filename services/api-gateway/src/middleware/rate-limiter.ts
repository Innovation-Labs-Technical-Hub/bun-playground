import { rateLimitConfig } from "../config.ts";

// In-memory rate limiter (use Redis in production for distributed rate limiting)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = requestCounts.get(clientIp);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + rateLimitConfig.windowMs;
    requestCounts.set(clientIp, { count: 1, resetAt });
    return { allowed: true, remaining: rateLimitConfig.maxRequests - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, rateLimitConfig.maxRequests - entry.count);

  return {
    allowed: entry.count <= rateLimitConfig.maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of requestCounts) {
    if (now > entry.resetAt) {
      requestCounts.delete(key);
    }
  }
}, 60_000);
