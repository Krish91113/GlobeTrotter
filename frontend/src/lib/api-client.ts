/* ──────────────────────────────────────────────────────────
 * GlobeTrotter — Custom API Client
 * Type-safe fetch wrapper with credentials (HTTP-only cookies),
 * automatic error normalization, and standard envelope unpacking.
 * ────────────────────────────────────────────────────────── */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
  requestId?: string;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly fieldErrors?: Record<string, string[]>;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number,
    code: string = "UNKNOWN_ERROR",
    fieldErrors?: Record<string, string[]>,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const DEFAULT_BASE_URL = "http://localhost:3001/api/v1";

export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_BASE_URL;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Required for HTTP-only cookies (gt_access, gt_refresh)
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (err: any) {
    throw new ApiError(
      err?.message || "Unable to connect to server. Please check your network.",
      0,
      "NETWORK_ERROR"
    );
  }

  // Access tokens are intentionally short-lived. Refresh once using the
  // HTTP-only refresh cookie, then replay the original request transparently.
  if (response.status === 401 && !path.startsWith("/auth/")) {
    const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
    });
    if (refreshResponse.ok) {
      response = await fetch(url, config);
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(
        response.statusText || "An unexpected error occurred",
        response.status,
        "HTTP_ERROR"
      );
    }
    return {} as T;
  }

  if (!response.ok || json.success === false) {
    const errorDetails = json.error;
    let message = errorDetails?.message || "An unexpected error occurred";

    // Map common error codes to friendly messages
    if (errorDetails?.code === "AUTH_INVALID") {
      message = "Invalid email or password";
    } else if (errorDetails?.code === "CONFLICT") {
      message = "An account with this email already exists";
    } else if (errorDetails?.code === "AUTH_REQUIRED") {
      message = "Please sign in to continue";
    }

    throw new ApiError(
      message,
      response.status,
      errorDetails?.code || "REQUEST_FAILED",
      errorDetails?.fieldErrors,
      json.requestId
    );
  }

  return json.data;
}
