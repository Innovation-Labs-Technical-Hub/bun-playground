import { test, expect, describe } from "bun:test";
import type { User, CreateUserInput, UpdateUserInput } from "../models/user.model.ts";

describe("User model types", () => {
  test("User has all required fields", () => {
    const user: User = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "user",
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(user.id).toBe("1");
    expect(user.email).toBe("test@example.com");
    expect(user.role).toBe("user");
    expect(user.active).toBe(true);
  });

  test("CreateUserInput requires email and name", () => {
    const input: CreateUserInput = {
      email: "new@example.com",
      name: "New User",
    };

    expect(input.email).toBeDefined();
    expect(input.name).toBeDefined();
    expect(input.role).toBeUndefined();
  });

  test("UpdateUserInput allows partial updates", () => {
    const input: UpdateUserInput = { name: "Updated" };
    expect(input.name).toBe("Updated");
    expect(input.email).toBeUndefined();
    expect(input.role).toBeUndefined();
    expect(input.active).toBeUndefined();
  });
});
