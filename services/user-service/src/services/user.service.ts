import type { PaginationQuery } from "@bun-playground/shared-types";
import * as userRepo from "../repositories/user.repository.ts";
import type { User, CreateUserInput, UpdateUserInput } from "../models/user.model.ts";
import { publishUserEvent } from "../events/user.events.ts";

export async function getUsers(query: PaginationQuery) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const { users, total } = userRepo.findAll(page, limit);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(id: string): Promise<User | null> {
  return userRepo.findById(id);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const existing = userRepo.findByEmail(input.email);
  if (existing) {
    throw new Error("USER_EXISTS");
  }

  const user = userRepo.create(input);
  await publishUserEvent("user.created", user.id, { email: user.email, name: user.name });
  return user;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  if (input.email) {
    const existing = userRepo.findByEmail(input.email);
    if (existing && existing.id !== id) {
      throw new Error("EMAIL_TAKEN");
    }
  }

  const user = userRepo.update(id, input);
  if (user) {
    await publishUserEvent("user.updated", user.id, input);
  }
  return user;
}

export async function deleteUser(id: string): Promise<boolean> {
  const deleted = userRepo.remove(id);
  if (deleted) {
    await publishUserEvent("user.deleted", id);
  }
  return deleted;
}
