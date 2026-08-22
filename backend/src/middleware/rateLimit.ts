import type { Request, Response, NextFunction } from 'express';
import { RateLimitedError } from '../errors/AppError';

interface RateLimitStore {
  [key: string]: { attempts: number; resetAt: number };
}

const store: RateLimitStore = {};

export function createRateLimiter(maxAttempts: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();

    // Clean up old entries
    if (store[key] && store[key].resetAt < now) {
      delete store[key];
    }

    // Initialize or update
    if (!store[key]) {
      store[key] = { attempts: 1, resetAt: now + windowMs };
      next();
    } else if (store[key].attempts < maxAttempts) {
      store[key].attempts += 1;
      next();
    } else {
      const resetInSeconds = Math.ceil((store[key].resetAt - now) / 1000);
      throw new RateLimitedError(
        `Too many attempts. Please try again in ${resetInSeconds} seconds.`,
        String(req.id)
      );
    }
  };
}

// Specific limiters
export const loginLimiter = createRateLimiter(10, 15 * 60 * 1000); // 10 attempts per 15 minutes
export const registerLimiter = createRateLimiter(5, 60 * 60 * 1000); // 5 attempts per hour
