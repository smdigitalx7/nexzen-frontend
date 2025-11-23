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
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, CancelTokenSource } from "axios";
import { useAuthStore } from "@/core/auth/authStore";
import { queryClient } from "@/core/query";

// Base URL for auth endpoints
// Handle both cases: full URL or path-only
const ENV_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || "https://erpapi.velonex.in";

// Determine the base URL for apiClient
// If VITE_API_BASE_URL includes /api/v1, remove it (we'll add it back in baseURL)
// If it's a full URL like "http://localhost:7000/api/v1", extract "http://localhost:7000"
// If it's a path like "/api/v1", use empty string (relative path)
// If it's a path like "/api", use empty string (relative path, we'll add /api/v1)
let API_BASE_URL: string;
if (ENV_API_BASE_URL.includes("http")) {
  // Full URL - remove trailing /api/v1 or /api if present
  API_BASE_URL = ENV_API_BASE_URL.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
} else {
  // Path-only - if it starts with /api/v1 or /api, use empty string (relative)
  // We'll add /api/v1 in the baseURL configuration
  API_BASE_URL = (ENV_API_BASE_URL.startsWith("/api/v1") || ENV_API_BASE_URL === "/api") ? "" : ENV_API_BASE_URL;
}

/**
 * Concurrency-safe refresh mechanism
 * Only one refresh call can be active at a time
 * Other requests wait on the same refreshPromise
 */
let refreshPromise: Promise<string | null> | null = null;

/**
 * Track if a request is already being retried to prevent infinite loops
 */
const retryingRequests = new WeakSet<InternalAxiosRequestConfig>();

/**
 * Call the refresh endpoint to get a new access token
 * Uses HttpOnly cookie (refreshToken) automatically via withCredentials
 */
async function callRefreshEndpoint(): Promise<{ access_token: string; expiretime: string; user_info: any }> {
  // Use apiClient which already has the correct baseURL configured
  const response = await apiClient.post("/auth/refresh", {}, {
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
      const expireAtMs = response.expiretime 
        ? new Date(response.expiretime).getTime() 
        : null;
      
      useAuthStore.getState().setTokenAndExpiry(response.access_token, expireAtMs);
      
      // Update user info if provided
      if (response.user_info) {
        useAuthStore.getState().setUser(response.user_info);
      }

      return response.access_token;
    } catch (error) {
      // Refresh failed - only logout if not already logging out
      const currentState = useAuthStore.getState();
      if (!currentState.isLoggingOut) {
        // Use logout() which handles redirect internally
        // Don't redirect here to prevent double redirects
        useAuthStore.getState().logout();
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
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api/v1` : "/api/v1",
  timeout: 30000, // 30 seconds
  withCredentials: true, // CRITICAL: Send cookies (refreshToken) with all requests
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor: Add Authorization header from auth store
 * HARD KILL-SWITCH: Cancel ALL requests if user is logged out or logging out
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    
    // HARD KILL-SWITCH: Cancel request if user is logged out OR logout is in progress
    // BUT: Allow login/refresh requests (they don't require authentication)
    // Check both relative path and full URL (config.url can be either)
    const url = config.url || "";
    const isAuthEndpoint = 
      url.includes("/auth/login") || 
      url.includes("/auth/refresh") ||
      url === "/auth/login" ||
      url === "/auth/refresh";
    
    // Only block authenticated requests, not login/refresh endpoints
    // CRITICAL: Login/refresh endpoints should work even when not authenticated
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
      if (process.env.NODE_ENV === "development") {
        console.warn(`⚠️ apiClient request to ${config.url}: Blocked during auth initialization`);
      }
      return Promise.reject(new Error("Cancelled: auth initialization in progress"));
    }
    
    // Use accessToken (new) or token (legacy alias) for backward compatibility
    const token = state.accessToken || (state as any).token;
    
    // Add Authorization header if we have a token
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Debug logging in development
      if (process.env.NODE_ENV === "development") {
        console.warn(`⚠️ apiClient request to ${config.url}: No accessToken found in store`, {
          hasAccessToken: !!state.accessToken,
          hasTokenAlias: !!(state as any).token,
          isAuthenticated: state.isAuthenticated,
          hasUser: !!state.user,
          isAuthInitializing: state.isAuthInitializing,
          isLoggingOut: state.isLoggingOut,
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
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
      return Promise.reject(error);
    }

    // Only handle 401 errors (Unauthorized)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if this request already had an Authorization header (was using access token)
      const hadAuthHeader = !!originalRequest.headers?.Authorization;
      
      if (!hadAuthHeader) {
        // This request didn't use auth, so don't try to refresh
        return Promise.reject(error);
      }

      // Double-check logout state before attempting refresh (race condition protection)
      const currentAuthState = useAuthStore.getState();
      if (currentAuthState.isLoggingOut) {
        return Promise.reject(error);
      }

      // Mark request as retry to prevent infinite loops
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const newToken = await refreshAccessToken();
        
        // Triple-check logout state after refresh (logout might have happened during refresh)
        const postRefreshState = useAuthStore.getState();
        if (postRefreshState.isLoggingOut) {
          return Promise.reject(error);
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
        return Promise.reject(refreshError);
      }
    }

    // For non-401 errors or if refresh failed, reject with original error
    return Promise.reject(error);
  }
);

/**
 * Export helper to get base URL with /api/v1 included
 */
export function getApiBaseUrl(): string {
  // Return the full base URL including /api/v1
  if (API_BASE_URL.includes("http")) {
    // Full URL - ensure it includes /api/v1
    return API_BASE_URL.includes("/api/v1") ? API_BASE_URL : `${API_BASE_URL}/api/v1`;
  } else {
    // Path or empty - always return /api/v1
    return "/api/v1";
  }
}

