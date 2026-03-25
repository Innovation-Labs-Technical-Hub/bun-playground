<script setup lang="ts">
import type { Tenant } from "../../types/tenant.types";
import StatusBadge from "../common/StatusBadge.vue";
import { formatDate, formatBytes, formatNumber } from "../../utils/format";

const props = defineProps<{
  tenant: Tenant;
}>();

const emit = defineEmits<{
  click: [tenant: Tenant];
}>();

const planColors: Record<string, string> = {
  free: "text-gray-600 bg-gray-100",
  starter: "text-blue-600 bg-blue-100",
  professional: "text-purple-600 bg-purple-100",
  enterprise: "text-amber-600 bg-amber-100",
};
</script>

<template>
  <div
    class="cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    @click="emit('click', props.tenant)"
  >
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-base font-semibold text-gray-900">{{ props.tenant.name }}</h3>
        <p class="mt-0.5 text-sm text-gray-500">{{ props.tenant.slug }}</p>
      </div>
      <StatusBadge :status="props.tenant.status" />
    </div>

    <div class="mt-4 flex items-center gap-3">
      <span
        :class="['rounded-full px-2.5 py-0.5 text-xs font-medium', planColors[props.tenant.plan] ?? 'text-gray-600 bg-gray-100']"
      >
        {{ props.tenant.plan.charAt(0).toUpperCase() + props.tenant.plan.slice(1) }}
      </span>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
      <div>
        <p class="text-xs text-gray-500">Users</p>
        <p class="text-sm font-semibold text-gray-900">{{ formatNumber(props.tenant.metadata.usersCount) }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Storage</p>
        <p class="text-sm font-semibold text-gray-900">{{ formatBytes(props.tenant.metadata.storageUsed) }}</p>
      </div>
      <div>
        <p class="text-xs text-gray-500">Created</p>
        <p class="text-sm font-semibold text-gray-900">{{ formatDate(props.tenant.createdAt) }}</p>
      </div>
    </div>
  </div>
</template>
