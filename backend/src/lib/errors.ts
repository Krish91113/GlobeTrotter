export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "AUTH_INVALID"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "TRIP_DATE_INVALID"
  | "ITINERARY_OVERLAP"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export const ERROR_CODES: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  AUTH_REQUIRED: 401,
  AUTH_INVALID: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TRIP_DATE_INVALID: 422,
  ITINERARY_OVERLAP: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = ERROR_CODES[code];
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export function createError(
  code: ErrorCode,
  messageOverride?: string,
  details?: unknown,
): AppError {
  const defaultMessages: Record<ErrorCode, string> = {
    VALIDATION_ERROR: "Validation failed",
    AUTH_REQUIRED: "Authentication required",
    AUTH_INVALID: "Invalid credentials",
    FORBIDDEN: "You do not have permission to access this resource",
    NOT_FOUND: "Resource not found",
    CONFLICT: "Resource already exists",
    TRIP_DATE_INVALID: "Invalid trip dates",
    ITINERARY_OVERLAP: "Itinerary items overlap",
    RATE_LIMITED: "Too many requests",
    INTERNAL_ERROR: "An unexpected error occurred",
  };

  const message = messageOverride || defaultMessages[code];
  return new AppError(code, message, details);
}
