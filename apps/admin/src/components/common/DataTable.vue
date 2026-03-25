<script setup lang="ts" generic="T extends Record<string, any>">
import type { TableColumn } from "../../types/common.types";

const props = withDefaults(
  defineProps<{
    columns: TableColumn<T>[];
    data: T[];
    loading?: boolean;
    emptyMessage?: string;
    rowKey?: keyof T;
    currentPage?: number;
    totalPages?: number;
    visiblePages?: number[];
  }>(),
  {
    loading: false,
    emptyMessage: "No data available",
    rowKey: "id" as any,
    currentPage: 1,
    totalPages: 1,
  }
);

const emit = defineEmits<{
  sort: [key: string];
  "page-change": [page: number];
  "row-click": [item: T];
}>();
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-gray-200 bg-gray-50">
          <tr>
            <th
              v-for="col in props.columns"
              :key="String(col.key)"
              :style="col.width ? { width: col.width } : undefined"
              class="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500"
              :class="{ 'cursor-pointer select-none hover:text-gray-700': col.sortable }"
              @click="col.sortable && emit('sort', String(col.key))"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <svg v-if="col.sortable" class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </div>
            </th>
            <th v-if="$slots.actions" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="props.loading">
            <td :colspan="props.columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-12 text-center">
              <div class="flex items-center justify-center gap-2 text-gray-500">
                <svg class="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </div>
            </td>
          </tr>
          <tr v-else-if="props.data.length === 0">
            <td :colspan="props.columns.length + ($slots.actions ? 1 : 0)" class="px-4 py-12 text-center text-gray-500">
              {{ props.emptyMessage }}
            </td>
          </tr>
          <tr
            v-for="(row, index) in props.data"
            v-else
            :key="String(row[props.rowKey] ?? index)"
            class="transition-colors hover:bg-gray-50"
            :class="{ 'cursor-pointer': $attrs['onRow-click'] }"
            @click="emit('row-click', row)"
          >
            <td v-for="col in props.columns" :key="String(col.key)" class="px-4 py-3">
              <slot :name="`cell-${String(col.key)}`" :row="row" :value="row[col.key as keyof T]">
                {{ row[col.key as keyof T] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-4 py-3 text-right">
              <slot name="actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="props.totalPages > 1"
      class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3"
    >
      <div class="text-sm text-gray-500">
        Page {{ props.currentPage }} of {{ props.totalPages }}
      </div>
      <div class="flex items-center gap-1">
        <button
          :disabled="props.currentPage <= 1"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          @click="emit('page-change', props.currentPage - 1)"
        >
          Previous
        </button>
        <button
          v-for="p in props.visiblePages ?? []"
          :key="p"
          :class="[
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            p === props.currentPage
              ? 'bg-primary-600 text-white'
              : 'text-gray-700 hover:bg-gray-100',
          ]"
          @click="emit('page-change', p)"
        >
          {{ p }}
        </button>
        <button
          :disabled="props.currentPage >= props.totalPages"
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          @click="emit('page-change', props.currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
