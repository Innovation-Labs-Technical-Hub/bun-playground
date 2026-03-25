import { randomUUIDv7 } from "bun";

export function getRequestId(req: Request): string {
  return req.headers.get("x-request-id") ?? randomUUIDv7();
}

export function withRequestId(response: Response, requestId: string): Response {
  response.headers.set("x-request-id", requestId);
  return response;
}
