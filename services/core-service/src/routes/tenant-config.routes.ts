import { Hono } from "hono";
import { tenantConfigHandler } from "../handlers/tenant-config.handler.ts";

export const tenantConfigRoutes = new Hono()
  .get("/", (c) => tenantConfigHandler.list(c))
  .get("/:key", (c) => tenantConfigHandler.getByKey(c))
  .put("/:key", (c) => tenantConfigHandler.upsert(c))
  .delete("/:key", (c) => tenantConfigHandler.deleteByKey(c));
