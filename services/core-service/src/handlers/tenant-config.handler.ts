import type { Context } from "hono";
import { tenantConfigService } from "../services/tenant-config.service.ts";
import { success, error } from "../utils/response.ts";
import type { UpsertConfigRequest } from "../models/tenant.model.ts";

export const tenantConfigHandler = {
  async list(c: Context) {
    const tenantId = c.req.param("tenantId");
    const configs = await tenantConfigService.listByTenant(tenantId);
    return success(c, configs);
  },

  async getByKey(c: Context) {
    const tenantId = c.req.param("tenantId");
    const key = c.req.param("key");
    const config = await tenantConfigService.getByKey(tenantId, key);
    return success(c, config);
  },

  async upsert(c: Context) {
    const tenantId = c.req.param("tenantId");
    const key = c.req.param("key");
    const body = await c.req.json<UpsertConfigRequest>();

    if (body.value === undefined) return error(c, "Value is required", 422);

    const config = await tenantConfigService.upsert(tenantId, key, body.value as any, body.description);
    return success(c, config);
  },

  async deleteByKey(c: Context) {
    const tenantId = c.req.param("tenantId");
    const key = c.req.param("key");
    await tenantConfigService.deleteByKey(tenantId, key);
    return success(c, { message: "Config deleted" });
  },
};
