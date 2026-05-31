/**
 * API Response Types
 * 
 * Common types for API request/response handling
 */

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  detail?: string | ApiValidationError[];
  message?: string;
  [key: string]: unknown;
}

/**
 * Validation error item (FastAPI style)
 */
export interface ApiValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Login response structure
 */
export interface LoginResponse {
  access_token: string;
  expiretime: string;
  token_type?: string;
  user_info?: {
    full_name: string;
    email: string;
    branches: Array<{
      branch_id: number;
      branch_name: string;
      roles: string[];
    }>;
  };
}

/**
 * Extended Error class with API-specific properties
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    // Maintain prototype chain
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Type guard to check if error response has detail field
 */
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    ("detail" in data || "message" in data)
  );
}

/**
 * Type guard to check if error response has validation errors
 */
export function isValidationErrorResponse(
  data: unknown
): data is { detail: ApiValidationError[] } {
  return (
    isApiErrorResponse(data) &&
    Array.isArray(data.detail) &&
    data.detail.length > 0 &&
    typeof data.detail[0] === "object" &&
    data.detail[0] !== null &&
    "loc" in data.detail[0] &&
    "msg" in data.detail[0]
  );
}

function extractMessageFromPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const obj = payload as Record<string, unknown>;

  if (typeof obj.message === "string" && obj.message.trim()) {
    return obj.message;
  }

  if (typeof obj.detail === "string" && obj.detail.trim()) {
    return obj.detail;
  }

  if (obj.error && typeof obj.error === "object") {
    const nested = obj.error as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message;
    }
  }

  return undefined;
}

/** Returns true when an API payload explicitly reports failure via success: false. */
export function isApiFailurePayload(payload: unknown): boolean {
  if (!payload || typeof payload !== "object") return false;

  const obj = payload as Record<string, unknown>;
  if (!("success" in obj)) return false;

  return obj.success === false || obj.success === "false" || obj.success === 0;
}

/** Extract a human-readable error message from API errors or failure payloads. */
export function extractApiErrorMessage(
  errorOrResponse: unknown,
  fallback = "An error occurred"
): string {
  if (!errorOrResponse) return fallback;

  if (errorOrResponse instanceof ApiError) {
    const fromData = extractMessageFromPayload(errorOrResponse.data);
    if (fromData) return fromData;
    if (errorOrResponse.message.trim()) return errorOrResponse.message;
    return fallback;
  }

  if (typeof errorOrResponse === "object" && errorOrResponse !== null) {
    const obj = errorOrResponse as Record<string, unknown>;

    if ("data" in obj) {
      const fromData = extractMessageFromPayload(obj.data);
      if (fromData) return fromData;
    }

    const fromPayload = extractMessageFromPayload(obj);
    if (fromPayload) return fromPayload;

    if ("response" in obj && obj.response && typeof obj.response === "object") {
      const response = obj.response as Record<string, unknown>;
      const fromNested = extractMessageFromPayload(response.data);
      if (fromNested) return fromNested;
    }
  }

  if (errorOrResponse instanceof Error) {
    const fromData = extractMessageFromPayload(
      (errorOrResponse as ApiError).data
    );
    if (fromData) return fromData;
    if (
      errorOrResponse.message.trim() &&
      errorOrResponse.message !== "[object Object]"
    ) {
      return errorOrResponse.message;
    }
  }

  return fallback;
}

