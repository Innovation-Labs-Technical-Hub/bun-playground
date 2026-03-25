import type { ApiResponse, PaginatedResponse, PaginationParams } from "../types/common.types";

const BASE_URL = "/api";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh_token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "An error occurred" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  async getPaginated<T>(path: string, params: PaginationParams): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(path, {
      page: params.page,
      limit: params.limit,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
