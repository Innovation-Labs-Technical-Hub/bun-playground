import type { Context } from "hono";
import { tenantService } from "../services/tenant.service.ts";
import { success, paginated, error } from "../utils/response.ts";
import type { CreateTenantRequest, UpdateTenantRequest, TenantListQuery } from "../models/tenant.model.ts";

export const tenantHandler = {
  async create(c: Context) {
    const body = await c.req.json<CreateTenantRequest>();
    if (!body.name) return error(c, "Name is required", 422);

    const tenant = await tenantService.create(body);
    return success(c, tenant, 201);
  },

  async list(c: Context) {
    const query: TenantListQuery = {
      page: c.req.query("page"),
      limit: c.req.query("limit"),
      search: c.req.query("search"),
      status: c.req.query("status") as any,
      plan: c.req.query("plan") as any,
    };

    const result = await tenantService.list(query);
    return paginated(c, result.data, result.meta);
  },

  async getById(c: Context) {
    const id = c.req.param("id");
    const tenant = await tenantService.getById(id);
    return success(c, tenant);
  },

  async update(c: Context) {
    const id = c.req.param("id");
    const body = await c.req.json<UpdateTenantRequest>();
    const tenant = await tenantService.update(id, body);
    return success(c, tenant);
  },

  async deactivate(c: Context) {
    const id = c.req.param("id");
    const tenant = await tenantService.deactivate(id);
    return success(c, tenant);
  },
};
