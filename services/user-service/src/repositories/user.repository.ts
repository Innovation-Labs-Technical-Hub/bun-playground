import { Database } from "bun:sqlite";
import { randomUUIDv7 } from "bun";
import type { User, CreateUserInput, UpdateUserInput } from "../models/user.model.ts";

const db = new Database(process.env.DB_PATH ?? "users.db");

// Initialize schema
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string,
    role: row.role as "admin" | "user",
    active: Boolean(row.active),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function findAll(page = 1, limit = 20): { users: User[]; total: number } {
  const offset = (page - 1) * limit;
  const total = db.query<{ count: number }, []>("SELECT COUNT(*) as count FROM users").get()!.count;
  const rows = db.query("SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?").all(limit, offset);
  return { users: (rows as Record<string, unknown>[]).map(rowToUser), total };
}

export function findById(id: string): User | null {
  const row = db.query("SELECT * FROM users WHERE id = ?").get(id);
  return row ? rowToUser(row as Record<string, unknown>) : null;
}

export function findByEmail(email: string): User | null {
  const row = db.query("SELECT * FROM users WHERE email = ?").get(email);
  return row ? rowToUser(row as Record<string, unknown>) : null;
}

export function create(input: CreateUserInput): User {
  const id = randomUUIDv7();
  const now = new Date().toISOString();

  db.run(
    "INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    [id, input.email, input.name, input.role ?? "user", now, now],
  );

  return findById(id)!;
}

export function update(id: string, input: UpdateUserInput): User | null {
  const existing = findById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.email !== undefined) { fields.push("email = ?"); values.push(input.email); }
  if (input.name !== undefined) { fields.push("name = ?"); values.push(input.name); }
  if (input.role !== undefined) { fields.push("role = ?"); values.push(input.role); }
  if (input.active !== undefined) { fields.push("active = ?"); values.push(input.active ? 1 : 0); }

  if (fields.length === 0) return existing;

  fields.push("updated_at = ?");
  values.push(new Date().toISOString());
  values.push(id);

  db.run(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return findById(id);
}

export function remove(id: string): boolean {
  const result = db.run("DELETE FROM users WHERE id = ?", [id]);
  return result.changes > 0;
}
