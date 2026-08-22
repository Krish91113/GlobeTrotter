import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { getEnv } from "../config/env";

const env = getEnv();

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role?: string;
}

export interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function generateRefreshToken(): string {
  // Random 32-byte token for refresh
  return randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
  // SHA-256 hash of refresh token for storage
  return createHash("sha256").update(token).digest("hex");
}
