import { Hono } from "hono";
import { tenantHandler } from "../handlers/tenant.handler.ts";

export const tenantRoutes = new Hono()
  .post("/", (c) => tenantHandler.create(c))
  .get("/", (c) => tenantHandler.list(c))
  .get("/:id", (c) => tenantHandler.getById(c))
  .patch("/:id", (c) => tenantHandler.update(c))
  .delete("/:id", (c) => tenantHandler.deactivate(c));
