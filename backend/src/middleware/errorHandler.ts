import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

/**
 * Global error handler - must be registered last in middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    next(err);
    return;
  }

  // Handle known AppError instances
  if (err instanceof AppError) {
    logger.warn(
      {
        requestId: req.id,
        code: err.code,
        path: req.path,
        method: req.method,
      },
      err.message
    );

    const details =
      err.details && typeof err.details === 'object' ? err.details : undefined;

    res.status(err.httpStatus).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: String(req.id),
        ...(details && { details }),
      },
    });
    return;
  }

  // Handle unknown errors
  logger.error(
    {
      requestId: req.id,
      path: req.path,
      method: req.method,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    },
    'Unhandled error'
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
      requestId: String(req.id),
    },
  });
};