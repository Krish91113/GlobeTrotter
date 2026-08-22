import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';
import { logger } from '../utils/logger';
import { AppError, CreateUserRequest, AuthToken } from '../types';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: CreateUserRequest) {
    logger.info(`Registering user: ${data.email}`);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError(409, 'User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create user with preferences
    const user = await prisma.user.create({
      data: {
        email: data.email,
        displayName: data.displayName,
        passwordHash,
        preferredLocale: data.preferredLocale || 'en-US',
        isActive: true,
        preferences: {
          create: {
            theme: 'light',
            notificationsEnabled: true,
            emailNotifications: true
          }
        }
      },
      include: { preferences: true }
    });

    logger.info(`User registered: ${user.id}`);

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    logger.info(`Login attempt: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(403, 'User account is inactive');
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET || 'secret',
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: await this.hashToken(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    logger.info(`User logged in: ${user.id}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      token,
      sessionId: session.id
    };
  }

  /**
   * Verify JWT token
   */
  static async verifyToken(token: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'secret'
      ) as AuthToken;

      // Check if session exists
      const session = await prisma.session.findFirst({
        where: {
          userId: decoded.userId,
          tokenHash: await this.hashToken(token),
          expiresAt: { gt: new Date() }
        }
      });

      if (!session) {
        throw new AppError(401, 'Session expired');
      }

      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new AppError(401, 'Invalid token');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string, token: string) {
    logger.info(`Logout: ${userId}`);

    const tokenHash = await this.hashToken(token);

    await prisma.session.deleteMany({
      where: {
        userId,
        tokenHash
      }
    });
  }

  /**
   * Get user with preferences
   */
  static async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { preferences: true }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      profileImageUri?: string;
      preferredLocale?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: { preferences: true }
    });

    logger.info(`Profile updated: ${userId}`);
    return user;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.passwordHash) {
      throw new AppError(404, 'User not found');
    }

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isValid) {
      throw new AppError(401, 'Invalid current password');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    logger.info(`Password changed: ${userId}`);
  }

  /**
   * Hash token for storage
   */
  private static async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}
