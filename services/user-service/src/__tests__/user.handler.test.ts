import { test, expect, beforeAll, afterAll, describe } from "bun:test";
import { Database } from "bun:sqlite";

// Use in-memory DB for tests
process.env.DB_PATH = ":memory:";
process.env.SERVICE_NAME = "user-service";
process.env.PORT = "0"; // Random port

let baseUrl: string;
let server: ReturnType<typeof Bun.serve>;

beforeAll(async () => {
  // Dynamic import after env is set
  const { default: _ } = await import("../index.ts");
  // We need to start our own server for tests
  const { userRoutes } = await import("../routes/user.routes.ts");
  const { healthCheck, readinessCheck } = await import("../health.ts");

  server = Bun.serve({
    port: 0,
    routes: {
      "/health": { GET: healthCheck },
      "/ready": { GET: readinessCheck },
      ...userRoutes,
    },
    fetch(req) {
      return Response.json({ error: "Not Found" }, { status: 404 });
    },
  });
  baseUrl = `http://localhost:${server.port}`;
});

afterAll(() => {
  server?.stop();
});

describe("Health Checks", () => {
  test("GET /health returns ok", async () => {
    const res = await fetch(`${baseUrl}/health`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  test("GET /ready returns ready", async () => {
    const res = await fetch(`${baseUrl}/ready`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("ready");
  });
});

describe("User CRUD", () => {
  let userId: string;

  test("POST /api/users creates a user", async () => {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", name: "Test User" }),
    });
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.email).toBe("test@example.com");
    userId = body.data.id;
  });

  test("GET /api/users lists users", async () => {
    const res = await fetch(`${baseUrl}/api/users`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThanOrEqual(1);
    expect(body.pagination).toBeDefined();
  });

  test("GET /api/users/:id returns a user", async () => {
    const res = await fetch(`${baseUrl}/api/users/${userId}`);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.id).toBe(userId);
  });

  test("PUT /api/users/:id updates a user", async () => {
    const res = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Name" }),
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.name).toBe("Updated Name");
  });

  test("POST /api/users with duplicate email returns 409", async () => {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", name: "Duplicate" }),
    });
    expect(res.status).toBe(409);
  });

  test("DELETE /api/users/:id deletes a user", async () => {
    const res = await fetch(`${baseUrl}/api/users/${userId}`, {
      method: "DELETE",
    });
    expect(res.status).toBe(204);
  });

  test("GET /api/users/:id returns 404 for deleted user", async () => {
    const res = await fetch(`${baseUrl}/api/users/${userId}`);
    expect(res.status).toBe(404);
  });
});
