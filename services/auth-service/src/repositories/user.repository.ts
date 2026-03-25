import { prisma } from "../prisma.ts";
import type { Role } from "@prisma/client";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role?: Role;
  }) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isActive: boolean;
  }>) {
    return prisma.user.update({ where: { id }, data });
  },

  async exists(email: string) {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  },
};
