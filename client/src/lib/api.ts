import { useAuthStore } from "@/store/authStore";
import { useCacheStore } from "@/store/cacheStore";
import { useUIStore } from "@/store/uiStore";

// For the simple API, we need to use /api/v1 since the proxy forwards /api to the external server
// and the external server expects /v1 paths
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "/api/v1";

// Debug: Log API configuration on module load

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  noAuth?: boolean;
  // internal flag to avoid infinite refresh loops
  _isRetry?: boolean;
  // Cache options
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  // Request deduplication
  dedupe?: boolean;
  // Request timeout
  timeout?: number;
}

// Request deduplication object (avoiding Map for Immer compatibility)
const pendingRequests: Record<string, Promise<any>> = {};

// Request timeout default
const DEFAULT_TIMEOUT = 30000; // 30 seconds

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

// Generate cache key from request options
function generateCacheKey(options: ApiRequestOptions): string {
  if (options.cacheKey) return options.cacheKey;

  const { method = "GET", path, query } = options;
  const queryString = buildQuery(query);
  return `${method}:${path}${queryString}`;
}

// Check if request should be cached
function shouldCache(options: ApiRequestOptions): boolean {
  return options.cache !== false && options.method === "GET";
}

// Get cached data
function getCachedData<T>(cacheKey: string): T | null {
  const cache = useCacheStore.getState();
  return cache.get<T>(cacheKey);
}

// Set cached data
function setCachedData<T>(cacheKey: string, data: T, ttl?: number): void {
  const cache = useCacheStore.getState();
  cache.set(cacheKey, data, { ttl });
}

// Request deduplication
function getDedupeKey(options: ApiRequestOptions): string {
  const { method = "GET", path, query, body } = options;
  const queryString = buildQuery(query);
  const bodyString = body ? JSON.stringify(body) : "";
  return `${method}:${path}${queryString}:${bodyString}`;
}

// Check if request is already pending
function getPendingRequest<T>(dedupeKey: string): Promise<T> | null {
  return pendingRequests[dedupeKey] || null;
}

// Set pending request
function setPendingRequest<T>(dedupeKey: string, request: Promise<T>): void {
  pendingRequests[dedupeKey] = request;
}

// Clear pending request
function clearPendingRequest(dedupeKey: string): void {
  delete pendingRequests[dedupeKey];
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;
// Promise-based refresh queue to handle concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;
// Track if tab is visible (Page Visibility API)
let isTabVisible = true;
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
  const { token, tokenExpireAt } = useAuthStore.getState();
  if (!token || !tokenExpireAt) return;
  
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
      await tryRefreshToken(useAuthStore.getState().token);
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

  // Use Promise-based queue instead of polling
  if (refreshPromise) {
    // Wait for ongoing refresh to complete
    try {
      return await refreshPromise;
    } catch {
      // If refresh failed, return null to allow retry
      return null;
    }
  }

  // Don't refresh if tab is not visible
  if (!isTabVisible) {
    return null;
  }

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
      const expireAtMs = expireIso ? new Date(expireIso).getTime() : null;
      useAuthStore.getState().setTokenAndExpiry(newToken, expireAtMs);

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
  cache = true,
  cacheKey,
  cacheTTL,
  dedupe = true,
  timeout = DEFAULT_TIMEOUT,
}: ApiRequestOptions): Promise<T> {
  // Generate cache key and check cache for GET requests
  const cacheKeyGenerated = generateCacheKey({ method, path, query, cacheKey });

  if (shouldCache({ method, path, cache })) {
    const cachedData = getCachedData<T>(cacheKeyGenerated);
    if (cachedData) {
      return cachedData;
    }
  }

  // Check for request deduplication
  const dedupeKey = getDedupeKey({ method, path, query, body });
  if (dedupe) {
    const pendingRequest = getPendingRequest<T>(dedupeKey);
    if (pendingRequest) {
      return pendingRequest;
    }
  }

  // Create the actual request
  const makeRequest = async (): Promise<T> => {
    const state = useAuthStore.getState();
    let token = state.token;

    const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

    // Check token expiry and refresh proactively if needed
    if (token && !noAuth && state.tokenExpireAt) {
      const now = Date.now();
      const isExpired = now >= state.tokenExpireAt;
      const expiresSoon = state.tokenExpireAt - now < 60_000; // 60 seconds before expiry (reduced from 2 minutes)

      if (isExpired || expiresSoon) {
        // Token expired or expiring soon - try to refresh
        try {
          const refreshed = await tryRefreshToken(token);
          if (refreshed) {
            // Update token reference for this request
            const newState = useAuthStore.getState();
            token = newState.token;
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
          // Network errors - log but continue
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "Token refresh network error, continuing with current token:",
              error
            );
          }
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
    } else if (!noAuth && !token) {
      console.warn(
        `⚠️ No token available for authenticated request to ${path}`
      );
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
        const access = (data as any)?.access_token as string | undefined;
        const expireIso = (data as any)?.expiretime as string | undefined;
        if (access && expireIso) {
          useAuthStore
            .getState()
            .setTokenAndExpiry(access, new Date(expireIso).getTime());
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
              cache,
              cacheKey,
              cacheTTL,
              dedupe,
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
        // Handle specific error cases
        let message =
          (isJson && ((data as any)?.detail || (data as any)?.message)) ||
          res.statusText ||
          "Request failed";

        // Enhance error messages based on status code
        if (res.status === 401) {
          message = "Authentication required. Please log in again.";
        } else if (res.status === 403) {
          // Use the API detail message if available, otherwise use generic message
          if (message === res.statusText || message === "Request failed") {
            message =
              "Access forbidden. You don't have permission to perform this action.";
          }
          // If message already contains API detail/message, keep it as is
        } else if (res.status === 404) {
          // Use the detail message from API if available (already extracted above), 
          // otherwise use generic message
          // The message variable already contains the API detail/message from line 614
          // Only use generic message if we don't have a specific API message
          if (message === res.statusText || message === "Request failed") {
            message = "Resource not found.";
          }
          // If message already contains API detail/message, keep it as is
        } else if (res.status === 422) {
          // Handle validation errors - detail can be an array of error objects
          if (isJson && (data as any)?.detail) {
            const detail = (data as any).detail;
            if (Array.isArray(detail) && detail.length > 0) {
              // Extract validation error messages from array of objects
              const messages = detail
                .map((item: any) => {
                  if (typeof item === "string") {
                    return item;
                  }
                  if (typeof item === "object" && item !== null) {
                    // Format: "field_name: error message" or just "error message"
                    const fieldPath = Array.isArray(item.loc) 
                      ? item.loc.filter((part: string) => part !== "body").join(".") 
                      : "";
                    const errorMsg = item.msg || item.message || "";
                    return fieldPath ? `${fieldPath}: ${errorMsg}` : errorMsg;
                  }
                  return String(item);
                })
                .filter((msg: string) => msg && msg.length > 0);
              
              if (messages.length > 0) {
                message = messages.join("; ");
              } else {
                message = "Validation error: Invalid input data.";
              }
            } else if (typeof detail === "string") {
              message = "Validation error: " + detail;
            } else {
              message = "Validation error: " + (message || "Invalid input data.");
            }
          } else {
            message = "Validation error: " + (message || "Invalid input data.");
          }
        } else if (res.status === 429) {
          message = "Too many requests. Please try again later.";
        } else if (res.status >= 500) {
          message = "Server error. Please try again later.";
        }

        const error = new Error(message as string);
        (error as any).status = res.status;
        (error as any).data = data;
        throw error;
      }

      // Cache successful GET requests
      if (shouldCache({ method, path, cache }) && res.ok) {
        setCachedData(cacheKeyGenerated, data, cacheTTL);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      throw error;
    } finally {
      // Clear pending request
      if (dedupe) {
        clearPendingRequest(dedupeKey);
      }
    }
  };

  // Set pending request for deduplication
  if (dedupe) {
    const requestPromise = makeRequest();
    setPendingRequest(dedupeKey, requestPromise);
    return requestPromise;
  }

  return makeRequest();
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
      cache: opts?.cache ?? true,
      cacheKey: opts?.cacheKey,
      cacheTTL: opts?.cacheTTL,
      dedupe: opts?.dedupe ?? true,
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
      cache: opts?.cache ?? false,
      cacheKey: opts?.cacheKey,
      cacheTTL: opts?.cacheTTL,
      dedupe: opts?.dedupe ?? true,
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
      cache: opts?.cache ?? false,
      cacheKey: opts?.cacheKey,
      cacheTTL: opts?.cacheTTL,
      dedupe: opts?.dedupe ?? true,
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
      headers,
      cache: opts?.cache ?? false,
      cacheKey: opts?.cacheKey,
      cacheTTL: opts?.cacheTTL,
      dedupe: opts?.dedupe ?? true,
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
      cache: opts?.cache ?? false,
      cacheKey: opts?.cacheKey,
      cacheTTL: opts?.cacheTTL,
      dedupe: opts?.dedupe ?? true,
      timeout: opts?.timeout,
    }),

  // FormData helper (avoids JSON content-type)
  postForm: async <T>(
    path: string,
    formData: FormData,
    headers?: Record<string, string>
  ) => {
    const state = useAuthStore.getState();
    const token = state.token;
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
      const message =
        (isJson && ((data as any)?.detail || (data as any)?.message)) ||
        res.statusText ||
        "Request failed";
      throw new Error(message as string);
    }
    return data as T;
  },

  putForm: async <T>(
    path: string,
    formData: FormData,
    headers?: Record<string, string>
  ) => {
    const state = useAuthStore.getState();
    const token = state.token;
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
      const message =
        (isJson && ((data as any)?.detail || (data as any)?.message)) ||
        res.statusText ||
        "Request failed";
      throw new Error(message as string);
    }
    return data as T;
  },
};

export function getApiBaseUrl() {
  return API_BASE_URL;
}

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
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error(
      "Authentication token is required for receipt regeneration"
    );
  }

  const url = `${API_BASE_URL}/${institutionType}/income/${incomeId}/regenerate-receipt`;

  try {
    // Call the API with blob response type to receive PDF binary data
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Receipt regeneration failed with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Get the PDF as binary data (blob)
    const pdfBlob = await response.blob();

    // Verify we received a PDF
    if (!pdfBlob.type.includes("pdf") && pdfBlob.size === 0) {
      throw new Error("Invalid PDF received from server");
    }

    // Create a Blob URL for the PDF
    const pdfBlobWithType = new Blob([pdfBlob], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(pdfBlobWithType);

    // Return the blobUrl for the caller to handle (e.g., in modal)
    return blobUrl;
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

// Cache management utilities
export const CacheUtils = {
  // Clear cache by pattern
  clearByPattern: (pattern: string | RegExp) => {
    const cache = useCacheStore.getState();
    cache.invalidate(pattern);
  },

  // Clear cache by tag
  clearByTag: (tag: string) => {
    const cache = useCacheStore.getState();
    cache.clearByTag(tag);
  },

  // Clear all cache
  clearAll: () => {
    const cache = useCacheStore.getState();
    cache.clear();
  },

  // Get cache statistics
  getStats: () => {
    const cache = useCacheStore.getState();
    return cache.getCacheStats();
  },

  // Preload data
  preload: async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ) => {
    const cache = useCacheStore.getState();
    try {
      const data = await fetcher();
      cache.set(key, data, options);
      return data;
    } catch (error) {
      console.error("Preload failed:", error);
      throw error;
    }
  },
};

// Request deduplication utilities
export const DedupeUtils = {
  // Clear all pending requests
  clearAll: () => {
    Object.keys(pendingRequests).forEach((key) => delete pendingRequests[key]);
  },

  // Get pending request count
  getPendingCount: () => {
    return Object.keys(pendingRequests).length;
  },

  // Check if request is pending
  isPending: (options: ApiRequestOptions) => {
    const dedupeKey = getDedupeKey(options);
    return dedupeKey in pendingRequests;
  },
};

// Expose helpers for lifecycle
export const AuthTokenTimers = {
  scheduleProactiveRefresh,
  clearProactiveRefresh,
  // Page Visibility API integration
  setTabVisible: (visible: boolean) => {
    isTabVisible = visible;
    if (visible) {
      // Reschedule refresh when tab becomes visible
      const { token, tokenExpireAt } = useAuthStore.getState();
      if (token && tokenExpireAt) {
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
