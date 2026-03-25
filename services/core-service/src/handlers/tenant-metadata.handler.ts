import type { Context } from "hono";
import { tenantMetadataService } from "../services/tenant-metadata.service.ts";
import { success, error } from "../utils/response.ts";
import type { UpsertMetadataRequest } from "../models/tenant.model.ts";

export const tenantMetadataHandler = {
  async list(c: Context) {
    const tenantId = c.req.param("tenantId");
    const metadata = await tenantMetadataService.listByTenant(tenantId);
    return success(c, metadata);
  },

  async getByKey(c: Context) {
    const tenantId = c.req.param("tenantId");
    const key = c.req.param("key");
    const metadata = await tenantMetadataService.getByKey(tenantId, key);
    return success(c, metadata);
  },

  async upsert(c: Context) {
    const tenantId = c.req.param("tenantId");
    const key = c.req.param("key");
    const body = await c.req.json<UpsertMetadataRequest>();

    if (!body.value) return error(c, "Value is required", 422);

    const metadata = await tenantMetadataService.upsert(tenantId, key, body.value);
    return success(c, metadata);
  },

  async deleteByKey(c: Context) {
    const tenantId = c.req.param("tenantId");
    const key = c.req.param("key");
    await tenantMetadataService.deleteByKey(tenantId, key);
    return success(c, { message: "Metadata deleted" });
  },
};
