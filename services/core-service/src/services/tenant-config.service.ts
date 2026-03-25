import { tenantConfigRepository } from "../repositories/tenant-config.repository.ts";
import { tenantService } from "./tenant.service.ts";
import type { Prisma } from "@prisma/client";

export const tenantConfigService = {
  async listByTenant(tenantId: string) {
    await tenantService.getById(tenantId); // validate tenant exists
    return tenantConfigRepository.findByTenantId(tenantId);
  },

  async getByKey(tenantId: string, key: string) {
    await tenantService.getById(tenantId);
    const config = await tenantConfigRepository.findByKey(tenantId, key);
    if (!config) {
      throw new Error("CONFIG_NOT_FOUND");
    }
    return config;
  },

  async upsert(tenantId: string, key: string, value: Prisma.InputJsonValue, description?: string) {
    await tenantService.getById(tenantId);
    return tenantConfigRepository.upsert(tenantId, key, value, description);
  },

  async deleteByKey(tenantId: string, key: string) {
    await tenantService.getById(tenantId);
    return tenantConfigRepository.deleteByKey(tenantId, key);
  },
};
