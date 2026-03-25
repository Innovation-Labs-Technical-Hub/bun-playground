import { Hono } from "hono";
import { config } from "../config.ts";
import { prisma } from "../prisma.ts";

export const healthRoutes = new Hono().get("/health", async (c) => {
  let dbStatus = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  return c.json({
    status: dbStatus === "ok" ? "ok" : "degraded",
    service: config.serviceName,
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});
