export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTH_REQUIRED"
  | "AUTH_INVALID"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | string; // Allow domain-specific errors like TRIP_DATE_INVALID

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly fieldErrors?: Record<string, string[]>;
  public readonly requestId?: string;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number,
    fieldErrors?: Record<string, string[]>,
    requestId?: string,
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    fieldErrors?: Record<string, string[]>,
    requestId?: string,
  ) {
    super("VALIDATION_ERROR", message, 400, fieldErrors, requestId);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthRequiredError extends AppError {
  constructor(message: string = "Authentication required", requestId?: string) {
    super("AUTH_REQUIRED", message, 401, undefined, requestId);
    Object.setPrototypeOf(this, AuthRequiredError.prototype);
  }
}

export class AuthInvalidError extends AppError {
  constructor(message: string = "Invalid credentials", requestId?: string) {
    super("AUTH_INVALID", message, 401, undefined, requestId);
    Object.setPrototypeOf(this, AuthInvalidError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden", requestId?: string) {
    super("FORBIDDEN", message, 403, undefined, requestId);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", requestId?: string) {
    super("NOT_FOUND", message, 404, undefined, requestId);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", requestId?: string) {
    super("CONFLICT", message, 409, undefined, requestId);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class RateLimitedError extends AppError {
  constructor(message: string = "Rate limit exceeded", requestId?: string) {
    super("RATE_LIMITED", message, 429, undefined, requestId);
    Object.setPrototypeOf(this, RateLimitedError.prototype);
  }
}

export class InternalError extends AppError {
  constructor(message: string = "Internal server error", requestId?: string) {
    super("INTERNAL_ERROR", message, 500, undefined, requestId);
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}
