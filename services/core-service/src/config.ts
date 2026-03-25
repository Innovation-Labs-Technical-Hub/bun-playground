export const config = {
  port: Number(process.env.PORT) || 3003,
  serviceName: "core-service",
  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:changeme@localhost:5432/core_db?schema=public",
  },
  logLevel: process.env.LOG_LEVEL || "info",
} as const;
