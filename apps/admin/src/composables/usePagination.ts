import { ref, computed, type Ref } from "vue";
import type { PaginationParams } from "../types/common.types";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
}

export function usePagination(options: UsePaginationOptions = {}) {
  const page = ref(options.initialPage ?? 1);
  const limit = ref(options.initialLimit ?? 10);
  const total = ref(0);
  const search = ref("");
  const sortBy = ref(options.initialSortBy ?? "");
  const sortOrder: Ref<"asc" | "desc"> = ref(options.initialSortOrder ?? "desc");

  const totalPages = computed(() => Math.ceil(total.value / limit.value) || 1);

  const hasNextPage = computed(() => page.value < totalPages.value);
  const hasPrevPage = computed(() => page.value > 1);

  const params = computed<PaginationParams>(() => ({
    page: page.value,
    limit: limit.value,
    search: search.value || undefined,
    sortBy: sortBy.value || undefined,
    sortOrder: sortBy.value ? sortOrder.value : undefined,
  }));

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages.value) {
      page.value = p;
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) page.value++;
  };

  const prevPage = () => {
    if (hasPrevPage.value) page.value--;
  };

  const setTotal = (t: number) => {
    total.value = t;
  };

  const resetPage = () => {
    page.value = 1;
  };

  const toggleSort = (field: string) => {
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = field;
      sortOrder.value = "asc";
    }
    page.value = 1;
  };

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page.value - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages.value, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  return {
    page,
    limit,
    total,
    search,
    sortBy,
    sortOrder,
    totalPages,
    hasNextPage,
    hasPrevPage,
    params,
    visiblePages,
    goToPage,
    nextPage,
    prevPage,
    setTotal,
    resetPage,
    toggleSort,
  };
}
