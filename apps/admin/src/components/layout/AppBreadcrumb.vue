<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { BreadcrumbItem } from "../../types/common.types";

const route = useRoute();

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [{ label: "Home", to: "/dashboard" }];
  const path = route.path;

  if (path.startsWith("/dashboard")) {
    items.push({ label: "Dashboard" });
  } else if (path.startsWith("/tenants")) {
    items.push({ label: "Tenants", to: "/tenants" });
    if (route.params.id) {
      items.push({ label: `Tenant ${route.params.id}` });
    }
  } else if (path.startsWith("/users")) {
    items.push({ label: "Users" });
  } else if (path.startsWith("/settings")) {
    items.push({ label: "Settings" });
  }

  return items;
});
</script>

<template>
  <nav class="flex items-center gap-1 text-sm">
    <template v-for="(crumb, index) in breadcrumbs" :key="index">
      <svg
        v-if="index > 0"
        class="h-4 w-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
      <router-link
        v-if="crumb.to && index < breadcrumbs.length - 1"
        :to="crumb.to"
        class="text-gray-500 hover:text-gray-700"
      >
        {{ crumb.label }}
      </router-link>
      <span v-else class="font-medium text-gray-900">{{ crumb.label }}</span>
    </template>
  </nav>
</template>
