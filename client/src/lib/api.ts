import { useAuthStore } from "@/store/authStore";
import { useCacheStore } from "@/store/cacheStore";

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

function scheduleProactiveRefresh() {
  const { token, tokenExpireAt } = useAuthStore.getState();
  if (!token || !tokenExpireAt) return;
  const now = Date.now();
  // Refresh 60 seconds before expiry
  const refreshInMs = Math.max(0, tokenExpireAt - now - 60_000);
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  refreshTimer = setTimeout(async () => {
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

async function tryRefreshToken(
  oldAccessToken: string | null
): Promise<string | null> {
  if (!oldAccessToken || isRefreshing) return null;

  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oldAccessToken}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      // If refresh fails, clear auth state to prevent infinite loops
      console.warn("Token refresh failed, clearing auth state");
      useAuthStore.getState().logout();
      return null;
    }
    const data = await res.json();
    const newToken = (data?.access_token as string) || null;
    const expireIso = (data?.expiretime as string) || null;
    const expireAtMs = expireIso ? new Date(expireIso).getTime() : null;
    if (newToken) {
      useAuthStore.getState().setTokenAndExpiry(newToken, expireAtMs);
      scheduleProactiveRefresh();
    }
    return newToken;
  } catch (error) {
    console.warn("Token refresh error, clearing auth state:", error);
    useAuthStore.getState().logout();
    return null;
  } finally {
    isRefreshing = false;
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
    const token = state.token;

    const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

    if (token) {
      // Check token expiry
      if (state.tokenExpireAt) {
        const isExpired = Date.now() > state.tokenExpireAt;
      }
    }

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (!noAuth && token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } else if (!noAuth && !token) {
      console.warn(`⚠️ No token available for authenticated request to ${path}`);
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

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : ((await res.text()) as unknown as T);

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

      // Attempt refresh on 401 or 403 once for authenticated calls
      // 403 can also indicate token expiration in some API implementations
      if (!noAuth && (res.status === 401 || res.status === 403) && !_isRetry) {
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
      }

      if (!res.ok) {
        const message =
          (isJson && ((data as any)?.detail || (data as any)?.message)) ||
          res.statusText ||
          "Request failed";
        const error = new Error(message as string);
        (error as any).status = res.status;
        throw error;
      }

      // Cache successful GET requests
      if (shouldCache({ method, path, cache }) && res.ok) {
        setCachedData(cacheKeyGenerated, data, cacheTTL);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
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
  ) => api<T>({ 
    method: "GET", 
    path, 
    query, 
    headers, 
    cache: opts?.cache ?? true,
    cacheKey: opts?.cacheKey,
    cacheTTL: opts?.cacheTTL,
    dedupe: opts?.dedupe ?? true,
    timeout: opts?.timeout
  }),
  post: <T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) => api<T>({ 
    method: "POST", 
    path, 
    body, 
    headers, 
    noAuth: opts?.noAuth,
    cache: opts?.cache ?? false,
    cacheKey: opts?.cacheKey,
    cacheTTL: opts?.cacheTTL,
    dedupe: opts?.dedupe ?? true,
    timeout: opts?.timeout
  }),
  put: <T>(
    path: string, 
    body?: unknown, 
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) => api<T>({ 
    method: "PUT", 
    path, 
    body, 
    headers,
    cache: opts?.cache ?? false,
    cacheKey: opts?.cacheKey,
    cacheTTL: opts?.cacheTTL,
    dedupe: opts?.dedupe ?? true,
    timeout: opts?.timeout
  }),
  patch: <T>(
    path: string, 
    body?: unknown, 
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) => api<T>({ 
    method: "PATCH", 
    path, 
    body, 
    headers,
    cache: opts?.cache ?? false,
    cacheKey: opts?.cacheKey,
    cacheTTL: opts?.cacheTTL,
    dedupe: opts?.dedupe ?? true,
    timeout: opts?.timeout
  }),
  delete: <T>(
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) => api<T>({ 
    method: "DELETE", 
    path, 
    query, 
    headers,
    cache: opts?.cache ?? false,
    cacheKey: opts?.cacheKey,
    cacheTTL: opts?.cacheTTL,
    dedupe: opts?.dedupe ?? true,
    timeout: opts?.timeout
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
  institutionType: 'school' | 'college' = 'school'
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
            setTimeout(() => reject(new Error('Request timeout')), timeout)
          )
        ]);
        return { index: i + index, result, error: null };
      } catch (error) {
        return { 
          index: i + index, 
          result: null, 
          error: error instanceof Error ? error : new Error('Unknown error') 
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
    console.warn('Some batch requests failed:', errors);
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
      console.error('Preload failed:', error);
      throw error;
    }
  }
};

// Request deduplication utilities
export const DedupeUtils = {
  // Clear all pending requests
  clearAll: () => {
    Object.keys(pendingRequests).forEach(key => delete pendingRequests[key]);
  },
  
  // Get pending request count
  getPendingCount: () => {
    return Object.keys(pendingRequests).length;
  },
  
  // Check if request is pending
  isPending: (options: ApiRequestOptions) => {
    const dedupeKey = getDedupeKey(options);
    return dedupeKey in pendingRequests;
  }
};

// Expose helpers for lifecycle
export const AuthTokenTimers = {
  scheduleProactiveRefresh,
  clearProactiveRefresh,
};
