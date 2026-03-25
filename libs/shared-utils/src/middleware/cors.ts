interface CorsOptions {
  origins?: string[];
  methods?: string[];
  headers?: string[];
  credentials?: boolean;
}

const DEFAULT_CORS: CorsOptions = {
  origins: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  headers: ["Content-Type", "Authorization", "X-Request-ID"],
  credentials: false,
};

export function corsHeaders(options?: CorsOptions): Record<string, string> {
  const opts = { ...DEFAULT_CORS, ...options };
  return {
    "Access-Control-Allow-Origin": opts.origins?.join(",") ?? "*",
    "Access-Control-Allow-Methods": opts.methods?.join(",") ?? "",
    "Access-Control-Allow-Headers": opts.headers?.join(",") ?? "",
    ...(opts.credentials ? { "Access-Control-Allow-Credentials": "true" } : {}),
  };
}

export function handleCorsPreFlight(options?: CorsOptions): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(options),
  });
}
