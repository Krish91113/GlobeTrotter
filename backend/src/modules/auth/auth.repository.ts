import { prisma } from '../../database/prisma';
import type { User, Session } from '../../generated/prisma/client';

export class AuthRepository {
  async createUser(
    email: string,
    passwordHash: string,
    displayName: string
  ): Promise<User> {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUserLastLogin(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async createSession(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }

  async findSessionByTokenHash(tokenHash: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { tokenHash },
    });
  }

  async deleteSession(tokenHash: string): Promise<Session> {
    return prisma.session.delete({
      where: { tokenHash },
    });
  }

  async deleteUserSessions(userId: string): Promise<{ count: number }> {
    return prisma.session.deleteMany({
      where: { userId },
    });
  }
}

export const authRepository = new AuthRepository();
