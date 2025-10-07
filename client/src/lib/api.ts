import { useAuthStore } from "@/store/authStore";

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
}

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

async function tryRefreshToken(oldAccessToken: string | null): Promise<string | null> {
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

export async function api<T = unknown>({ method = "GET", path, body, query, headers = {}, noAuth = false, _isRetry = false }: ApiRequestOptions): Promise<T> {
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

	const res = await fetch(url, {
		method,
		headers: requestHeaders,
		body: body !== undefined ? JSON.stringify(body) : undefined,
		credentials: "include",
	});

	const contentType = res.headers.get("content-type") || "";
	const isJson = contentType.includes("application/json");
	const data = isJson ? await res.json() : (await res.text() as unknown as T);

	// If this was a login call, store token and schedule proactive refresh
	if (path === "/auth/login" && res.ok && isJson) {
		const access = (data as any)?.access_token as string | undefined;
		const expireIso = (data as any)?.expiretime as string | undefined;
		if (access && expireIso) {
			useAuthStore.getState().setTokenAndExpiry(access, new Date(expireIso).getTime());
			scheduleProactiveRefresh();
		}
	}

	// Attempt refresh on 401 or 403 once for authenticated calls
	// 403 can also indicate token expiration in some API implementations
	if (!noAuth && (res.status === 401 || res.status === 403) && !_isRetry) {
		const refreshed = await tryRefreshToken(token);
		if (refreshed) {
			return api<T>({ method, path, body, query, headers, noAuth, _isRetry: true });
		}
	}

	if (!res.ok) {
		const message = (isJson && (((data as any)?.detail) || ((data as any)?.message))) || res.statusText || "Request failed";
		throw new Error(message as string);
	}

	return data as T;
}

export const Api = {
	get: <T>(path: string, query?: ApiRequestOptions["query"], headers?: Record<string, string>) =>
		api<T>({ method: "GET", path, query, headers }),
	post: <T>(path: string, body?: unknown, headers?: Record<string, string>, opts?: Partial<ApiRequestOptions>) =>
		api<T>({ method: "POST", path, body, headers, noAuth: opts?.noAuth }),
	put: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
		api<T>({ method: "PUT", path, body, headers }),
	patch: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
		api<T>({ method: "PATCH", path, body, headers }),
	delete: <T>(path: string, query?: ApiRequestOptions["query"], headers?: Record<string, string>) =>
		api<T>({ method: "DELETE", path, query, headers }),

  // FormData helper (avoids JSON content-type)
  postForm: async <T>(path: string, formData: FormData, headers?: Record<string, string>) => {
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
    const data = isJson ? await res.json() : (await res.text() as unknown as T);
    if (!res.ok) {
      const message = (isJson && (((data as any)?.detail) || ((data as any)?.message))) || res.statusText || "Request failed";
      throw new Error(message as string);
    }
    return data as T;
  },

  putForm: async <T>(path: string, formData: FormData, headers?: Record<string, string>) => {
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
    const data = isJson ? await res.json() : (await res.text() as unknown as T);
    if (!res.ok) {
      const message = (isJson && (((data as any)?.detail) || ((data as any)?.message))) || res.statusText || "Request failed";
      throw new Error(message as string);
    }
    return data as T;
  },
};

export function getApiBaseUrl() {
	return API_BASE_URL;
}

// Expose helpers for lifecycle
export const AuthTokenTimers = {
	scheduleProactiveRefresh,
	clearProactiveRefresh,
};


