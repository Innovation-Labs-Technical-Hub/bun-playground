export const config = {
  port: Number(process.env.PORT) || 3002,
  serviceName: "auth-service",
  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:changeme@localhost:5432/auth_db?schema=public",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "super-secret-jwt-key-change-in-production",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
  logLevel: process.env.LOG_LEVEL || "info",
} as const;
