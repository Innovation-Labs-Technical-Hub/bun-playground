import type { BaseEntity } from "@bun-playground/shared-types";

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: "admin" | "user";
  active: boolean;
}

export interface CreateUserInput {
  email: string;
  name: string;
  role?: "admin" | "user";
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: "admin" | "user";
  active?: boolean;
}
