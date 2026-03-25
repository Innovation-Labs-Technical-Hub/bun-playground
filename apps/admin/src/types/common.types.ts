export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export type StatusType = "active" | "inactive" | "suspended" | "trial" | "pending" | "error";
