import Elysia from "elysia";
import { defineAbilityFor, type AppAbility } from "../abilities/ability.factory.ts";
import type { JwtPayload } from "../models/auth.model.ts";
import type { Action, Subject } from "../abilities/actions.ts";

export const authorize = new Elysia({ name: "authorize" }).derive(
  { as: "scoped" },
  ({ auth }: { auth: JwtPayload }): { ability: AppAbility } => {
    const ability = defineAbilityFor(auth.role, auth.sub);
    return { ability };
  }
);

export function can(action: Action, subject: Subject) {
  return (ctx: { ability: AppAbility; set: { status: number } }) => {
    if (!ctx.ability.can(action, subject)) {
      ctx.set.status = 403;
      throw new Error("FORBIDDEN");
    }
  };
}
