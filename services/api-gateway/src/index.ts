import {
  createLogger,
  handleError,
  getRequestId,
  withRequestId,
  corsHeaders,
  handleCorsPreFlight,
} from "@bun-playground/shared-utils";
import { HttpStatus } from "@bun-playground/shared-types";
import { serviceConfig } from "./config.ts";
import { healthCheck, readinessCheck } from "./health.ts";
import { findServiceForPath } from "./routes/service-routes.ts";
import { checkRateLimit } from "./middleware/rate-limiter.ts";
import { requireAuth } from "./middleware/auth.ts";

const logger = createLogger(serviceConfig.name, serviceConfig.logLevel);

async function proxyRequest(req: Request, serviceUrl: string, path: string, requestId: string): Promise<Response> {
  const targetUrl = `${serviceUrl}${path}`;
  const headers = new Headers(req.headers);
  headers.set("x-request-id", requestId);
  headers.set("x-forwarded-for", req.headers.get("x-forwarded-for") ?? "unknown");
  headers.set("x-forwarded-host", new URL(req.url).host);

  const proxyRes = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: req.body,
    signal: AbortSignal.timeout(10_000),
  });

  const response = new Response(proxyRes.body, {
    status: proxyRes.status,
    headers: proxyRes.headers,
  });

  // Add CORS and request ID headers
  for (const [k, v] of Object.entries(corsHeaders())) {
    response.headers.set(k, v);
  }
  response.headers.set("x-request-id", requestId);

  return response;
}

const server = Bun.serve({
  port: serviceConfig.port,
  hostname: serviceConfig.host,

  routes: {
    "/health": { GET: healthCheck },
    "/ready": { GET: () => readinessCheck() },
  },

  async fetch(req) {
    const requestId = getRequestId(req);
    const url = new URL(req.url);
    const start = performance.now();

    // CORS preflight
    if (req.method === "OPTIONS") {
      return handleCorsPreFlight();
    }

    // Rate limiting
    const clientIp = req.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      logger.warn("Rate limit exceeded", { clientIp, requestId });
      return Response.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    // Auth check
    const authResponse = requireAuth(req, requestId);
    if (authResponse) return authResponse;

    // Route to service
    const route = findServiceForPath(url.pathname);
    if (!route) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "Route not found" } },
        { status: 404 },
      );
    }

    try {
      const path = route.stripPrefix ? url.pathname.replace(route.prefix, "") || "/" : url.pathname;
      const fullPath = path + url.search;
      const response = await proxyRequest(req, route.serviceUrl, fullPath, requestId);

      logger.info("Request proxied", {
        method: req.method,
        path: url.pathname,
        target: route.serviceUrl,
        status: response.status,
        durationMs: Math.round(performance.now() - start),
        requestId,
      });

      return response;
    } catch (error) {
      logger.error("Proxy error", {
        path: url.pathname,
        target: route.serviceUrl,
        error: String(error),
        requestId,
      });

      return Response.json(
        { success: false, error: { code: "BAD_GATEWAY", message: "Service unavailable" } },
        { status: HttpStatus.BAD_GATEWAY },
      );
    }
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
