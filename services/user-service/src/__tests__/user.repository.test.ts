import { test, expect, describe, beforeEach } from "bun:test";
import { randomUUIDv7 } from "bun";
import * as userRepo from "../repositories/user.repository.ts";

function uniqueEmail() {
  return `test-${randomUUIDv7()}@example.com`;
}

describe("user.repository", () => {
  let testUserId: string;
  let testEmail: string;

  beforeEach(() => {
    testEmail = uniqueEmail();
    const user = userRepo.create({
      email: testEmail,
      name: "Repo Test User",
    });
    testUserId = user.id;
  });

  test("create returns a user with generated id", () => {
    const user = userRepo.create({
      email: uniqueEmail(),
      name: "Created User",
      role: "admin",
    });

    expect(user.id).toBeDefined();
    expect(user.name).toBe("Created User");
    expect(user.role).toBe("admin");
    expect(user.active).toBe(true);
  });

  test("findById returns the correct user", () => {
    const user = userRepo.findById(testUserId);
    expect(user).not.toBeNull();
    expect(user!.id).toBe(testUserId);
  });

  test("findById returns null for non-existent id", () => {
    const user = userRepo.findById("non-existent-id");
    expect(user).toBeNull();
  });

  test("findByEmail returns user by email", () => {
    const found = userRepo.findByEmail(testEmail);
    expect(found).not.toBeNull();
    expect(found!.id).toBe(testUserId);
  });

  test("findAll returns paginated results", () => {
    const result = userRepo.findAll(1, 10);
    expect(result.users).toBeDefined();
    expect(Array.isArray(result.users)).toBe(true);
    expect(typeof result.total).toBe("number");
    expect(result.total).toBeGreaterThan(0);
  });

  test("update modifies user fields", () => {
    const updated = userRepo.update(testUserId, { name: "Updated Name" });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe("Updated Name");
  });

  test("update returns null for non-existent user", () => {
    const result = userRepo.update("non-existent", { name: "nope" });
    expect(result).toBeNull();
  });

  test("remove deletes the user", () => {
    const deleted = userRepo.remove(testUserId);
    expect(deleted).toBe(true);

    const found = userRepo.findById(testUserId);
    expect(found).toBeNull();
  });

  test("remove returns false for non-existent user", () => {
    const deleted = userRepo.remove("non-existent");
    expect(deleted).toBe(false);
  });
});
