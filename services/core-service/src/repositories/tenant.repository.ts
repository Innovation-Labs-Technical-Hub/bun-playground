import { prisma } from "../prisma.ts";
import type { TenantStatus, TenantPlan, Prisma } from "@prisma/client";

export const tenantRepository = {
  async create(data: {
    name: string;
    slug: string;
    domain?: string;
    plan?: TenantPlan;
  }) {
    return prisma.tenant.create({ data });
  },

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: { configs: true, metadata: true },
    });
  },

  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  },

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    status?: TenantStatus;
    plan?: TenantPlan;
  }) {
    const where: Prisma.TenantWhereInput = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { slug: { contains: params.search, mode: "insensitive" } },
      ];
    }
    if (params.status) where.status = params.status;
    if (params.plan) where.plan = params.plan;

    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tenant.count({ where }),
    ]);

    return { data, total };
  },

  async update(id: string, data: Partial<{
    name: string;
    slug: string;
    domain: string | null;
    status: TenantStatus;
    plan: TenantPlan;
  }>) {
    return prisma.tenant.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.tenant.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
  },
};
