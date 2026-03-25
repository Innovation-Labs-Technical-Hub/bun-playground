import type { Role } from "@prisma/client";

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserPayload {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  user: UserPayload;
  tokens: AuthTokens;
}

export interface SessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  expiresAt: Date;
}
