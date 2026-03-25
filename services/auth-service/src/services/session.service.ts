import { sessionRepository } from "../repositories/session.repository.ts";
import type { SessionInfo } from "../models/auth.model.ts";

export const sessionService = {
  async createSession(data: {
    userId: string;
    token: string;
    refreshToken: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return sessionRepository.create(data);
  },

  async findValidSession(token: string) {
    const session = await sessionRepository.findByToken(token);
    if (!session) return null;
    if (session.expiresAt < new Date()) {
      await sessionRepository.deleteById(session.id);
      return null;
    }
    return session;
  },

  async findByRefreshToken(refreshToken: string) {
    const session = await sessionRepository.findByRefreshToken(refreshToken);
    if (!session) return null;
    return session;
  },

  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const sessions = await sessionRepository.findByUserId(userId);
    return sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    }));
  },

  async invalidateSession(sessionId: string) {
    return sessionRepository.deleteById(sessionId);
  },

  async invalidateAllUserSessions(userId: string) {
    return sessionRepository.deleteByUserId(userId);
  },

  async cleanupExpiredSessions() {
    return sessionRepository.deleteExpired();
  },
};
