import { tenantRepository } from "../repositories/tenant.repository.ts";
import type { CreateTenantRequest, UpdateTenantRequest, TenantListQuery } from "../models/tenant.model.ts";
import { slugify } from "../models/tenant.model.ts";
import type { TenantStatus, TenantPlan } from "@prisma/client";

export const tenantService = {
  async create(data: CreateTenantRequest) {
    const slug = data.slug || slugify(data.name);

    const existing = await tenantRepository.findBySlug(slug);
    if (existing) {
      throw new Error("SLUG_ALREADY_EXISTS");
    }

    return tenantRepository.create({
      name: data.name,
      slug,
      domain: data.domain,
      plan: data.plan,
    });
  },

  async getById(id: string) {
    const tenant = await tenantRepository.findById(id);
    if (!tenant) {
      throw new Error("TENANT_NOT_FOUND");
    }
    return tenant;
  },

  async list(query: TenantListQuery) {
    const page = Math.max(1, parseInt(query.page || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "20")));

    const result = await tenantRepository.list({
      page,
      limit,
      search: query.search,
      status: query.status as TenantStatus | undefined,
      plan: query.plan as TenantPlan | undefined,
    });

    return {
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  },

  async update(id: string, data: UpdateTenantRequest) {
    await this.getById(id); // ensure exists

    if (data.slug) {
      const existing = await tenantRepository.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw new Error("SLUG_ALREADY_EXISTS");
      }
    }

    return tenantRepository.update(id, data as any);
  },

  async deactivate(id: string) {
    await this.getById(id); // ensure exists
    return tenantRepository.softDelete(id);
  },
};
