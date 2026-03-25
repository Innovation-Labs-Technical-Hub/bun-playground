import { tenantMetadataRepository } from "../repositories/tenant-metadata.repository.ts";
import { tenantService } from "./tenant.service.ts";

export const tenantMetadataService = {
  async listByTenant(tenantId: string) {
    await tenantService.getById(tenantId);
    return tenantMetadataRepository.findByTenantId(tenantId);
  },

  async getByKey(tenantId: string, key: string) {
    await tenantService.getById(tenantId);
    const metadata = await tenantMetadataRepository.findByKey(tenantId, key);
    if (!metadata) {
      throw new Error("METADATA_NOT_FOUND");
    }
    return metadata;
  },

  async upsert(tenantId: string, key: string, value: string) {
    await tenantService.getById(tenantId);
    return tenantMetadataRepository.upsert(tenantId, key, value);
  },

  async deleteByKey(tenantId: string, key: string) {
    await tenantService.getById(tenantId);
    return tenantMetadataRepository.deleteByKey(tenantId, key);
  },
};
