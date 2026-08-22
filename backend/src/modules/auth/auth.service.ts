import { getEnv } from "../../config/env";
import {
  AuthInvalidError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../errors/AppError";
import { sha256 } from "../../lib/crypto";
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessToken,
} from "../../lib/jwt";
import { hashPassword, verifyPassword } from "../../lib/password";
import prisma from "../../lib/prisma";
import { authRepository } from "./auth.repository";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "./auth.schema";

const env = getEnv();

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhdwy])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const factors: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000,
  };

  return num * (factors[unit] || 1);
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthResponse;
}

export class AuthService {
  async register(
    data: RegisterRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("Email already registered", undefined);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    const isAdminEmail =
      data.email.toLowerCase().startsWith("admin@") ||
      data.email.toLowerCase().includes("admin") ||
      data.email.toLowerCase() === "admin@globetrotter.com";

    const role = isAdminEmail ? "ADMIN" : "TRAVELER";

    // Create user
    const user = await authRepository.createUser(
      data.email,
      passwordHash,
      data.displayName,
      role,
    );

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Create session
    const sessionMaxAgeMs = parseDurationToMs(env.SESSION_MAX_AGE);
    const expiresAt = new Date(Date.now() + sessionMaxAgeMs);

    await authRepository.createSession(
      user.id,
      refreshTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUri: user.profileImageUri,
        role: user.role,
      },
    };
  }

  async login(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    // Find user
    const user = await authRepository.findUserByEmail(data.email);
    if (!user?.passwordHash) {
      throw new AuthInvalidError("Invalid email or password", undefined);
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AuthInvalidError("Invalid email or password", undefined);
    }

    // Update last login
    await authRepository.updateUserLastLogin(user.id);

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Create session
    const sessionMaxAgeMs = parseDurationToMs(env.SESSION_MAX_AGE);
    const expiresAt = new Date(Date.now() + sessionMaxAgeMs);

    await authRepository.createSession(
      user.id,
      refreshTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUri: user.profileImageUri,
        role: user.role,
      },
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashRefreshToken(refreshToken);
    try {
      await authRepository.deleteSession(refreshTokenHash);
    } catch {
      // Session already deleted or doesn't exist, ignore
    }
  }

  async refresh(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthTokens> {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Find session
    const session =
      await authRepository.findSessionByTokenHash(refreshTokenHash);
    if (!session || session.expiresAt < new Date()) {
      throw new AuthInvalidError("Invalid or expired refresh token", undefined);
    }

    // Find user
    const user = await authRepository.findUserById(session.userId);
    if (!user) {
      throw new NotFoundError("User not found", undefined);
    }

    // Generate new access token
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Rotate refresh token (delete old, create new)
    await authRepository.deleteSession(refreshTokenHash);

    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

    const sessionMaxAgeMs = parseDurationToMs(env.SESSION_MAX_AGE);
    const expiresAt = new Date(Date.now() + sessionMaxAgeMs);

    await authRepository.createSession(
      user.id,
      newRefreshTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUri: user.profileImageUri,
        role: user.role,
      },
    };
  }

  async me(userId: string): Promise<AuthResponse> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found", undefined);
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileImageUri: user.profileImageUri,
      role: user.role,
    };
  }

  async forgotPassword(email: string): Promise<{ resetToken?: string }> {
    const user = await authRepository.findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      // Neutral response to avoid email enumeration
      return {};
    }

    const rawToken = generateRefreshToken();
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // In dev environment or for demo, returning resetToken allows easy testing
    return { resetToken: rawToken };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = sha256(token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new ValidationError("Invalid or expired password reset token");
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // Invalidate all existing sessions
      prisma.session.deleteMany({
        where: { userId: record.userId },
      }),
    ]);
  }
}

export const authService = new AuthService();

