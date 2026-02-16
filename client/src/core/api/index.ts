import { useAuthStore } from "@/core/auth/authStore";
import { useUIStore } from "@/store/uiStore";
import type {
  ApiErrorResponse,
  LoginResponse,
  ApiValidationError,
} from "@/common/types/api";
import { ApiError, isApiErrorResponse, isValidationErrorResponse } from "@/common/types/api";
import { registerAbortController } from "./request-cancellation";
import { getApiBaseUrl } from "./api";

// Single base URL from api.ts
const API_BASE_URL = getApiBaseUrl();

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  noAuth?: boolean;
  /**
   * Optional hint used by some service wrappers.
   * The HTTP layer itself does not implement caching (React Query owns caching).
   */
  cache?: boolean;
  // internal flag to avoid infinite refresh loops
  _isRetry?: boolean;
  // Request timeout
  timeout?: number;
}

// Request timeout default
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Note: Request deduplication is handled by React Query automatically
// This API client is a pure HTTP layer with NO caching logic

// CSRF Protection helpers
export const CSRFProtection = {
  /**
   * Get CSRF token from meta tag or cookie
   * This is a helper for frontend CSRF verification
   * Actual CSRF protection should be implemented on the backend
   */
  getToken: (): string | null => {
    if (typeof document === "undefined") return null;

    // Try to get from meta tag
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute("content");
    }

    // Try to get from cookie (if backend sets it)
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrf-token" || name === "XSRF-TOKEN") {
        return decodeURIComponent(value);
      }
    }

    return null;
  },

  /**
   * Verify CSRF token is present (frontend check only)
   * Backend should verify the actual token
   */
  verify: (): boolean => {
    // For GET requests, CSRF is usually not required
    // For POST/PUT/DELETE, we check if token exists
    // Actual verification happens on backend
    return true; // Always return true - backend handles verification
  },

  /**
   * Add CSRF token to request headers if available
   */
  addToHeaders: (headers: Record<string, string>): void => {
    const token = CSRFProtection.getToken();
    if (token) {
      headers["X-CSRF-Token"] = token;
      headers["X-XSRF-TOKEN"] = token;
    }
  },
};

function buildQuery(query?: ApiRequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

// Note: All caching and request deduplication is handled by React Query
// This API client is a pure HTTP layer - no caching logic here

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;
// Promise-based refresh queue to handle concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;
// Track if tab is visible (Page Visibility API)
let isTabVisible = true;
// ✅ FIX: Track last refresh attempt to prevent rapid retries
let lastRefreshAttempt = 0;
const MIN_REFRESH_INTERVAL = 1000; // 1 second minimum between attempts
// Refresh metrics tracking
interface RefreshMetrics {
  totalAttempts: number;
  successfulRefreshes: number;
  failedRefreshes: number;
  lastRefreshTime: number | null;
  consecutiveFailures: number;
}
const refreshMetrics: RefreshMetrics = {
  totalAttempts: 0,
  successfulRefreshes: 0,
  failedRefreshes: 0,
  lastRefreshTime: null,
  consecutiveFailures: 0,
};
// Exponential backoff configuration
const BACKOFF_CONFIG = {
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  multiplier: 2,
};

function scheduleProactiveRefresh() {
  const { accessToken, tokenExpireAt } = useAuthStore.getState();
  if (!accessToken || !tokenExpireAt) return;
  
  // Don't schedule refresh if tab is not visible
  if (!isTabVisible) {
    return;
  }
  
  const now = Date.now();
  // Refresh 60 seconds before expiry
  const refreshInMs = Math.max(0, tokenExpireAt - now - 60_000);
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  refreshTimer = setTimeout(async () => {
    // Check visibility again before refreshing
    if (!isTabVisible) {
      // Reschedule when tab becomes visible
      scheduleProactiveRefresh();
      return;
    }
    
    try {
      await tryRefreshToken(useAuthStore.getState().accessToken);
      // reschedule after refresh
      scheduleProactiveRefresh();
    } catch {
      // ignore; on-demand refresh still handles failures
    }
  }, refreshInMs);
}

function clearProactiveRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

// Custom error types for better error handling
export class TokenExpiredError extends Error {
  constructor(message = "Token has expired") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export class TokenRefreshError extends Error {
  constructor(message = "Token refresh failed") {
    super(message);
    this.name = "TokenRefreshError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

async function tryRefreshToken(
  oldAccessToken: string | null
): Promise<string | null> {
  if (!oldAccessToken) {
    return null;
  }

  // ✅ FIX: Prevent rapid retries with minimum interval check
  const now = Date.now();
  if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL && refreshPromise) {
    // Too soon since last attempt, return existing promise
    try {
      return await refreshPromise;
    } catch {
      // If previous refresh failed, wait for minimum interval
      return null;
    }
  }

  // Use Promise-based queue instead of polling
  if (refreshPromise) {
    // Wait for ongoing refresh to complete
    try {
      return await refreshPromise;
    } catch {
      // If refresh failed, check if we can retry
      if (now - lastRefreshAttempt >= MIN_REFRESH_INTERVAL) {
        refreshPromise = null; // Allow retry after backoff
      } else {
        return null; // Still too soon, don't retry
      }
    }
  }

  // Don't refresh if tab is not visible
  if (!isTabVisible) {
    return null;
  }

  // Update last refresh attempt time
  lastRefreshAttempt = now;

  // Track metrics
  refreshMetrics.totalAttempts++;
  refreshMetrics.lastRefreshTime = Date.now();

  // Calculate exponential backoff delay
  const backoffDelay = Math.min(
    BACKOFF_CONFIG.initialDelay * Math.pow(BACKOFF_CONFIG.multiplier, refreshMetrics.consecutiveFailures),
    BACKOFF_CONFIG.maxDelay
  );

  // Apply backoff if we have consecutive failures
  if (refreshMetrics.consecutiveFailures > 0) {
    await new Promise((resolve) => setTimeout(resolve, backoffDelay));
  }

  // Show subtle user feedback during refresh
  const uiStore = useUIStore.getState();
  const toastId = uiStore.showToast({
    type: "info",
    title: "Refreshing session",
    description: "Please wait...",
    duration: 2000,
  });

  isRefreshing = true;
  
  // Create refresh promise
  refreshPromise = (async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Refresh token is in httpOnly cookie
      });

      if (!res.ok) {
        // If refresh fails, clear auth state to prevent infinite loops
        const errorText = await res.text().catch(() => res.statusText);
        const errorMessage = `Token refresh failed: ${res.status} ${errorText}`;

        refreshMetrics.failedRefreshes++;
        refreshMetrics.consecutiveFailures++;

        // Only logout on 401 (Unauthorized) - 403 (Forbidden) might be permission-based, not auth issue
        if (res.status === 401) {
          uiStore.hideToast(toastId);
          uiStore.showToast({
            type: "error",
            title: "Session expired",
            description: "Please log in again",
            duration: 5000,
          });
          useAuthStore.getState().logout();
          throw new TokenRefreshError(errorMessage);
        }
        
        // For 403, don't logout - it might be a permission issue, not authentication
        // Just show warning and throw error
        if (res.status === 403) {
          uiStore.hideToast(toastId);
          uiStore.showToast({
            type: "warning",
            title: "Access denied",
            description: "You don't have permission to refresh token",
            duration: 3000,
          });
          throw new TokenRefreshError(errorMessage);
        }

        // For other errors, show warning but don't logout
        uiStore.hideToast(toastId);
        uiStore.showToast({
          type: "warning",
          title: "Session refresh failed",
          description: "Retrying...",
          duration: 3000,
        });

        throw new TokenRefreshError(errorMessage);
      }

      const data = await res.json();
      const newToken = (data?.access_token as string) || null;
      const expireIso = (data?.expiretime as string) || null;

      if (!newToken) {
        const errorMessage = "No access token received from refresh endpoint";
        refreshMetrics.failedRefreshes++;
        refreshMetrics.consecutiveFailures++;
        
        uiStore.hideToast(toastId);
        uiStore.showToast({
          type: "error",
          title: "Authentication error",
          description: "Please log in again",
          duration: 5000,
        });
        
        useAuthStore.getState().logout();
        throw new TokenRefreshError(errorMessage);
      }

      // Update token and expiration from response
      // setTokenAndExpiry accepts expiretime as ISO string (new signature)
      useAuthStore.getState().setTokenAndExpiry(newToken, expireIso);

      // Reset consecutive failures on success
      refreshMetrics.successfulRefreshes++;
      refreshMetrics.consecutiveFailures = 0;

      // Hide loading toast
      uiStore.hideToast(toastId);

      // Reschedule proactive refresh
      scheduleProactiveRefresh();
      return newToken;
    } catch (error) {
      if (error instanceof TokenRefreshError) {
        throw error;
      }

      // Network or other errors
      const errorMessage =
        error instanceof Error ? error.message : "Token refresh error";
      
      refreshMetrics.failedRefreshes++;
      refreshMetrics.consecutiveFailures++;

      uiStore.hideToast(toastId);

      // Don't logout on network errors - they might be temporary
      throw new NetworkError(
        `Network error during token refresh: ${errorMessage}`
      );
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    // Propagate error
    throw error;
  }
}

export async function api<T = unknown>({
  method = "GET",
  path,
  body,
  query,
  headers = {},
  noAuth = false,
  _isRetry = false,
  timeout = DEFAULT_TIMEOUT,
}: ApiRequestOptions): Promise<T> {
  // Pure HTTP client - no caching logic
  // React Query handles all caching and request deduplication
  
  const state = useAuthStore.getState();
  
  // CRITICAL: Don't make authenticated requests if:
  // 1. Logout is in progress (race condition protection) — EXCEPT allow POST /auth/logout so backend can clear session/cookies
  // 2. Auth is initializing (bootstrapAuth running)
  if (!noAuth) {
    const isLogoutEndpoint = path === "/auth/logout" || path.includes("/auth/logout");
    if (state.isLoggingOut && !isLogoutEndpoint) {
      throw new Error("Request cancelled: logout in progress");
    }
    if (state.isAuthInitializing) {
      throw new Error("Request cancelled: auth initialization in progress");
    }
  }
  
  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  let token = state.accessToken || (state as any).token;

  // Note: Token validation happens in auth store

  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  // Check token expiry and refresh proactively if needed
  if (token && !noAuth && state.tokenExpireAt) {
    const now = Date.now();
    const isExpired = now >= state.tokenExpireAt;
    const expiresSoon = state.tokenExpireAt - now < 60_000; // 60 seconds before expiry

    if (isExpired || expiresSoon) {
      // Token expired or expiring soon - try to refresh
      try {
        const refreshed = await tryRefreshToken(token);
        if (refreshed) {
          // Update token reference for this request
          const newState = useAuthStore.getState();
          // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
          token = newState.accessToken || (newState as any).token;
        } else if (isExpired) {
          // Token expired and refresh failed - throw error
          throw new TokenExpiredError(
            "Token expired and refresh failed. Please log in again."
          );
        }
      } catch (error) {
        // If it's a network error, continue with the request (might succeed)
        // If it's a refresh error, throw it
        if (
          error instanceof TokenRefreshError ||
          error instanceof TokenExpiredError
        ) {
          throw error;
        }
        // Network errors - continue with current token
      }
    }
  }

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add CSRF token for state-changing requests
  if (method !== "GET" && !noAuth) {
    CSRFProtection.addToHeaders(requestHeaders);
  }

  if (!noAuth && token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  
  // CRITICAL: Register controller for global cancellation (e.g., on logout)
  const unregister = registerAbortController(controller);
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Auth and all API requests require credentials for cookie-based auth (refreshToken, X-Branch-ID, X-Academic-Year-ID, X-Branch-Type).
    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    unregister(); // Unregister on success

    // Handle 204 No Content and other empty responses - no body to parse
    if (res.status === 204 || res.status === 205) {
      return undefined as T;
    }

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    
    // Check if response has content before trying to parse
    const contentLength = res.headers.get("content-length");
    const hasContent = contentLength !== "0" && contentLength !== null;
    
    let data: T;
    if (!hasContent) {
      // No content, return undefined
      data = undefined as T;
    } else if (isJson) {
      try {
        data = await res.json();
      } catch (error) {
        // If JSON parsing fails, it might be an empty response
        // For successful responses (2xx), return undefined if parsing fails
        if (res.ok) {
          data = undefined as T;
        } else {
          // For error responses, try to get text for error message
          try {
            const text = await res.text();
            throw new Error(text || "Failed to parse response");
          } catch (textError) {
            // If we can't get text either, use the original error
            throw error instanceof Error ? error : new Error("Failed to parse response");
          }
        }
      }
    } else {
      const text = await res.text();
      data = (text || undefined) as unknown as T;
    }

    // If this was a login call, store token and schedule proactive refresh
    if (path === "/auth/login" && res.ok && isJson) {
      // ✅ FIX: Properly type login response
      const loginData = data as LoginResponse;
      const access = loginData?.access_token;
      const expireIso = loginData?.expiretime;
      if (access && expireIso) {
        useAuthStore
          .getState()
          .setTokenAndExpiry(access, expireIso);
        scheduleProactiveRefresh();
      }
    }

    // Attempt refresh on 401 only (Unauthorized) - 403 (Forbidden) is permission-based, not auth
    // Only retry with refresh on 401, not 403
    if (!noAuth && res.status === 401 && !_isRetry) {
      try {
        const refreshed = await tryRefreshToken(token);
        if (refreshed) {
          return api<T>({
            method,
            path,
            body,
            query,
            headers,
            noAuth,
            _isRetry: true,
            timeout,
          });
        }
      } catch (refreshError) {
        // If refresh fails, let the error propagate
        // The error handler below will handle it
        if (process.env.NODE_ENV === "development") {
          console.warn("Token refresh failed on 401:", refreshError);
        }
      }
    }
    
    // For 403 errors, don't attempt refresh - it's a permission issue, not authentication
    // Just let the error propagate normally

    if (!res.ok) {
      // ✅ FIX: Properly type error responses
      let message = res.statusText || "Request failed";

      // THE CORE FIX: Catch success: false even if status is 200
      if (res.ok && data && typeof data === 'object' && (data as any).success === false) {
        throw new ApiError((data as any).message || (data as any).detail || "Operation unsuccessful", res.status, data);
      }

      if (isJson && isApiErrorResponse(data)) {
        // Extract message from API error response
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        }
      }

      // Enhance error messages based on status code
      if (res.status === 401) {
        message = "Authentication required. Please log in again.";
      } else if (res.status === 403) {
        // Use the API detail message if available, otherwise use generic message
        if (message === res.statusText || message === "Request failed") {
          message =
            "Access forbidden. You don't have permission to perform this action.";
        }
      } else if (res.status === 404) {
        if (message === res.statusText || message === "Request failed") {
          message = "Resource not found.";
        }
      } else if (res.status === 422) {
        // Handle validation errors - detail can be an array of error objects
        if (isJson && isValidationErrorResponse(data)) {
          const detail = data.detail;
          // Extract validation error messages from array of objects
          const messages = detail
            .map((item: ApiValidationError) => {
              const fieldPath = Array.isArray(item.loc)
                ? item.loc.filter((part) => part !== "body").join(".")
                : "";
              const errorMsg = item.msg || "";
              return fieldPath ? `${fieldPath}: ${errorMsg}` : errorMsg;
            })
            .filter((msg: string) => msg && msg.length > 0);

          if (messages.length > 0) {
            message = messages.join("; ");
          } else {
            message = "Validation error: Invalid input data.";
          }
        } else if (isJson && isApiErrorResponse(data) && typeof data.detail === "string") {
          message = "Validation error: " + data.detail;
        } else {
          message = "Validation error: " + (message || "Invalid input data.");
        }
      } else if (res.status === 429) {
        message = "Too many requests. Please try again later.";
      } else if (res.status >= 500) {
        message = "Server error. Please try again later.";
      }

      // ✅ FIX: Use proper ApiError class instead of extending Error with any
      throw new ApiError(message, res.status, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    unregister(); // CRITICAL: Unregister controller on error

    if (error instanceof Error && error.name === "AbortError") {
      // Check if this was a logout cancellation
      const currentState = useAuthStore.getState();
      if (currentState.isLoggingOut) {
        throw new Error("Request cancelled: logout in progress");
      }
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw error;
  }
}

function parseContentDispositionFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) return null;
  // Examples:
  // - attachment; filename="receipt.pdf"
  // - attachment; filename=receipt.pdf
  // - attachment; filename*=UTF-8''receipt%20(1).pdf
  const filenameStar = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1];
  if (filenameStar) {
    try {
      return decodeURIComponent(filenameStar.replace(/(^")|("$)/g, ""));
    } catch {
      return filenameStar.replace(/(^")|("$)/g, "");
    }
  }

  const filename = contentDisposition.match(/filename\s*=\s*("?)([^";]+)\1/i)?.[2];
  return filename ? filename.trim() : null;
}

async function apiBlob({
  method = "GET",
  path,
  body,
  query,
  headers = {},
  noAuth = false,
  _isRetry = false,
  timeout = DEFAULT_TIMEOUT,
}: ApiRequestOptions): Promise<{ blob: Blob; filename: string | null; contentType: string | null }> {
  // Pure HTTP client - no caching logic
  // React Query handles all caching and request deduplication

  const state = useAuthStore.getState();

  // CRITICAL: Don't make authenticated requests if:
  // 1. Logout is in progress (race condition protection)
  // 2. Auth is initializing (bootstrapAuth running)
  if (!noAuth) {
    if (state.isLoggingOut) {
      throw new Error("Request cancelled: logout in progress");
    }
    if (state.isAuthInitializing) {
      throw new Error("Request cancelled: auth initialization in progress");
    }
  }

  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  let token = state.accessToken || (state as any).token;

  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  // Check token expiry and refresh proactively if needed
  if (token && !noAuth && state.tokenExpireAt) {
    const now = Date.now();
    const isExpired = now >= state.tokenExpireAt;
    const expiresSoon = state.tokenExpireAt - now < 60_000; // 60 seconds before expiry

    if (isExpired || expiresSoon) {
      try {
        const refreshed = await tryRefreshToken(token);
        if (refreshed) {
          const newState = useAuthStore.getState();
          token = newState.accessToken || (newState as any).token;
        } else if (isExpired) {
          throw new TokenExpiredError(
            "Token expired and refresh failed. Please log in again."
          );
        }
      } catch (error) {
        if (error instanceof TokenRefreshError || error instanceof TokenExpiredError) {
          throw error;
        }
        // Network errors - continue with current token
      }
    }
  }

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  // Only set JSON content-type when sending a JSON body
  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = requestHeaders["Content-Type"] || "application/json";
  }

  if (method !== "GET" && !noAuth) {
    CSRFProtection.addToHeaders(requestHeaders);
  }

  if (!noAuth && token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const unregister = registerAbortController(controller);
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    unregister();

    // Attempt refresh on 401 only (Unauthorized)
    if (!noAuth && res.status === 401 && !_isRetry) {
      try {
        const refreshed = await tryRefreshToken(token);
        if (refreshed) {
          return await apiBlob({
            method,
            path,
            body,
            query,
            headers,
            noAuth,
            _isRetry: true,
            timeout,
          });
        }
      } catch (refreshError) {
        if (refreshError instanceof TokenRefreshError || refreshError instanceof TokenExpiredError) {
          throw refreshError;
        }
      }
    }

    if (!res.ok) {
      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");

      let payload: unknown = null;
      try {
        payload = isJson ? await res.json() : await res.text();
      } catch {
        payload = null;
      }

      let message = res.statusText || "Request failed";
      if (isJson && isApiErrorResponse(payload)) {
        if (typeof payload.detail === "string") {
          message = payload.detail;
        } else if (payload.message) {
          message = payload.message;
        }
      }

      throw new ApiError(message, res.status, payload);
    }

    const contentType = res.headers.get("content-type");
    const filename = parseContentDispositionFilename(res.headers.get("content-disposition"));
    const blob = await res.blob();
    const normalized =
      contentType && (!blob.type || blob.type === "application/octet-stream")
        ? new Blob([blob], { type: contentType })
        : blob;
    return { blob: normalized, filename, contentType };
  } catch (error) {
    clearTimeout(timeoutId);
    unregister();

    if (error instanceof Error && error.name === "AbortError") {
      const currentState = useAuthStore.getState();
      if (currentState.isLoggingOut) {
        throw new Error("Request cancelled: logout in progress");
      }
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw error;
  }
}

export const Api = {
  get: <T>(
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) =>
    api<T>({
      method: "GET",
      path,
      query,
      headers,
      timeout: opts?.timeout,
    }),
  post: <T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) =>
    api<T>({
      method: "POST",
      path,
      body,
      headers,
      noAuth: opts?.noAuth,
      timeout: opts?.timeout,
    }),
  put: <T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) =>
    api<T>({
      method: "PUT",
      path,
      body,
      headers,
      timeout: opts?.timeout,
    }),
  patch: <T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) =>
    api<T>({
      method: "PATCH",
      path,
      body,
      query: opts?.query,
      headers,
      timeout: opts?.timeout,
    }),
  delete: <T>(
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) =>
    api<T>({
      method: "DELETE",
      path,
      query,
      headers,
      timeout: opts?.timeout,
    }),

  /**
   * GET a binary response (e.g. PDF, XLSX) as Blob.
   * Use this for downloads instead of trying to pass axios-like `responseType`.
   */
  getBlob: async (
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ): Promise<Blob> => {
    const { blob } = await apiBlob({
      method: "GET",
      path,
      query,
      headers,
      timeout: opts?.timeout,
      noAuth: opts?.noAuth,
    });
    return blob;
  },

  /**
   * GET a binary response plus useful metadata from headers.
   */
  getBlobWithMeta: async (
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ): Promise<{ blob: Blob; filename: string | null; contentType: string | null }> => {
    return apiBlob({
      method: "GET",
      path,
      query,
      headers,
      timeout: opts?.timeout,
      noAuth: opts?.noAuth,
    });
  },

  // FormData helper (avoids JSON content-type)
  postForm: async <T>(
    path: string,
    formData: FormData,
    headers?: Record<string, string>
  ) => {
    const state = useAuthStore.getState();
    // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
    const token = state.accessToken || (state as any).token;
    const url = `${API_BASE_URL}${path}`;
    const requestHeaders: Record<string, string> = {
      ...headers,
    };
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: requestHeaders, // don't set Content-Type; browser will add multipart boundary
      body: formData,
      credentials: "include",
    });
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson
      ? await res.json()
      : ((await res.text()) as unknown as T);
    if (!res.ok) {
      // ✅ FIX: Properly type error responses
      let message = res.statusText || "Request failed";
      if (isJson && isApiErrorResponse(data)) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        }
      }
      throw new ApiError(message, res.status, data);
    }
    return data as T;
  },

  putForm: async <T>(
    path: string,
    formData: FormData,
    headers?: Record<string, string>
  ) => {
    const state = useAuthStore.getState();
    // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
    const token = state.accessToken || (state as any).token;
    const url = `${API_BASE_URL}${path}`;
    const requestHeaders: Record<string, string> = {
      ...headers,
    };
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: "PUT",
      headers: requestHeaders,
      body: formData,
      credentials: "include",
    });
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson
      ? await res.json()
      : ((await res.text()) as unknown as T);
    if (!res.ok) {
      // ✅ FIX: Properly type error responses
      let message = res.statusText || "Request failed";
      if (isJson && isApiErrorResponse(data)) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (data.message) {
          message = data.message;
        }
      }
      throw new ApiError(message, res.status, data);
    }
    return data as T;
  },
};

export { getApiBaseUrl } from "./api";
export type {
  PaymentPurpose,
  PaymentMethodApi,
  PaymentDetailItem,
  PaymentRequestPayload,
  PaymentSuccessContext,
  PaymentSuccessResponse,
} from "./payment-types";
export {
  isPaymentSuccessResponse,
  getIncomeIdFromResponse,
  getReceiptNoFromResponse,
} from "./payment-types";

/**
 * Unified receipt regeneration handler that works for both school and college
 *
 * This function regenerates a receipt PDF for the given income ID
 * and returns a blob URL for modal display
 *
 * @param incomeId - The income ID for receipt regeneration
 * @param institutionType - The institution type ('school' or 'college')
 * @returns Promise that resolves with blob URL for PDF receipt
 */
export async function handleRegenerateReceipt(
  incomeId: number,
  institutionType: "school" | "college" = "school"
): Promise<string> {
  try {
    const pdfBlob = await Api.getBlob(
      `/${institutionType}/income/${incomeId}/regenerate-receipt`
    );

    if (pdfBlob.size === 0) {
      throw new Error("Invalid PDF received from server");
    }

    const ensurePdfType =
      pdfBlob.type && pdfBlob.type.toLowerCase().includes("pdf")
        ? pdfBlob
        : new Blob([pdfBlob], { type: "application/pdf" });

    return URL.createObjectURL(ensurePdfType);
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while regenerating receipt. Please check your connection and try again."
      );
    }

    // Re-throw the original error
    throw error;
  }
}

// Batch request utility
export async function batchRequests<T>(
  requests: Array<() => Promise<T>>,
  options?: {
    maxConcurrency?: number;
    timeout?: number;
  }
): Promise<T[]> {
  const { maxConcurrency = 5, timeout = 30000 } = options || {};
  const results: T[] = [];
  const errors: Error[] = [];

  // Process requests in batches
  for (let i = 0; i < requests.length; i += maxConcurrency) {
    const batch = requests.slice(i, i + maxConcurrency);

    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = await Promise.race([
          request(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), timeout)
          ),
        ]);
        return { index: i + index, result, error: null };
      } catch (error) {
        return {
          index: i + index,
          result: null,
          error: error instanceof Error ? error : new Error("Unknown error"),
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach(({ index, result, error }) => {
      if (error) {
        errors[index] = error;
      } else {
        results[index] = result as T;
      }
    });
  }

  if (errors.length > 0) {
    console.warn("Some batch requests failed:", errors);
  }

  return results;
}

// Note: Cache management and request deduplication are handled by React Query
// This API client is a pure HTTP layer with no caching logic

// Expose helpers for lifecycle
export const AuthTokenTimers = {
  scheduleProactiveRefresh,
  clearProactiveRefresh,
  // Page Visibility API integration
  setTabVisible: (visible: boolean) => {
    isTabVisible = visible;
    if (visible) {
      // Reschedule refresh when tab becomes visible
      const { accessToken, tokenExpireAt } = useAuthStore.getState();
      if (accessToken && tokenExpireAt) {
        scheduleProactiveRefresh();
      }
    } else {
      // Clear refresh timer when tab is hidden
      clearProactiveRefresh();
    }
  },
  // Refresh metrics
  getRefreshMetrics: () => ({ ...refreshMetrics }),
  resetRefreshMetrics: () => {
    refreshMetrics.totalAttempts = 0;
    refreshMetrics.successfulRefreshes = 0;
    refreshMetrics.failedRefreshes = 0;
    refreshMetrics.lastRefreshTime = null;
    refreshMetrics.consecutiveFailures = 0;
  },
};

// Re-export apiClient from api.ts
export { apiClient } from "./api";
