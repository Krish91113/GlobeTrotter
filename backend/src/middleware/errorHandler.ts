import type { Request, Response, NextFunction } from 'express';
import { AppError, InternalError } from '../errors/AppError';
import { errorResponse } from '../lib/apiResponse';
import { logger } from '../lib/logger';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    errorResponse(
      res,
      err.code,
      err.message,
      err.statusCode,
      err.fieldErrors,
      req.id
    );
  } else {
    // Log unexpected errors with full stack
    logger.error(
      { err, requestId: req.id },
      'Unexpected error'
    );

    const internalError = new InternalError(
      'An unexpected error occurred. Please try again later.',
      req.id
    );
    errorResponse(
      res,
      internalError.code,
      internalError.message,
      internalError.statusCode,
      undefined,
      req.id
    );
  }
}
