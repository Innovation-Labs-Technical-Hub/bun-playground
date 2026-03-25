import Elysia from "elysia";
import { sessionHandler } from "../handlers/session.handler.ts";
import { authenticate } from "../middleware/authenticate.ts";

export const sessionRoutes = new Elysia({ prefix: "/sessions" })
  .use(authenticate)
  .get("/", (ctx) => sessionHandler.listSessions(ctx as any))
  .delete("/:id", (ctx) => sessionHandler.revokeSession(ctx as any));
