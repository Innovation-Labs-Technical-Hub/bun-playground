import { prisma } from "../prisma.ts";
import type { Prisma } from "@prisma/client";

export const tenantConfigRepository = {
  async findByTenantId(tenantId: string) {
    return prisma.tenantConfig.findMany({
      where: { tenantId },
      orderBy: { key: "asc" },
    });
  },

  async findByKey(tenantId: string, key: string) {
    return prisma.tenantConfig.findUnique({
      where: { tenantId_key: { tenantId, key } },
    });
  },

  async upsert(tenantId: string, key: string, value: Prisma.InputJsonValue, description?: string) {
    return prisma.tenantConfig.upsert({
      where: { tenantId_key: { tenantId, key } },
      create: { tenantId, key, value, description },
      update: { value, description },
    });
  },

  async deleteByKey(tenantId: string, key: string) {
    return prisma.tenantConfig.delete({
      where: { tenantId_key: { tenantId, key } },
    });
  },
};
