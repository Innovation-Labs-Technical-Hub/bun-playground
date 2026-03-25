import type { TenantStatus, TenantPlan } from "@prisma/client";

export interface CreateTenantRequest {
  name: string;
  slug?: string;
  domain?: string;
  plan?: TenantPlan;
}

export interface UpdateTenantRequest {
  name?: string;
  slug?: string;
  domain?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
}

export interface TenantListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: TenantStatus;
  plan?: TenantPlan;
}

export interface UpsertConfigRequest {
  value: unknown;
  description?: string;
}

export interface UpsertMetadataRequest {
  value: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
