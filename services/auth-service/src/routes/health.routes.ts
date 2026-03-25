import Elysia from "elysia";
import { config } from "../config.ts";
import { prisma } from "../prisma.ts";

export const healthRoutes = new Elysia()
  .get("/health", async () => {
    let dbStatus = "ok";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    return {
      status: dbStatus === "ok" ? "ok" : "degraded",
      service: config.serviceName,
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };
  });
