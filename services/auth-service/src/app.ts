import Elysia from "elysia";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth.routes.ts";
import { sessionRoutes } from "./routes/session.routes.ts";
import { healthRoutes } from "./routes/health.routes.ts";

export const app = new Elysia()
  .use(cors())
  .onError(({ code, error, set }) => {
    const message = error.message;

    switch (message) {
      case "EMAIL_ALREADY_EXISTS":
        set.status = 409;
        return { success: false, error: "Email already registered" };
      case "INVALID_CREDENTIALS":
        set.status = 401;
        return { success: false, error: "Invalid email or password" };
      case "INVALID_REFRESH_TOKEN":
        set.status = 401;
        return { success: false, error: "Invalid or expired refresh token" };
      case "MISSING_TOKEN":
        set.status = 401;
        return { success: false, error: "Authentication required" };
      case "INVALID_TOKEN":
        set.status = 401;
        return { success: false, error: "Invalid or expired token" };
      case "FORBIDDEN":
        set.status = 403;
        return { success: false, error: "Insufficient permissions" };
    }

    if (code === "VALIDATION") {
      set.status = 422;
      return { success: false, error: "Validation failed", details: error.message };
    }

    console.error(`[auth-service] Unhandled error:`, error);
    set.status = 500;
    return { success: false, error: "Internal server error" };
  })
  .use(healthRoutes)
  .use(authRoutes)
  .use(sessionRoutes);
