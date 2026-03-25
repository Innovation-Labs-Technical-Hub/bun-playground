import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error-handler.ts";
import { requestId } from "./middleware/request-id.ts";
import { tenantContext } from "./middleware/tenant-context.ts";
import { healthRoutes } from "./routes/health.routes.ts";
import { tenantRoutes } from "./routes/tenant.routes.ts";
import { tenantConfigRoutes } from "./routes/tenant-config.routes.ts";
import { tenantMetadataRoutes } from "./routes/tenant-metadata.routes.ts";

export const app = new Hono();

// Global middleware
app.use("*", cors());
app.use("*", logger());
app.use("*", requestId);
app.use("*", tenantContext);
app.use("*", errorHandler);

// Health check (root level)
app.route("/", healthRoutes);

// API v1 routes
app.route("/api/v1/tenants", tenantRoutes);
app.route("/api/v1/tenants/:tenantId/configs", tenantConfigRoutes);
app.route("/api/v1/tenants/:tenantId/metadata", tenantMetadataRoutes);
