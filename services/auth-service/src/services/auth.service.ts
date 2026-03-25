import { userRepository } from "../repositories/user.repository.ts";
import { tokenService } from "./token.service.ts";
import { sessionService } from "./session.service.ts";
import { hashPassword, verifyPassword } from "../utils/password.ts";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  AuthTokens,
  UserPayload,
} from "../models/auth.model.ts";

export const authService = {
  async register(
    data: RegisterRequest,
    ip?: string,
    ua?: string
  ): Promise<AuthResponse> {
    const exists = await userRepository.exists(data.email);
    if (exists) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const passwordHash = await hashPassword(data.password);
    const user = await userRepository.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
    });

    const tokens = await createTokensAndSession(user.id, user.email, user.role, ip, ua);

    return {
      user: toUserPayload(user),
      tokens,
    };
  },

  async login(
    data: LoginRequest,
    ip?: string,
    ua?: string
  ): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.isActive) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const tokens = await createTokensAndSession(user.id, user.email, user.role, ip, ua);

    return {
      user: toUserPayload(user),
      tokens,
    };
  },

  async refresh(refreshToken: string, ip?: string, ua?: string): Promise<AuthTokens> {
    const session = await sessionService.findByRefreshToken(refreshToken);
    if (!session || !session.user.isActive) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    // Invalidate old session
    await sessionService.invalidateSession(session.id);

    // Create new tokens and session
    return createTokensAndSession(
      session.user.id,
      session.user.email,
      session.user.role,
      ip,
      ua
    );
  },

  async logout(token: string): Promise<void> {
    const session = await sessionService.findValidSession(token);
    if (session) {
      await sessionService.invalidateSession(session.id);
    }
  },

  async me(token: string): Promise<UserPayload | null> {
    const session = await sessionService.findValidSession(token);
    if (!session) return null;

    const user = await userRepository.findById(session.userId);
    if (!user || !user.isActive) return null;

    return toUserPayload(user);
  },
};

async function createTokensAndSession(
  userId: string,
  email: string,
  role: string,
  ip?: string,
  ua?: string
): Promise<AuthTokens> {
  const accessToken = await tokenService.generateAccessToken({
    sub: userId,
    email,
    role: role as any,
  });
  const refreshToken = tokenService.generateRefreshToken();
  const expiresAt = tokenService.getRefreshExpiryDate();

  await sessionService.createSession({
    userId,
    token: accessToken,
    refreshToken,
    expiresAt,
    ipAddress: ip,
    userAgent: ua,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: tokenService.getAccessExpirySeconds(),
  };
}

function toUserPayload(user: {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}): UserPayload {
  return {
    id: user.id,
    email: user.email,
    role: user.role as any,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
