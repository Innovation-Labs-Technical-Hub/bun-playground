import { AbilityBuilder, createMongoAbility, type MongoAbility } from "@casl/ability";
import type { Role } from "@prisma/client";
import { Actions, type Action, type Subject } from "./actions.ts";

export type AppAbility = MongoAbility<[Action, Subject]>;

export function defineAbilityFor(role: Role, userId: string): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (role) {
    case "ADMIN":
      can(Actions.MANAGE, "all");
      break;

    case "MODERATOR":
      can(Actions.READ, "all");
      can(Actions.UPDATE, "User");
      can(Actions.MANAGE, "Session");
      break;

    case "USER":
      can(Actions.READ, "User", { id: userId });
      can(Actions.UPDATE, "User", { id: userId });
      can(Actions.MANAGE, "Session", { userId });
      break;
  }

  return build();
}
