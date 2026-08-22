import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { createError } from "../lib/errors";

/**
 * Validates request body against a Zod schema
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = createError(
        "VALIDATION_ERROR",
        "Request validation failed",
        result.error.flatten(),
      );
      next(error);
      return;
    }

    req.body = result.data;
    next();
  };
};

/**
 * Validates request query parameters against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const error = createError(
        "VALIDATION_ERROR",
        "Query parameter validation failed",
        result.error.flatten(),
      );
      next(error);
      return;
    }

    // Express 5 exposes `req.query` through a read-only getter. Assigning the
    // parsed value back to it throws a TypeError and turns valid requests into
    // 500 responses. Keep the validated/coerced value in res.locals instead.
    res.locals.validatedQuery = result.data;
    next();
  };
};

/**
 * Validates request URL parameters against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const error = createError(
        "VALIDATION_ERROR",
        "URL parameter validation failed",
        result.error.flatten(),
      );
      next(error);
      return;
    }

    req.params = result.data as typeof req.params;
    next();
  };
};
