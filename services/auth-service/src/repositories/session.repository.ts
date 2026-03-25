import { prisma } from "../prisma.ts";

export const sessionRepository = {
  async create(data: {
    userId: string;
    token: string;
    refreshToken: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.session.create({ data });
  },

  async findByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
  },

  async findByRefreshToken(refreshToken: string) {
    return prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  },

  async findByUserId(userId: string) {
    return prisma.session.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  },

  async deleteById(id: string) {
    return prisma.session.delete({ where: { id } });
  },

  async deleteByUserId(userId: string) {
    return prisma.session.deleteMany({ where: { userId } });
  },

  async deleteExpired() {
    return prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  },
};
