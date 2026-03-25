import Elysia, { t } from "elysia";
import { authHandler } from "../handlers/auth.handler.ts";
import { authenticate } from "../middleware/authenticate.ts";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post(
    "/register",
    (ctx) => authHandler.register(ctx as any),
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        firstName: t.String({ minLength: 1 }),
        lastName: t.String({ minLength: 1 }),
      }),
    }
  )
  .post(
    "/login",
    (ctx) => authHandler.login(ctx as any),
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  .post(
    "/refresh",
    (ctx) => authHandler.refresh(ctx as any),
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    }
  )
  .use(authenticate)
  .post("/logout", (ctx) => authHandler.logout(ctx as any))
  .get("/me", (ctx) => authHandler.me(ctx as any));
