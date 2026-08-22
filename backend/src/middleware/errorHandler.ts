import { Request, Response, NextFunction } from 'express';
import { AppError as LegacyAppError } from '../lib/errors';
import { AppError } from '../errors/AppError';
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
  if (err instanceof AppError || err instanceof LegacyAppError) {
    const statusCode =
      'statusCode' in err ? err.statusCode : err.httpStatus;
    const fieldErrors =
      'fieldErrors' in err ? err.fieldErrors : undefined;
    const details =
      'details' in err && err.details && typeof err.details === 'object'
        ? err.details
        : undefined;
    logger.warn(
      {
        requestId: req.id,
        code: err.code,
        path: req.path,
        method: req.method,
      },
      err.message
    );

    res.status(statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(fieldErrors && { fieldErrors }),
        ...(details && { details }),
      },
      requestId: String(req.id),
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
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
    requestId: String(req.id),
  });
};
