import type { NextFunction, Request, Response } from "express";
import { AuthRequiredError } from "../errors/AppError";
import { getAccessTokenFromCookies } from "../lib/cookies";
import { verifyAccessToken } from "../lib/jwt";

export function getBearerOrCookieToken(req: Request): string | undefined {
  const cookieToken = getAccessTokenFromCookies(req);
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return undefined;
}

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getBearerOrCookieToken(req);

  if (!token) {
    throw new AuthRequiredError("No access token provided", String(req.id));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      userId: payload.userId,
      email: payload.email,
      role: payload.role || "TRAVELER",
    };
    next();
  } catch {
    throw new AuthRequiredError(
      "Invalid or expired access token",
      String(req.id),
    );
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getBearerOrCookieToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      userId: payload.userId,
      email: payload.email,
      role: payload.role || "TRAVELER",
    };
  } catch {
    // Ignore invalid token in optionalAuth
  }

  next();
}

