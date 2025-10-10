import { Api } from "@/lib/api";

/**
 * Simplified API service - just use the direct Api calls
 * No need for complex token synchronization since Api handles it
 */
export const unifiedApi = {
  get: <T>(path: string, query?: Record<string, string | number | boolean | undefined | null>, headers?: Record<string, string>): Promise<T> => {
    return Api.get<T>(path, query, headers);
  },

  post: <T>(path: string, body?: unknown, headers?: Record<string, string>, noAuth = false): Promise<T> => {
    return Api.post<T>(path, body, headers, { noAuth });
  },

  put: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> => {
    return Api.put<T>(path, body, headers);
  },

  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> => {
    return Api.patch<T>(path, body, headers);
  },

  delete: <T>(path: string, query?: Record<string, string | number | boolean | undefined | null>, headers?: Record<string, string>): Promise<T> => {
    return Api.delete<T>(path, query, headers);
  }
};
