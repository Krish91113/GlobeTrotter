import type { Request, Response, NextFunction } from 'express';
import type { AccessTokenPayload } from '../lib/jwt';
import { AuthRequiredError } from '../errors/AppError';
import { verifyAccessToken } from '../lib/jwt';
import { getAccessTokenFromCookies } from '../lib/cookies';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getAccessTokenFromCookies(req);

  if (!token) {
    throw new AuthRequiredError('No access token provided', String(req.id));
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
  } catch (_err) {
    throw new AuthRequiredError('Invalid or expired access token', String(req.id));
  }
}
