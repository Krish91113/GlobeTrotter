import { authRepository } from './auth.repository';
import { hashPassword, verifyPassword } from '../../lib/password';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
} from '../../lib/jwt';
import {
  ValidationError,
  AuthInvalidError,
  ConflictError,
  NotFoundError,
} from '../../errors/AppError';
import { RegisterRequest, LoginRequest, AuthResponse } from './auth.schema';
import { getEnv } from '../../config/env';

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
  async register(data: RegisterRequest, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new ConflictError('Email already registered', undefined);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await authRepository.createUser(
      data.email,
      passwordHash,
      data.displayName
    );

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
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
      userAgent
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUri: user.profileImageUri,
      },
    };
  }

  async login(data: LoginRequest, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    // Find user
    const user = await authRepository.findUserByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new AuthInvalidError('Invalid email or password', undefined);
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AuthInvalidError('Invalid email or password', undefined);
    }

    // Update last login
    await authRepository.updateUserLastLogin(user.id);

    // Generate tokens
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
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
      userAgent
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUri: user.profileImageUri,
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

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    // Find session
    const session = await authRepository.findSessionByTokenHash(refreshTokenHash);
    if (!session || session.expiresAt < new Date()) {
      throw new AuthInvalidError('Invalid or expired refresh token', undefined);
    }

    // Find user
    const user = await authRepository.findUserById(session.userId);
    if (!user) {
      throw new NotFoundError('User not found', undefined);
    }

    // Generate new access token
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
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
      userAgent
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        profileImageUri: user.profileImageUri,
      },
    };
  }

  async me(userId: string): Promise<AuthResponse> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found', undefined);
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileImageUri: user.profileImageUri,
    };
  }
}

export const authService = new AuthService();
