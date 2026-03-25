import Elysia from "elysia";
import { tokenService } from "../services/token.service.ts";
import type { JwtPayload } from "../models/auth.model.ts";

export const authenticate = new Elysia({ name: "authenticate" }).derive(
  { as: "scoped" },
  async ({ headers, set }): Promise<{ auth: JwtPayload }> => {
    const authorization = headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error("MISSING_TOKEN");
    }

    const token = authorization.slice(7);
    const payload = await tokenService.verifyAccessToken(token);
    if (!payload) {
      set.status = 401;
      throw new Error("INVALID_TOKEN");
    }

    return { auth: payload };
  }
);
