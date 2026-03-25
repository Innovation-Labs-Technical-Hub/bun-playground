import { createLogger, handleError, getRequestId, corsHeaders, handleCorsPreFlight } from "@bun-playground/shared-utils";
import { serviceConfig } from "./config.ts";
import { userRoutes } from "./routes/user.routes.ts";
import { healthCheck, readinessCheck } from "./health.ts";

const logger = createLogger(serviceConfig.name, serviceConfig.logLevel);

const server = Bun.serve({
  port: serviceConfig.port,
  hostname: serviceConfig.host,

  routes: {
    "/health": { GET: healthCheck },
    "/ready": { GET: readinessCheck },
    ...userRoutes,
  },

  fetch(req) {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return handleCorsPreFlight();
    }

    // Fallback for unmatched routes
    return Response.json({ error: "Not Found" }, { status: 404 });
  },

  error(error) {
    logger.error("Unhandled server error", { error: String(error) });
    return handleError(error, serviceConfig.name);
  },
});

logger.info(`${serviceConfig.name} running`, {
  url: `http://${serviceConfig.host}:${serviceConfig.port}`,
  environment: serviceConfig.environment,
});
