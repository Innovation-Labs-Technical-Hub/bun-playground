export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive" | "suspended" | "trial";
  plan: "free" | "starter" | "professional" | "enterprise";
  config: TenantConfig;
  metadata: TenantMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface TenantConfig {
  maxUsers: number;
  maxStorage: number;
  features: string[];
  customDomain?: string;
  ssoEnabled: boolean;
  apiRateLimit: number;
}

export interface TenantMetadata {
  owner: string;
  ownerEmail: string;
  industry?: string;
  country?: string;
  usersCount: number;
  storageUsed: number;
  lastActiveAt: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  plan: Tenant["plan"];
  config?: Partial<TenantConfig>;
  metadata?: Partial<Pick<TenantMetadata, "owner" | "ownerEmail" | "industry" | "country">>;
}

export interface UpdateTenantRequest {
  name?: string;
  status?: Tenant["status"];
  plan?: Tenant["plan"];
  config?: Partial<TenantConfig>;
}
