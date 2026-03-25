<script setup lang="ts">
import { onMounted, computed } from "vue";
import AppLayout from "../components/layout/AppLayout.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import { useTenantStore } from "../stores/tenant.store";
import { formatRelativeTime, formatCompactNumber, formatBytes } from "../utils/format";

const tenantStore = useTenantStore();

onMounted(() => {
  tenantStore.fetchTenants();
});

const stats = computed(() => [
  {
    label: "Total Tenants",
    value: tenantStore.tenants.length,
    change: "+12%",
    changeType: "up" as const,
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />`,
    color: "bg-blue-500",
  },
  {
    label: "Active Tenants",
    value: tenantStore.activeTenants.length,
    change: "+8%",
    changeType: "up" as const,
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`,
    color: "bg-green-500",
  },
  {
    label: "Total Users",
    value: tenantStore.tenants.reduce((sum, t) => sum + t.metadata.usersCount, 0),
    change: "+23%",
    changeType: "up" as const,
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />`,
    color: "bg-purple-500",
  },
  {
    label: "Storage Used",
    value: tenantStore.tenants.reduce((sum, t) => sum + t.metadata.storageUsed, 0),
    change: "+5%",
    changeType: "up" as const,
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />`,
    color: "bg-amber-500",
    formatAsBytes: true,
  },
]);

const recentTenants = computed(() =>
  [...tenantStore.tenants]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
);

const planDistribution = computed(() => {
  const counts: Record<string, number> = {};
  tenantStore.tenants.forEach((t) => {
    counts[t.plan] = (counts[t.plan] ?? 0) + 1;
  });
  return Object.entries(counts).map(([plan, count]) => ({
    plan: plan.charAt(0).toUpperCase() + plan.slice(1),
    count,
    percentage: Math.round((count / tenantStore.tenants.length) * 100),
  }));
});

const planBarColors: Record<string, string> = {
  Free: "bg-gray-400",
  Starter: "bg-blue-500",
  Professional: "bg-purple-500",
  Enterprise: "bg-amber-500",
};
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Title -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">Overview of your platform activity and metrics.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ stat.label }}</p>
              <p class="mt-1 text-2xl font-bold text-gray-900">
                {{ stat.formatAsBytes ? formatBytes(stat.value) : formatCompactNumber(stat.value) }}
              </p>
            </div>
            <div :class="['flex h-10 w-10 items-center justify-center rounded-lg text-white', stat.color]">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" v-html="stat.icon" />
            </div>
          </div>
          <div class="mt-3 flex items-center gap-1">
            <span
              :class="[
                'text-xs font-medium',
                stat.changeType === 'up' ? 'text-green-600' : 'text-red-600',
              ]"
            >
              {{ stat.change }}
            </span>
            <span class="text-xs text-gray-500">from last month</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Recent Tenants -->
        <div class="col-span-2 rounded-xl border border-gray-200 bg-white">
          <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 class="text-base font-semibold text-gray-900">Recent Activity</h2>
            <router-link to="/tenants" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all
            </router-link>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="tenant in recentTenants"
              :key="tenant.id"
              class="flex items-center justify-between px-5 py-3.5"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                  {{ tenant.name.charAt(0) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ tenant.name }}</p>
                  <p class="text-xs text-gray-500">
                    {{ tenant.metadata.usersCount }} users &middot; {{ formatRelativeTime(tenant.metadata.lastActiveAt) }}
                  </p>
                </div>
              </div>
              <StatusBadge :status="tenant.status" />
            </div>
          </div>
        </div>

        <!-- Plan Distribution -->
        <div class="rounded-xl border border-gray-200 bg-white">
          <div class="border-b border-gray-200 px-5 py-4">
            <h2 class="text-base font-semibold text-gray-900">Plan Distribution</h2>
          </div>
          <div class="space-y-4 p-5">
            <div v-for="item in planDistribution" :key="item.plan">
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-gray-700">{{ item.plan }}</span>
                <span class="text-gray-500">{{ item.count }} ({{ item.percentage }}%)</span>
              </div>
              <div class="mt-1.5 h-2 w-full rounded-full bg-gray-100">
                <div
                  :class="['h-2 rounded-full transition-all', planBarColors[item.plan] ?? 'bg-gray-400']"
                  :style="{ width: `${item.percentage}%` }"
                />
              </div>
            </div>
          </div>

          <div class="border-t border-gray-200 px-5 py-4">
            <h3 class="text-sm font-semibold text-gray-900">Quick Actions</h3>
            <div class="mt-3 space-y-2">
              <router-link
                to="/tenants"
                class="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create New Tenant
              </router-link>
              <router-link
                to="/users"
                class="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
                Manage Users
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
