import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Attaches a unique request ID to every request
 * Available as req.id and in X-Request-Id response header
 */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id as string);
  next();
};

export const requestIdMiddleware = requestId;
