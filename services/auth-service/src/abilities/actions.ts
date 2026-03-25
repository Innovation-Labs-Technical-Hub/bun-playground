export const Actions = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
  MANAGE: "manage",
} as const;

export type Action = (typeof Actions)[keyof typeof Actions];

export const Subjects = {
  USER: "User",
  SESSION: "Session",
  ALL: "all",
} as const;

export type Subject = (typeof Subjects)[keyof typeof Subjects] | "all";
