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

