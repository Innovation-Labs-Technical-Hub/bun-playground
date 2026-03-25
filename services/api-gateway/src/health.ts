import { serviceConfig, serviceRegistry } from "./config.ts";

export function healthCheck(): Response {
  return Response.json({
    status: "ok",
    service: serviceConfig.name,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

export async function readinessCheck(): Promise<Response> {
  const checks = await Promise.allSettled(
    serviceRegistry.map(async (svc) => {
      const res = await fetch(`${svc.url}${svc.healthCheck}`, {
        signal: AbortSignal.timeout(2000),
      });
      return { name: svc.name, status: res.ok ? "healthy" : "unhealthy" };
    }),
  );

  const services = checks.map((result, i) => {
    if (result.status === "fulfilled") return result.value;
    return { name: serviceRegistry[i]!.name, status: "unhealthy" };
  });

  const allHealthy = services.every((s) => s.status === "healthy");

  return Response.json(
    {
      status: allHealthy ? "ready" : "degraded",
      service: serviceConfig.name,
      timestamp: new Date().toISOString(),
      dependencies: services,
    },
    { status: allHealthy ? 200 : 503 },
  );
}
