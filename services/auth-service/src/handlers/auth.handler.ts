import type { Context } from "elysia";
import { authService } from "../services/auth.service.ts";
import type { RegisterRequest, LoginRequest, RefreshRequest, JwtPayload } from "../models/auth.model.ts";

function getIpAndUa(headers: Record<string, string | undefined>) {
  return {
    ip: headers["x-forwarded-for"] || headers["x-real-ip"],
    ua: headers["user-agent"],
  };
}

export const authHandler = {
  async register(ctx: Context & { body: RegisterRequest }) {
    const { ip, ua } = getIpAndUa(ctx.headers);
    const result = await authService.register(ctx.body, ip, ua);
    ctx.set.status = 201;
    return { success: true, data: result };
  },

  async login(ctx: Context & { body: LoginRequest }) {
    const { ip, ua } = getIpAndUa(ctx.headers);
    const result = await authService.login(ctx.body, ip, ua);
    return { success: true, data: result };
  },

  async refresh(ctx: Context & { body: RefreshRequest }) {
    const { ip, ua } = getIpAndUa(ctx.headers);
    const tokens = await authService.refresh(ctx.body.refreshToken, ip, ua);
    return { success: true, data: { tokens } };
  },

  async logout(ctx: Context) {
    const token = ctx.headers.authorization?.slice(7);
    if (token) {
      await authService.logout(token);
    }
    return { success: true, data: { message: "Logged out successfully" } };
  },

  async me(ctx: Context & { auth: JwtPayload }) {
    const token = ctx.headers.authorization?.slice(7);
    if (!token) {
      ctx.set.status = 401;
      return { success: false, error: "Missing token" };
    }
    const user = await authService.me(token);
    if (!user) {
      ctx.set.status = 401;
      return { success: false, error: "Invalid session" };
    }
    return { success: true, data: { user } };
  },
};
