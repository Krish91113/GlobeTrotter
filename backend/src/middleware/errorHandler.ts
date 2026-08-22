import { Request, Response, NextFunction } from 'express';
import { AppError as ServiceAppError } from '../lib/errors';
import { AppError as DomainAppError } from '../errors/AppError';
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

  const requestId = String(req.id ?? '');

  // Handle known AppError instances thrown by services/middleware
  if (err instanceof ServiceAppError) {
    logger.warn(
      {
        requestId,
        code: err.code,
        path: req.path,
        method: req.method,
      },
      err.message
    );

    res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      requestId,
    });
    return;
  }

  if (err instanceof DomainAppError) {
    logger.warn(
      {
        requestId,
        code: err.code,
        path: req.path,
        method: req.method,
      },
      err.message
    );

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fieldErrors && Object.keys(err.fieldErrors).length > 0
          ? { fieldErrors: err.fieldErrors }
          : {}),
      },
      requestId: err.requestId ?? requestId,
    });
    return;
  }

  // Handle unknown errors
  logger.error(
    {
      requestId,
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
    requestId,
  });
};
