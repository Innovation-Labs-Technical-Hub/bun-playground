import { serviceConfig } from "./config.ts";

export function healthCheck(): Response {
  return Response.json({
    status: "ok",
    service: serviceConfig.name,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export function readinessCheck(): Response {
  // Add checks for DB, Kafka, Redis connectivity here
  return Response.json({
    status: "ready",
    service: serviceConfig.name,
    timestamp: new Date().toISOString(),
  });
}
