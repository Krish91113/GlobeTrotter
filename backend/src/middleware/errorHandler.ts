import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";
import { AppError as LegacyAppError } from "../errors/AppError";
import { logger } from "../lib/logger";

/**
 * Global error handler - must be registered last in middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    next(err);
    return;
  }

  // Handle known AppError instances
  if (err instanceof AppError || err instanceof LegacyAppError) {
    const httpStatus =
      err instanceof AppError ? err.httpStatus : err.statusCode;
    const details =
      err instanceof AppError ? err.details : err.fieldErrors;

    logger.warn(
      {
        requestId: req.id,
        code: err.code,
        path: req.path,
        method: req.method,
      },
      err.message,
    );

    const errorDetails =
      details && typeof details === "object" ? details : undefined;

    res.status(httpStatus).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: String(req.id),
        ...(errorDetails && { details: errorDetails }),
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
    "Unhandled error",
  );

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      requestId: String(req.id),
    },
  });
};
