
/**
 * Axios Instance + Interceptors + Refresh Logic
 *
 * This module provides a configured Axios instance with:
 * - Automatic Authorization header injection from auth store
 * - 401 response handling with automatic token refresh
 * - Concurrency-safe refresh mechanism (only one refresh call at a time)
 * - Request retry after successful refresh
 *
 * SECURITY NOTES:
 * - Access token is stored ONLY in memory (Zustand store), NOT in localStorage
 * - Refresh token is in HttpOnly cookie (set by backend), JavaScript cannot read it
 * - All requests use `withCredentials: true` to send cookies
 *
 * CREDENTIALS: All requests to the API must be sent with credentials (withCredentials: true)
 * so that the refreshToken and context cookies (X-Branch-ID, X-Academic-Year-ID, X-Branch-Type)
 * are sent and set correctly. Login, refresh, and logout all use this client with credentials.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/core/auth/authStore";

// Single source: VITE_API_BASE_URL only. Relative "/api/v1" when unset (Vite proxy).
const envBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = envBase?.includes("http")
  ? envBase.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "")
  : "";
const AXIOS_BASE_URL = API_BASE_URL ? `${API_BASE_URL}/api/v1` : "/api/v1";

/**
 * Concurrency-safe refresh mechanism
 * Only one refresh call can be active at a time
 * Other requests wait on the same refreshPromise
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Track if a request is already being retried to prevent infinite loops
 */
const _retryingRequests = new WeakSet<InternalAxiosRequestConfig>();

/**
 * Call the refresh endpoint to get a new access token
 * Uses HttpOnly cookie (refreshToken) automatically via withCredentials
 */
interface RefreshResponse {
  access_token: string;
  expiretime: string;
  user_info: unknown; // User info structure varies, handled by authStore
}

function isAuthUserInfo(
  value: unknown
): value is {
  full_name: string;
  email: string;
  branches: Array<{ branch_id: number; branch_name: string; roles: string[] }>;
} {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.full_name === "string" &&
    typeof v.email === "string" &&
    Array.isArray(v.branches)
  );
}

async function callRefreshEndpoint(): Promise<RefreshResponse> {
  // Use apiClient which already has the correct baseURL configured
  const response = await apiClient.post<RefreshResponse>("/auth/refresh", {}, {
    withCredentials: true, // CRITICAL: Send cookies (refreshToken)
  });

  return response.data;
}

/**
 * Refresh the access token using the refreshToken cookie
 * Implements concurrency-safe mechanism: only one refresh call at a time
 */
async function refreshAccessToken(): Promise<string | null> {
  // CRITICAL: Check if logout is in progress before attempting refresh
  const authState = useAuthStore.getState();
  if (authState.isLoggingOut) {
    // Logout in progress - don't attempt refresh
    return null;
  }

  // If refresh is already in progress, wait for it
  if (refreshPromise) {
    try {
      return await refreshPromise;
    } catch {
      // If refresh failed, return null
      return null;
    }
  }

  // Start new refresh
  refreshPromise = (async (): Promise<string | null> => {
    try {
      // Double-check logout state before making request
      const preRefreshState = useAuthStore.getState();
      if (preRefreshState.isLoggingOut) {
        return null;
      }

      const response = await callRefreshEndpoint();
      
      if (!response.access_token) {
        throw new Error("No access token in refresh response");
      }

      // Triple-check logout state after getting response (logout might have happened during request)
      const postResponseState = useAuthStore.getState();
      if (postResponseState.isLoggingOut) {
        // Logout happened during refresh - don't update state
        return null;
      }

      // Update auth store with new token and expiry
      useAuthStore
        .getState()
        .setTokenAndExpiry(response.access_token, response.expiretime ?? null);
      
      // Update user info if provided
      if (isAuthUserInfo(response.user_info)) {
        useAuthStore.getState().setUser(response.user_info);
      }

      return response.access_token;
    } catch (error) {
      // Refresh failed - only logout if not already logging out
      const currentState = useAuthStore.getState();
      if (!currentState.isLoggingOut) {
        // Use logout() which handles redirect internally
        // Don't redirect here to prevent double redirects
        void useAuthStore.getState().logout();
      }
      
      throw error;
    } finally {
      // Clear refresh promise so next refresh can start
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Create Axios instance with base configuration
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: AXIOS_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/**
 * Request interceptor: Add Authorization header from auth store
 * HARD KILL-SWITCH: Cancel ALL requests if user is logged out or logging out
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    
    // HARD KILL-SWITCH: Cancel request if user is logged out OR logout is in progress
    // BUT: Allow login/refresh/logout requests (login/refresh don't require auth; logout must be sent so backend clears cookies)
    // Check both relative path and full URL (config.url can be either)
    const url = config.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url === "/auth/login" ||
      url === "/auth/refresh" ||
      url === "/auth/logout";

    // Only block authenticated requests, not login/refresh/logout endpoints
    // CRITICAL: Login/refresh work when not authenticated; logout must run so backend clears session
    if ((!state.isAuthenticated || state.isLoggingOut) && !isAuthEndpoint) {
      // Cancel the request using axios CancelToken pattern
      const source = axios.CancelToken.source();
      source.cancel("Cancelled: user logged out");
      // Reject with cancellation error - this prevents request from being sent
      return Promise.reject(new Error("Cancelled: user logged out"));
    }
    
    // CRITICAL: Don't send authenticated requests during initialization
    // Wait for bootstrapAuth to complete
    if (state.isAuthInitializing && config.headers?.Authorization) {
      // Request blocked during auth initialization
      return Promise.reject(new Error("Cancelled: auth initialization in progress"));
    }
    
    // Use accessToken (new) or token (legacy alias) for backward compatibility
    const token = state.accessToken ?? (state as { token?: string | null }).token;
    
    // Add Authorization header if we have a token
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Note: Token validation happens in auth store
    }
    
    return config;
  },
  (error) => {
    throw error;
  }
);

/**
 * Response interceptor: Handle 401 errors with automatic token refresh
 * Includes race condition protection for logout scenarios
 */
apiClient.interceptors.response.use(
  (response) => {
    // Success - return response as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // CRITICAL: Check if logout is in progress - don't try to refresh if we're logging out
    const authState = useAuthStore.getState();
    if (authState.isLoggingOut) {
      // Logout in progress - don't attempt refresh, just reject
      throw error;
    }

    // Only handle 401 errors (Unauthorized)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if this request already had an Authorization header (was using access token)
      const hadAuthHeader = !!originalRequest.headers?.Authorization;
      
      if (!hadAuthHeader) {
        // This request didn't use auth, so don't try to refresh
        throw error;
      }

      // Double-check logout state before attempting refresh (race condition protection)
      const currentAuthState = useAuthStore.getState();
      if (currentAuthState.isLoggingOut) {
        throw error;
      }

      // Mark request as retry to prevent infinite loops
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const newToken = await refreshAccessToken();
        
        // Triple-check logout state after refresh (logout might have happened during refresh)
        const postRefreshState = useAuthStore.getState();
        if (postRefreshState.isLoggingOut) {
          throw error;
        }
        
        if (newToken) {
          // Update Authorization header with new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - error already handled in refreshAccessToken
        throw refreshError instanceof Error ? refreshError : new Error(String(refreshError));
      }
    }

    // For non-401 errors or if refresh failed, reject with original error
    throw error;
  }
);

/** Single base URL with /api/v1 for all API usage. */
export function getApiBaseUrl(): string {
  return AXIOS_BASE_URL;
}

