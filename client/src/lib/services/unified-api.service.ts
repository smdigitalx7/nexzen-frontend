import { Api } from "@/lib/api";
import { ServiceLocator } from "@/core";
import { useAuthStore } from "@/store/authStore";

/**
 * Unified API service that works with both the simple API and clean architecture
 * This ensures token synchronization across all systems
 */
export class UnifiedApiService {
  private static instance: UnifiedApiService;
  
  static getInstance(): UnifiedApiService {
    if (!UnifiedApiService.instance) {
      UnifiedApiService.instance = new UnifiedApiService();
    }
    return UnifiedApiService.instance;
  }

  /**
   * Get the current auth token from the auth store
   */
  private getCurrentToken(): string | null {
    return useAuthStore.getState().token;
  }

  /**
   * Make an authenticated API request using the simple API
   * This ensures token synchronization
   */
  async request<T = unknown>({
    method = "GET",
    path,
    body,
    query,
    headers = {},
    noAuth = false,
  }: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    path: string;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
    headers?: Record<string, string>;
    noAuth?: boolean;
  }): Promise<T> {
    // Ensure token is synchronized before making request
    const token = this.getCurrentToken();
    if (token && !noAuth) {
      // Update ServiceLocator with current token
      ServiceLocator.setAuthToken(token);
    }

    // Use the simple API for the request
    if (method === "GET" || method === "DELETE") {
      return Api[method.toLowerCase() as keyof typeof Api]<T>(
        path,
        query,
        headers
      );
    } else {
      return Api[method.toLowerCase() as keyof typeof Api]<T>(
        path,
        body as any,
        headers,
        { noAuth }
      );
    }
  }

  /**
   * Get request
   */
  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined | null>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: "GET", path, query, headers });
  }

  /**
   * Post request
   */
  async post<T>(path: string, body?: unknown, headers?: Record<string, string>, noAuth = false): Promise<T> {
    return this.request<T>({ method: "POST", path, body, headers, noAuth });
  }

  /**
   * Put request
   */
  async put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: "PUT", path, body, headers });
  }

  /**
   * Patch request
   */
  async patch<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: "PATCH", path, body, headers });
  }

  /**
   * Delete request
   */
  async delete<T>(path: string, query?: Record<string, string | number | boolean | undefined | null>, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: "DELETE", path, query, headers });
  }

  /**
   * Update token across all systems
   */
  updateToken(token: string | null): void {
    if (token) {
      ServiceLocator.setAuthToken(token);
    } else {
      ServiceLocator.removeAuthToken();
    }
  }
}

// Export singleton instance
export const unifiedApi = UnifiedApiService.getInstance();
