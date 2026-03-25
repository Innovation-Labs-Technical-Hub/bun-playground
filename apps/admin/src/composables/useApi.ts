import { ref, type Ref } from "vue";
import apiClient from "../utils/api-client";

interface UseApiReturn<T> {
  data: Ref<T | null>;
  error: Ref<string | null>;
  isLoading: Ref<boolean>;
  execute: (...args: any[]) => Promise<T | null>;
}

export function useApi<T>(
  apiFunc: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>;
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const execute = async (...args: any[]): Promise<T | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await apiFunc(...args);
      data.value = result;
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred";
      error.value = message;
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  return { data, error, isLoading, execute };
}

export function useGet<T>(path: string) {
  return useApi<T>((params?: Record<string, string | number | undefined>) =>
    apiClient.get<T>(path, params)
  );
}

export function usePost<T>(path: string) {
  return useApi<T>((body?: unknown) => apiClient.post<T>(path, body));
}

export function usePut<T>(path: string) {
  return useApi<T>((body?: unknown) => apiClient.put<T>(path, body));
}

export function useDelete<T>(path: string) {
  return useApi<T>(() => apiClient.delete<T>(path));
}
