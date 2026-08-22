import type { NextFunction, Request, Response } from "express";
import { AuthRequiredError } from "../errors/AppError";
import { getAccessTokenFromCookies } from "../lib/cookies";
import { verifyAccessToken } from "../lib/jwt";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = getAccessTokenFromCookies(req);

  if (!token) {
    throw new AuthRequiredError("No access token provided", String(req.id));
  }

  try {
    const payload = verifyAccessToken(token);
    // `id` is the canonical field used across modules; keep userId for
    // backwards compatibility with existing auth consumers.
    req.user = {
      id: payload.userId,
      userId: payload.userId,
      email: payload.email,
    };
    next();
  } catch {
    throw new AuthRequiredError(
      "Invalid or expired access token",
      String(req.id),
    );
  }
}
