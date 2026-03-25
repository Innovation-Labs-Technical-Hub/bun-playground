import { Hono } from "hono";
import { tenantMetadataHandler } from "../handlers/tenant-metadata.handler.ts";

export const tenantMetadataRoutes = new Hono()
  .get("/", (c) => tenantMetadataHandler.list(c))
  .get("/:key", (c) => tenantMetadataHandler.getByKey(c))
  .put("/:key", (c) => tenantMetadataHandler.upsert(c))
  .delete("/:key", (c) => tenantMetadataHandler.deleteByKey(c));
