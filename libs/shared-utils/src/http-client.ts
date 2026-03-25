interface HttpClientOptions {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

export class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private defaultHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.timeout = options.timeout ?? 5000;
    this.retries = options.retries ?? 2;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  }

  private async request<T>(method: string, path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? this.timeout);

        const response = await fetch(url, {
          method,
          headers: { ...this.defaultHeaders, ...options?.headers },
          body: body ? JSON.stringify(body) : undefined,
          signal: options?.signal ?? controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorBody}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retries) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 100));
        }
      }
    }

    throw lastError;
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>("GET", path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>("DELETE", path, undefined, options);
  }
}
