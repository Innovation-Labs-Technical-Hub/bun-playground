import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Tenant, CreateTenantRequest, UpdateTenantRequest } from "../types/tenant.types";

// Demo data for development
const DEMO_TENANTS: Tenant[] = [
  {
    id: "t-001",
    name: "Acme Corporation",
    slug: "acme-corp",
    status: "active",
    plan: "enterprise",
    config: {
      maxUsers: 500,
      maxStorage: 107374182400,
      features: ["sso", "api", "webhooks", "audit-log", "custom-domain"],
      customDomain: "admin.acme.com",
      ssoEnabled: true,
      apiRateLimit: 10000,
    },
    metadata: {
      owner: "John Smith",
      ownerEmail: "john@acme.com",
      industry: "Technology",
      country: "US",
      usersCount: 342,
      storageUsed: 53687091200,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
  },
  {
    id: "t-002",
    name: "StartupXYZ",
    slug: "startup-xyz",
    status: "trial",
    plan: "starter",
    config: {
      maxUsers: 10,
      maxStorage: 5368709120,
      features: ["api"],
      ssoEnabled: false,
      apiRateLimit: 1000,
    },
    metadata: {
      owner: "Jane Doe",
      ownerEmail: "jane@startupxyz.io",
      industry: "SaaS",
      country: "UK",
      usersCount: 5,
      storageUsed: 1073741824,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-22T09:15:00Z",
  },
  {
    id: "t-003",
    name: "Global Industries",
    slug: "global-industries",
    status: "active",
    plan: "professional",
    config: {
      maxUsers: 100,
      maxStorage: 53687091200,
      features: ["sso", "api", "webhooks"],
      ssoEnabled: true,
      apiRateLimit: 5000,
    },
    metadata: {
      owner: "Robert Chen",
      ownerEmail: "robert@globalind.com",
      industry: "Manufacturing",
      country: "DE",
      usersCount: 78,
      storageUsed: 21474836480,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    createdAt: "2024-06-10T12:00:00Z",
    updatedAt: "2026-03-18T16:45:00Z",
  },
  {
    id: "t-004",
    name: "MediaFlow",
    slug: "media-flow",
    status: "suspended",
    plan: "professional",
    config: {
      maxUsers: 100,
      maxStorage: 53687091200,
      features: ["api", "webhooks"],
      ssoEnabled: false,
      apiRateLimit: 5000,
    },
    metadata: {
      owner: "Sarah Kim",
      ownerEmail: "sarah@mediaflow.co",
      industry: "Media",
      country: "KR",
      usersCount: 45,
      storageUsed: 32212254720,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    },
    createdAt: "2024-09-22T14:00:00Z",
    updatedAt: "2026-02-28T11:00:00Z",
  },
  {
    id: "t-005",
    name: "EduLearn Platform",
    slug: "edulearn",
    status: "active",
    plan: "enterprise",
    config: {
      maxUsers: 1000,
      maxStorage: 214748364800,
      features: ["sso", "api", "webhooks", "audit-log", "custom-domain"],
      customDomain: "dashboard.edulearn.com",
      ssoEnabled: true,
      apiRateLimit: 20000,
    },
    metadata: {
      owner: "Michael Torres",
      ownerEmail: "michael@edulearn.com",
      industry: "Education",
      country: "US",
      usersCount: 892,
      storageUsed: 107374182400,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    createdAt: "2023-11-05T09:00:00Z",
    updatedAt: "2026-03-24T08:20:00Z",
  },
  {
    id: "t-006",
    name: "HealthFirst",
    slug: "health-first",
    status: "inactive",
    plan: "free",
    config: {
      maxUsers: 5,
      maxStorage: 1073741824,
      features: [],
      ssoEnabled: false,
      apiRateLimit: 100,
    },
    metadata: {
      owner: "Lisa Park",
      ownerEmail: "lisa@healthfirst.org",
      industry: "Healthcare",
      country: "CA",
      usersCount: 2,
      storageUsed: 104857600,
      lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    },
    createdAt: "2025-08-12T16:00:00Z",
    updatedAt: "2025-12-01T10:00:00Z",
  },
];

export const useTenantStore = defineStore("tenant", () => {
  const tenants = ref<Tenant[]>([...DEMO_TENANTS]);
  const currentTenant = ref<Tenant | null>(null);
  const isLoading = ref(false);

  const activeTenants = computed(() =>
    tenants.value.filter((t) => t.status === "active")
  );

  const totalTenants = computed(() => tenants.value.length);

  async function fetchTenants(): Promise<void> {
    isLoading.value = true;
    try {
      // Demo: use local data. In production, fetch from API.
      await new Promise((resolve) => setTimeout(resolve, 300));
      tenants.value = [...DEMO_TENANTS];
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTenantById(id: string): Promise<Tenant | null> {
    isLoading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const tenant = tenants.value.find((t) => t.id === id) ?? null;
      currentTenant.value = tenant;
      return tenant;
    } finally {
      isLoading.value = false;
    }
  }

  async function createTenant(request: CreateTenantRequest): Promise<Tenant> {
    isLoading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newTenant: Tenant = {
        id: `t-${String(tenants.value.length + 1).padStart(3, "0")}`,
        name: request.name,
        slug: request.slug,
        status: "trial",
        plan: request.plan,
        config: {
          maxUsers: request.config?.maxUsers ?? 10,
          maxStorage: request.config?.maxStorage ?? 5368709120,
          features: request.config?.features ?? [],
          ssoEnabled: request.config?.ssoEnabled ?? false,
          apiRateLimit: request.config?.apiRateLimit ?? 1000,
        },
        metadata: {
          owner: request.metadata?.owner ?? "",
          ownerEmail: request.metadata?.ownerEmail ?? "",
          industry: request.metadata?.industry,
          country: request.metadata?.country,
          usersCount: 0,
          storageUsed: 0,
          lastActiveAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tenants.value.push(newTenant);
      return newTenant;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTenant(id: string, request: UpdateTenantRequest): Promise<Tenant | null> {
    isLoading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = tenants.value.findIndex((t) => t.id === id);
      if (index === -1) return null;

      const updated = {
        ...tenants.value[index]!,
        ...request,
        config: request.config
          ? { ...tenants.value[index]!.config, ...request.config }
          : tenants.value[index]!.config,
        updatedAt: new Date().toISOString(),
      };

      tenants.value[index] = updated;
      if (currentTenant.value?.id === id) {
        currentTenant.value = updated;
      }
      return updated;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteTenant(id: string): Promise<boolean> {
    isLoading.value = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = tenants.value.findIndex((t) => t.id === id);
      if (index === -1) return false;

      tenants.value.splice(index, 1);
      if (currentTenant.value?.id === id) {
        currentTenant.value = null;
      }
      return true;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    tenants,
    currentTenant,
    isLoading,
    activeTenants,
    totalTenants,
    fetchTenants,
    fetchTenantById,
    createTenant,
    updateTenant,
    deleteTenant,
  };
});
