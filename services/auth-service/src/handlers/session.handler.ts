import type { Context } from "elysia";
import { sessionService } from "../services/session.service.ts";
import type { JwtPayload } from "../models/auth.model.ts";

export const sessionHandler = {
  async listSessions(ctx: Context & { auth: JwtPayload }) {
    const sessions = await sessionService.getUserSessions(ctx.auth.sub);
    return { success: true, data: { sessions } };
  },

  async revokeSession(ctx: Context & { auth: JwtPayload; params: { id: string } }) {
    await sessionService.invalidateSession(ctx.params.id);
    return { success: true, data: { message: "Session revoked" } };
  },
};
