<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../components/layout/AppLayout.vue";
import DataTable from "../components/common/DataTable.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import TenantForm from "../components/tenants/TenantForm.vue";
import ConfirmDialog from "../components/common/ConfirmDialog.vue";
import { useTenantStore } from "../stores/tenant.store";
import { usePagination } from "../composables/usePagination";
import { formatDate, formatNumber } from "../utils/format";
import type { Tenant, CreateTenantRequest } from "../types/tenant.types";
import type { TableColumn } from "../types/common.types";

const router = useRouter();
const tenantStore = useTenantStore();
const pagination = usePagination({ initialLimit: 10 });

const showCreateForm = ref(false);
const showDeleteDialog = ref(false);
const tenantToDelete = ref<Tenant | null>(null);
const statusFilter = ref("all");

onMounted(() => {
  tenantStore.fetchTenants();
});

const columns: TableColumn<Tenant>[] = [
  { key: "name", label: "Tenant", sortable: true },
  { key: "status", label: "Status", sortable: true, width: "120px" },
  { key: "plan", label: "Plan", sortable: true, width: "130px" },
  { key: "metadata", label: "Users", width: "100px" },
  { key: "createdAt", label: "Created", sortable: true, width: "130px" },
];

const filteredTenants = computed(() => {
  let result = tenantStore.tenants;

  if (statusFilter.value !== "all") {
    result = result.filter((t) => t.status === statusFilter.value);
  }

  if (pagination.search.value) {
    const query = pagination.search.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.slug.toLowerCase().includes(query) ||
        t.metadata.ownerEmail.toLowerCase().includes(query)
    );
  }

  return result;
});

const paginatedTenants = computed(() => {
  const start = (pagination.page.value - 1) * pagination.limit.value;
  const end = start + pagination.limit.value;
  pagination.setTotal(filteredTenants.value.length);
  return filteredTenants.value.slice(start, end);
});

watch([() => pagination.search.value, statusFilter], () => {
  pagination.resetPage();
});

const planStyles: Record<string, string> = {
  free: "bg-gray-100 text-gray-700",
  starter: "bg-blue-100 text-blue-700",
  professional: "bg-purple-100 text-purple-700",
  enterprise: "bg-amber-100 text-amber-700",
};

const handleCreate = async (data: CreateTenantRequest) => {
  await tenantStore.createTenant(data);
  showCreateForm.value = false;
};

const handleRowClick = (tenant: Tenant) => {
  router.push(`/tenants/${tenant.id}`);
};

const confirmDelete = (tenant: Tenant) => {
  tenantToDelete.value = tenant;
  showDeleteDialog.value = true;
};

const handleDelete = async () => {
  if (tenantToDelete.value) {
    await tenantStore.deleteTenant(tenantToDelete.value.id);
  }
  showDeleteDialog.value = false;
  tenantToDelete.value = null;
};
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tenants</h1>
          <p class="mt-1 text-sm text-gray-500">
            Manage all tenants across your platform. {{ filteredTenants.length }} total.
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          @click="showCreateForm = true"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Tenant
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            v-model="pagination.search.value"
            type="text"
            placeholder="Search tenants by name, slug, or email..."
            class="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <select
          v-model="statusFilter"
          class="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <!-- Table -->
      <DataTable
        :columns="columns"
        :data="paginatedTenants"
        :loading="tenantStore.isLoading"
        :current-page="pagination.page.value"
        :total-pages="pagination.totalPages.value"
        :visible-pages="pagination.visiblePages.value"
        empty-message="No tenants found matching your criteria."
        @sort="pagination.toggleSort"
        @page-change="pagination.goToPage"
        @row-click="handleRowClick"
      >
        <template #cell-name="{ row }">
          <div>
            <p class="font-medium text-gray-900">{{ row.name }}</p>
            <p class="text-xs text-gray-500">{{ row.slug }}</p>
          </div>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-plan="{ row }">
          <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', planStyles[row.plan] ?? '']">
            {{ row.plan.charAt(0).toUpperCase() + row.plan.slice(1) }}
          </span>
        </template>
        <template #cell-metadata="{ row }">
          <span class="text-sm text-gray-700">{{ formatNumber(row.metadata.usersCount) }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-sm text-gray-500">{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button
              class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="View details"
              @click.stop="router.push(`/tenants/${row.id}`)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Delete tenant"
              @click.stop="confirmDelete(row)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Create Form Modal -->
    <TenantForm
      :open="showCreateForm"
      :loading="tenantStore.isLoading"
      @submit="handleCreate"
      @cancel="showCreateForm = false"
    />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      :open="showDeleteDialog"
      title="Delete Tenant"
      :message="`Are you sure you want to delete '${tenantToDelete?.name}'? This action cannot be undone.`"
      confirm-label="Delete"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </AppLayout>
</template>
