import { prisma } from "../prisma.ts";

export const tenantMetadataRepository = {
  async findByTenantId(tenantId: string) {
    return prisma.tenantMetadata.findMany({
      where: { tenantId },
      orderBy: { key: "asc" },
    });
  },

  async findByKey(tenantId: string, key: string) {
    return prisma.tenantMetadata.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });
  },

  async upsert(tenantId: string, key: string, value: string) {
    return prisma.tenantMetadata.upsert({
      where: { tenantId_key: { tenantId, key } },
      create: { tenantId, key, value },
      update: { value },
    });
  },

  async deleteByKey(tenantId: string, key: string) {
    return prisma.tenantMetadata.delete({
      where: { tenantId_key: { tenantId, key } },
    });
  },
};
