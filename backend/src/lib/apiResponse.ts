import type { Response } from "express";

export interface SuccessEnvelope<T = any> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
  requestId?: string;
}

export function ok<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: Record<string, any>,
): Response {
  const response: SuccessEnvelope<T> = {
    success: true,
    data,
    meta,
  };
  return res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode: number,
  fieldErrors?: Record<string, string[]>,
  requestId?: string,
): Response {
  const response: ErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      fieldErrors,
    },
    requestId,
  };
  return res.status(statusCode).json(response);
}
