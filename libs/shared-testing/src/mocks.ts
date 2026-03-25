/**
 * Shared mock factories for unit tests across the monorepo.
 */

interface MockRequestOptions {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

/** Create a mock Request object for testing route handlers. */
export function createMockRequest(options: MockRequestOptions = {}): Request {
  const {
    method = "GET",
    url = "http://localhost:3000/",
    headers = {},
    body,
  } = options;

  return new Request(url, {
    method,
    headers: new Headers({
      "content-type": "application/json",
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Create a JSON Response for assertions. */
export function createMockResponse<T>(data: T, status = 200): Response {
  return Response.json(data, { status });
}

interface MockLogger {
  debug: ReturnType<typeof createLogSpy>;
  info: ReturnType<typeof createLogSpy>;
  warn: ReturnType<typeof createLogSpy>;
  error: ReturnType<typeof createLogSpy>;
  calls: (level: string) => unknown[][];
}

function createLogSpy() {
  const calls: unknown[][] = [];
  const fn = (...args: unknown[]) => {
    calls.push(args);
  };
  fn.calls = calls;
  return fn;
}

/** Create a mock logger that records all calls for assertions. */
export function createMockLogger(): MockLogger {
  const debug = createLogSpy();
  const info = createLogSpy();
  const warn = createLogSpy();
  const error = createLogSpy();

  return {
    debug,
    info,
    warn,
    error,
    calls(level: string) {
      switch (level) {
        case "debug": return debug.calls;
        case "info": return info.calls;
        case "warn": return warn.calls;
        case "error": return error.calls;
        default: return [];
      }
    },
  };
}
