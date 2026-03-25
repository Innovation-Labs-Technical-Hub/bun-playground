import { listUsers, getUser, createUser, updateUser, deleteUser } from "../handlers/user.handler.ts";

export const userRoutes = {
  "/api/users": {
    GET: listUsers,
    POST: createUser,
  },
  "/api/users/:id": {
    GET: getUser,
    PUT: updateUser,
    DELETE: deleteUser,
  },
} as const;
