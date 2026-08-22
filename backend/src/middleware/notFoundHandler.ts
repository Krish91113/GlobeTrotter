import type { Request, Response } from 'express';
import { NotFoundError } from '../errors/AppError';

export function notFoundHandler(req: Request, _res: Response): void {
  throw new NotFoundError(`Route ${req.method} ${req.path} not found`, req.id);
}
