import { HttpStatus } from "@bun-playground/shared-types";
import type { ServiceResponse, PaginatedResponse } from "@bun-playground/shared-types";
import { createErrorResponse, getRequestId } from "@bun-playground/shared-utils";
import * as userService from "../services/user.service.ts";
import type { User } from "../models/user.model.ts";

const SERVICE = "user-service";

function jsonResponse<T>(data: T, status = 200, requestId?: string): Response {
  const body: ServiceResponse<T> = {
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      service: SERVICE,
    },
  };
  return Response.json(body, { status });
}

export async function listUsers(req: Request): Promise<Response> {
  const requestId = getRequestId(req);
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const limit = Number(url.searchParams.get("limit") ?? 20);

  const { users, pagination } = await userService.getUsers({ page, limit });

  const body: PaginatedResponse<User> = {
    success: true,
    data: users,
    pagination,
    meta: { requestId, timestamp: new Date().toISOString(), service: SERVICE },
  };

  return Response.json(body);
}

export async function getUser(req: Request & { params: { id: string } }): Promise<Response> {
  const requestId = getRequestId(req);
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    return createErrorResponse(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found", SERVICE, requestId);
  }

  return jsonResponse(user, 200, requestId);
}

export async function createUser(req: Request): Promise<Response> {
  const requestId = getRequestId(req);

  const body = await req.json();
  if (!body.email || !body.name) {
    return createErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "email and name are required", SERVICE, requestId);
  }

  try {
    const user = await userService.createUser(body);
    return jsonResponse(user, HttpStatus.CREATED, requestId);
  } catch (error) {
    if ((error as Error).message === "USER_EXISTS") {
      return createErrorResponse(HttpStatus.CONFLICT, "USER_EXISTS", "A user with this email already exists", SERVICE, requestId);
    }
    throw error;
  }
}

export async function updateUser(req: Request & { params: { id: string } }): Promise<Response> {
  const requestId = getRequestId(req);
  const body = await req.json();

  try {
    const user = await userService.updateUser(req.params.id, body);
    if (!user) {
      return createErrorResponse(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found", SERVICE, requestId);
    }
    return jsonResponse(user, 200, requestId);
  } catch (error) {
    if ((error as Error).message === "EMAIL_TAKEN") {
      return createErrorResponse(HttpStatus.CONFLICT, "EMAIL_TAKEN", "This email is already in use", SERVICE, requestId);
    }
    throw error;
  }
}

export async function deleteUser(req: Request & { params: { id: string } }): Promise<Response> {
  const requestId = getRequestId(req);
  const deleted = await userService.deleteUser(req.params.id);

  if (!deleted) {
    return createErrorResponse(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found", SERVICE, requestId);
  }

  return new Response(null, { status: HttpStatus.NO_CONTENT });
}
