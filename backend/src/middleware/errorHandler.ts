import type { NextFunction, Request, Response } from "express";
import { AppError as LibAppError } from "../lib/errors";
import { AppError as DomainAppError } from "../errors/AppError";
import { logger } from "../lib/logger";

/**
 * Global error handler - must be registered last in middleware chain
 * Handles both lib/errors/AppError and errors/AppError variants.
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

  // Handle the domain-level AppError (errors/AppError.ts) — used by newer middleware
  if (err instanceof DomainAppError) {
    logger.warn(
      {
        requestId: req.id,
        code: err.code,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
      },
      err.message,
    );

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        fieldErrors: err.fieldErrors,
      },
      requestId: String(req.id),
    });
    return;
  }

  // Handle the lib-level AppError (lib/errors.ts) — used by older code
  if (err instanceof LibAppError) {
    logger.warn(
      {
        requestId: req.id,
        code: err.code,
        httpStatus: err.httpStatus,
        path: req.path,
        method: req.method,
      },
      err.message,
    );

    const details =
      err.details && typeof err.details === "object" ? err.details : undefined;

    res.status(err.httpStatus).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
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
    "Unhandled error",
  );

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
    requestId: String(req.id),
  });
};
