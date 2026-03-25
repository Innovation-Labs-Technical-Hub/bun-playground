import type { Context } from "hono";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function success<T>(c: Context, data: T, status: number = 200) {
  return c.json({ success: true, data }, status as any);
}

export function paginated<T>(c: Context, data: T[], meta: PaginationMeta) {
  return c.json({ success: true, data, meta });
}

export function error(c: Context, message: string, status: number = 400) {
  return c.json({ success: false, error: message }, status as any);
}
