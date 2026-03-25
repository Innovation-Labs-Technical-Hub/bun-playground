import type { ID, Timestamp } from "../types/common.types.ts";

export const USER_EVENTS = {
  CREATED: "user.created",
  UPDATED: "user.updated",
  DELETED: "user.deleted",
} as const;

export type UserEventType = (typeof USER_EVENTS)[keyof typeof USER_EVENTS];

export interface UserEvent {
  type: UserEventType;
  payload: {
    userId: ID;
    timestamp: Timestamp;
    data?: Record<string, unknown>;
  };
}
