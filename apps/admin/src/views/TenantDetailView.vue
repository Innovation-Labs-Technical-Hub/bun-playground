<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppLayout from "../components/layout/AppLayout.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import LoadingSpinner from "../components/common/LoadingSpinner.vue";
import ConfirmDialog from "../components/common/ConfirmDialog.vue";
import { useTenantStore } from "../stores/tenant.store";
import { formatDate, formatDateTime, formatBytes, formatNumber, formatRelativeTime } from "../utils/format";

const route = useRoute();
const router = useRouter();
const tenantStore = useTenantStore();

const activeTab = ref<"overview" | "config" | "metadata">("overview");
const showDeleteDialog = ref(false);

const tenantId = computed(() => route.params.id as string);

onMounted(async () => {
  await tenantStore.fetchTenantById(tenantId.value);
});

const tenant = computed(() => tenantStore.currentTenant);

const handleDelete = async () => {
  if (tenant.value) {
    await tenantStore.deleteTenant(tenant.value.id);
    router.push("/tenants");
  }
};

const handleStatusChange = async (status: string) => {
  if (tenant.value) {
    await tenantStore.updateTenant(tenant.value.id, { status: status as any });
  }
};

const planStyles: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  professional: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
};

const storagePercentage = computed(() => {
  if (!tenant.value) return 0;
  return Math.round((tenant.value.metadata.storageUsed / tenant.value.config.maxStorage) * 100);
});

const usersPercentage = computed(() => {
  if (!tenant.value) return 0;
  return Math.round((tenant.value.metadata.usersCount / tenant.value.config.maxUsers) * 100);
});
</script>

<template>
  <AppLayout>
    <div v-if="tenantStore.isLoading && !tenant" class="flex h-64 items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="!tenant" class="flex h-64 flex-col items-center justify-center gap-3">
      <p class="text-lg text-gray-500">Tenant not found</p>
      <router-link to="/tenants" class="text-sm font-medium text-primary-600 hover:text-primary-500">
        Back to tenants
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex items-start gap-4">
          <button
            class="mt-1 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            @click="router.push('/tenants')"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900">{{ tenant.name }}</h1>
              <StatusBadge :status="tenant.status" />
            </div>
            <p class="mt-1 text-sm text-gray-500">{{ tenant.slug }} &middot; ID: {{ tenant.id }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <select
            :value="tenant.status"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
          </select>
          <button
            class="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            @click="showDeleteDialog = true"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6">
          <button
            v-for="tab in (['overview', 'config', 'metadata'] as const)"
            :key="tab"
            :class="[
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
            ]"
            @click="activeTab = tab"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </nav>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Key Metrics -->
        <div class="rounded-xl border border-gray-200 bg-white p-5">
          <h3 class="text-base font-semibold text-gray-900">Key Metrics</h3>
          <div class="mt-4 grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-gray-50 p-4">
              <p class="text-sm text-gray-500">Users</p>
              <p class="mt-1 text-xl font-bold text-gray-900">
                {{ formatNumber(tenant.metadata.usersCount) }}
              </p>
              <div class="mt-2">
                <div class="h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    class="h-1.5 rounded-full bg-primary-500"
                    :style="{ width: `${Math.min(usersPercentage, 100)}%` }"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  {{ usersPercentage }}% of {{ formatNumber(tenant.config.maxUsers) }} limit
                </p>
              </div>
            </div>
            <div class="rounded-lg bg-gray-50 p-4">
              <p class="text-sm text-gray-500">Storage</p>
              <p class="mt-1 text-xl font-bold text-gray-900">
                {{ formatBytes(tenant.metadata.storageUsed) }}
              </p>
              <div class="mt-2">
                <div class="h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    :class="[
                      'h-1.5 rounded-full',
                      storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-amber-500' : 'bg-green-500',
                    ]"
                    :style="{ width: `${Math.min(storagePercentage, 100)}%` }"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  {{ storagePercentage }}% of {{ formatBytes(tenant.config.maxStorage) }} limit
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tenant Info -->
        <div class="rounded-xl border border-gray-200 bg-white p-5">
          <h3 class="text-base font-semibold text-gray-900">Tenant Info</h3>
          <dl class="mt-4 space-y-3">
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Plan</dt>
              <dd>
                <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', planStyles[tenant.plan] ?? '']">
                  {{ tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1) }}
                </span>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Owner</dt>
              <dd class="text-sm font-medium text-gray-900">{{ tenant.metadata.owner }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Email</dt>
              <dd class="text-sm text-gray-900">{{ tenant.metadata.ownerEmail }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Industry</dt>
              <dd class="text-sm text-gray-900">{{ tenant.metadata.industry ?? "N/A" }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Country</dt>
              <dd class="text-sm text-gray-900">{{ tenant.metadata.country ?? "N/A" }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Last Active</dt>
              <dd class="text-sm text-gray-900">{{ formatRelativeTime(tenant.metadata.lastActiveAt) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-sm text-gray-500">Created</dt>
              <dd class="text-sm text-gray-900">{{ formatDateTime(tenant.createdAt) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Config Tab -->
      <div v-if="activeTab === 'config'" class="rounded-xl border border-gray-200 bg-white p-5">
        <h3 class="text-base font-semibold text-gray-900">Configuration</h3>
        <div class="mt-4 divide-y divide-gray-100">
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">Max Users</p>
              <p class="text-xs text-gray-500">Maximum number of users allowed</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ formatNumber(tenant.config.maxUsers) }}</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">Max Storage</p>
              <p class="text-xs text-gray-500">Maximum storage capacity</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ formatBytes(tenant.config.maxStorage) }}</span>
          </div>
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">SSO Enabled</p>
              <p class="text-xs text-gray-500">Single sign-on integration</p>
            </div>
            <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', tenant.config.ssoEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
              {{ tenant.config.ssoEnabled ? "Enabled" : "Disabled" }}
            </span>
          </div>
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">API Rate Limit</p>
              <p class="text-xs text-gray-500">Requests per hour</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">{{ formatNumber(tenant.config.apiRateLimit) }}/hr</span>
          </div>
          <div v-if="tenant.config.customDomain" class="flex items-center justify-between py-3">
            <div>
              <p class="text-sm font-medium text-gray-900">Custom Domain</p>
              <p class="text-xs text-gray-500">Custom domain for tenant access</p>
            </div>
            <span class="text-sm font-semibold text-primary-600">{{ tenant.config.customDomain }}</span>
          </div>
          <div class="py-3">
            <p class="text-sm font-medium text-gray-900">Features</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="feature in tenant.config.features"
                :key="feature"
                class="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
              >
                {{ feature }}
              </span>
              <span v-if="tenant.config.features.length === 0" class="text-xs text-gray-400">
                No features enabled
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Metadata Tab -->
      <div v-if="activeTab === 'metadata'" class="rounded-xl border border-gray-200 bg-white p-5">
        <h3 class="text-base font-semibold text-gray-900">Metadata</h3>
        <div class="mt-4">
          <pre class="rounded-lg bg-gray-50 p-4 text-sm text-gray-800 overflow-x-auto">{{ JSON.stringify({ id: tenant.id, slug: tenant.slug, status: tenant.status, plan: tenant.plan, config: tenant.config, metadata: tenant.metadata, createdAt: tenant.createdAt, updatedAt: tenant.updatedAt }, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :open="showDeleteDialog"
      title="Delete Tenant"
      :message="`Are you sure you want to delete '${tenant?.name}'? All data will be permanently removed. This action cannot be undone.`"
      confirm-label="Delete Permanently"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </AppLayout>
</template>
