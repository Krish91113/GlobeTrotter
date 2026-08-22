import type { Request, Response, NextFunction } from 'express';
import type { AccessTokenPayload } from '../lib/jwt';
import { AuthRequiredError } from '../errors/AppError';
import { verifyAccessToken } from '../lib/jwt';
import { getAccessTokenFromCookies } from '../lib/cookies';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = getAccessTokenFromCookies(req);

  if (!token) {
    throw new AuthRequiredError('No access token provided', req.id);
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (_err) {
    throw new AuthRequiredError('Invalid or expired access token', req.id);
  }
}
