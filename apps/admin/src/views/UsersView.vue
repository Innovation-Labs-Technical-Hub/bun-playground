<script setup lang="ts">
import { ref, computed } from "vue";
import AppLayout from "../components/layout/AppLayout.vue";
import DataTable from "../components/common/DataTable.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import ConfirmDialog from "../components/common/ConfirmDialog.vue";
import { usePagination } from "../composables/usePagination";
import { formatDate, formatRelativeTime } from "../utils/format";
import type { User } from "../types/auth.types";
import type { TableColumn } from "../types/common.types";

// Demo users data
const users = ref<(User & { status: "active" | "inactive"; lastLoginAt: string })[]>([
  {
    id: "u-001",
    email: "john.smith@acme.com",
    name: "John Smith",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2026-03-20T14:30:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "u-002",
    email: "jane.doe@startupxyz.io",
    name: "Jane Doe",
    role: "manager",
    status: "active",
    createdAt: "2024-06-10T12:00:00Z",
    updatedAt: "2026-03-18T16:45:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "u-003",
    email: "robert.chen@globalind.com",
    name: "Robert Chen",
    role: "viewer",
    status: "active",
    createdAt: "2025-02-20T09:00:00Z",
    updatedAt: "2026-03-22T10:20:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "u-004",
    email: "sarah.kim@mediaflow.co",
    name: "Sarah Kim",
    role: "manager",
    status: "inactive",
    createdAt: "2024-09-22T14:00:00Z",
    updatedAt: "2026-02-28T11:00:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: "u-005",
    email: "michael.torres@edulearn.com",
    name: "Michael Torres",
    role: "admin",
    status: "active",
    createdAt: "2023-11-05T09:00:00Z",
    updatedAt: "2026-03-24T08:20:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "u-006",
    email: "lisa.park@healthfirst.org",
    name: "Lisa Park",
    role: "viewer",
    status: "inactive",
    createdAt: "2025-08-12T16:00:00Z",
    updatedAt: "2025-12-01T10:00:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: "u-007",
    email: "alex.johnson@acme.com",
    name: "Alex Johnson",
    role: "viewer",
    status: "active",
    createdAt: "2025-04-18T11:30:00Z",
    updatedAt: "2026-03-23T15:00:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "u-008",
    email: "emma.wilson@acme.com",
    name: "Emma Wilson",
    role: "manager",
    status: "active",
    createdAt: "2024-12-01T08:00:00Z",
    updatedAt: "2026-03-21T09:30:00Z",
    lastLoginAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
]);

const pagination = usePagination({ initialLimit: 10 });
const roleFilter = ref("all");
const showDeleteDialog = ref(false);
const userToDelete = ref<(typeof users.value)[0] | null>(null);

const columns: TableColumn[] = [
  { key: "name", label: "User", sortable: true },
  { key: "role", label: "Role", sortable: true, width: "120px" },
  { key: "status", label: "Status", width: "110px" },
  { key: "lastLoginAt", label: "Last Login", sortable: true, width: "150px" },
  { key: "createdAt", label: "Joined", sortable: true, width: "130px" },
];

const filteredUsers = computed(() => {
  let result = users.value;

  if (roleFilter.value !== "all") {
    result = result.filter((u) => u.role === roleFilter.value);
  }

  if (pagination.search.value) {
    const query = pagination.search.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }

  return result;
});

const paginatedUsers = computed(() => {
  pagination.setTotal(filteredUsers.value.length);
  const start = (pagination.page.value - 1) * pagination.limit.value;
  return filteredUsers.value.slice(start, start + pagination.limit.value);
});

const roleStyles: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  viewer: "bg-gray-100 text-gray-700",
};

const confirmDelete = (user: (typeof users.value)[0]) => {
  userToDelete.value = user;
  showDeleteDialog.value = true;
};

const handleDelete = () => {
  if (userToDelete.value) {
    users.value = users.value.filter((u) => u.id !== userToDelete.value!.id);
  }
  showDeleteDialog.value = false;
  userToDelete.value = null;
};
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Users</h1>
          <p class="mt-1 text-sm text-gray-500">
            Manage platform administrators and their access levels. {{ filteredUsers.length }} users.
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
          </svg>
          Invite User
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
            placeholder="Search users by name or email..."
            class="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <select
          v-model="roleFilter"
          class="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      <!-- Table -->
      <DataTable
        :columns="columns"
        :data="paginatedUsers"
        :current-page="pagination.page.value"
        :total-pages="pagination.totalPages.value"
        :visible-pages="pagination.visiblePages.value"
        empty-message="No users found matching your criteria."
        @sort="pagination.toggleSort"
        @page-change="pagination.goToPage"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {{ row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ row.name }}</p>
              <p class="text-xs text-gray-500">{{ row.email }}</p>
            </div>
          </div>
        </template>
        <template #cell-role="{ row }">
          <span :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', roleStyles[row.role] ?? '']">
            {{ row.role.charAt(0).toUpperCase() + row.role.slice(1) }}
          </span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge :status="row.status" />
        </template>
        <template #cell-lastLoginAt="{ row }">
          <span class="text-sm text-gray-500">{{ formatRelativeTime(row.lastLoginAt) }}</span>
        </template>
        <template #cell-createdAt="{ row }">
          <span class="text-sm text-gray-500">{{ formatDate(row.createdAt) }}</span>
        </template>
        <template #actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button
              class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Edit user"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
            <button
              class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
              title="Remove user"
              @click="confirmDelete(row)"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <ConfirmDialog
      :open="showDeleteDialog"
      title="Remove User"
      :message="`Are you sure you want to remove '${userToDelete?.name}'? They will lose access to the platform.`"
      confirm-label="Remove"
      variant="danger"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </AppLayout>
</template>
