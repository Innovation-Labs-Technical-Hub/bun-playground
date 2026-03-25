<script setup lang="ts">
import type { StatusType } from "../../types/common.types";

const props = defineProps<{
  status: StatusType;
  label?: string;
}>();

const statusStyles: Record<StatusType, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
  trial: "bg-amber-100 text-amber-800",
  pending: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-800",
};

const dotStyles: Record<StatusType, string> = {
  active: "bg-green-500",
  inactive: "bg-gray-400",
  suspended: "bg-red-500",
  trial: "bg-amber-500",
  pending: "bg-blue-500",
  error: "bg-red-500",
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
      statusStyles[props.status],
    ]"
  >
    <span :class="['h-1.5 w-1.5 rounded-full', dotStyles[props.status]]" />
    {{ props.label ?? props.status.charAt(0).toUpperCase() + props.status.slice(1) }}
  </span>
</template>
