import type { AuthState } from "./authState";
import type { StateStorage } from "zustand/middleware";

/**
 * Storage configuration for authStore
 * Extracted from authStore.ts for better organization
 * 
 * This handles:
 * - Custom storage adapter (localStorage + sessionStorage)
 * - State persistence (partialize)
 * - State migration
 * - State rehydration
 */
export const createAuthStorageConfig = () => ({
  name: "enhanced-auth-storage",
  storage:
    typeof window !== "undefined"
      ? ({
          getItem: (name: string) => {
            // Get user data from localStorage
            const userData = localStorage.getItem(name);
            if (!userData) {
              // Even if no localStorage data, check if we have token in sessionStorage
              // Return minimal state structure if token exists
              const token =
                typeof window !== "undefined"
                  ? sessionStorage.getItem("access_token")
                  : null;
              if (token) {
                return JSON.stringify({
                  state: {
                    user: null,
                    isAuthenticated: false,
                    branches: [],
                    currentBranch: null,
                    academicYear: null,
                    academicYears: [],
                  },
                  version: 1,
                });
              }
              return null;
            }

            try {
              const parsed = JSON.parse(userData);
              // Token is not stored in localStorage, we'll get it from sessionStorage in onRehydrateStorage
              // Just return the user data as-is
              return JSON.stringify(parsed);
            } catch {
              return userData;
            }
          },
          setItem: (name: string, value: string) => {
            try {
              const valueStr =
                typeof value === "string" ? value : JSON.stringify(value);
              const parsed = JSON.parse(valueStr);
              // Store token separately in sessionStorage
              if (parsed.state?.token) {
                sessionStorage.setItem(
                  "access_token",
                  parsed.state.token
                );
                if (parsed.state.tokenExpireAt) {
                  sessionStorage.setItem(
                    "token_expires",
                    String(parsed.state.tokenExpireAt)
                  );
                }
              }
              // Remove token from localStorage data
              delete parsed.state?.token;
              delete parsed.state?.tokenExpireAt;
              delete parsed.state?.refreshToken;

              localStorage.setItem(name, JSON.stringify(parsed));
            } catch {
              const valueStr =
                typeof value === "string" ? value : JSON.stringify(value);
              localStorage.setItem(name, valueStr);
            }
          },
          removeItem: (name: string) => {
            localStorage.removeItem(name);
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("token_expires");
          },
        } satisfies StateStorage)
      : undefined,
  partialize: (state: AuthState) => {
    // Persist user data - isAuthenticated will be recalculated during rehydration
    // based on token + user existence, don't persist it directly
    return {
      user: state.user,
      // Don't persist isAuthenticated - it will be recalculated during rehydration
      academicYear: state.academicYear,
      academicYears: state.academicYears,
      // Don't persist token, refreshToken - stored in sessionStorage separately
      branches: state.branches,
      currentBranch: state.currentBranch,
    };
  },
  version: 1,
  migrate: (persistedState: unknown, version: number) => {
    // Handle migration from old version if needed
    if (version === 0) {
      return {
        ...persistedState,
        refreshToken: null,
        error: null,
        lastError: null,
      };
    }
    return persistedState;
  },
  onRehydrateStorage: () => {
    return (state: AuthState | undefined, error?: unknown) => {
      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error rehydrating auth state:", error);
        }
        return;
      }

      // CRITICAL: Restore token synchronously during rehydration
      if (state && typeof window !== "undefined") {
        const token = sessionStorage.getItem("access_token");
        const tokenExpires = sessionStorage.getItem("token_expires");

        // Fallback: Check localStorage directly if user is not in state
        // This handles edge cases where Zustand might not have loaded user yet
        let userData = state.user;
        if (!userData && token) {
          try {
            const localStorageData = localStorage.getItem("enhanced-auth-storage");
            if (localStorageData) {
              const parsed = JSON.parse(localStorageData);
              if (parsed.state?.user) {
                userData = parsed.state.user;
                // Also restore other persisted data
                if (parsed.state.branches) state.branches = parsed.state.branches;
                if (parsed.state.currentBranch) state.currentBranch = parsed.state.currentBranch;
                if (parsed.state.academicYear) state.academicYear = parsed.state.academicYear;
                if (parsed.state.academicYears) state.academicYears = parsed.state.academicYears;
              }
            }
          } catch (e) {
            if (process.env.NODE_ENV === "development") {
              console.error("Failed to parse localStorage data:", e);
            }
          }
        }

        if (process.env.NODE_ENV === "development") {
          console.log("Rehydrating auth state:", {
            hasToken: !!token,
            hasTokenExpires: !!tokenExpires,
            hasUser: !!userData,
            userFromState: !!state.user,
            userFromLocalStorage: !!userData && !state.user,
            userEmail: userData?.email,
          });
        }

        // Check if we have both token and user data
        if (token && tokenExpires && userData) {
          const expireAt = parseInt(tokenExpires);
          const now = Date.now();

          // Validate token expiration
          if (now >= expireAt) {
            // Token expired - clear everything and logout
            if (process.env.NODE_ENV === "development") {
              console.log("Token expired during rehydration, logging out");
            }
            state.user = null;
            state.branches = [];
            state.currentBranch = null;
            state.token = null;
            state.tokenExpireAt = null;
            state.isAuthenticated = false;
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("token_expires");
            return;
          }

          // Valid token + user = MUST be authenticated - set directly
          state.user = userData; // Ensure user is set
          state.token = token;
          state.tokenExpireAt = expireAt;
          state.isAuthenticated = true; // CRITICAL: Force authenticated
          
          if (process.env.NODE_ENV === "development") {
            console.log("✅ Auth state restored from storage:", {
              hasUser: !!state.user,
              hasToken: !!state.token,
              isAuthenticated: state.isAuthenticated,
              tokenExpiresIn: Math.round((expireAt - now) / 1000 / 60) + " minutes",
            });
          }
        } else if (!token && (state.user || userData)) {
          // No token but have user - invalid state, clear everything
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ User data found but no token, clearing user data");
          }
          state.user = null;
          state.branches = [];
          state.currentBranch = null;
          state.token = null;
          state.tokenExpireAt = null;
          state.isAuthenticated = false;
        } else if (token && !userData) {
          // Token but no user - this might happen during initial load
          // Don't clear token yet - wait for user data to be loaded
          // The Router component will handle this case
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ Token found but no user data - Router will handle retry");
          }
          state.token = token;
          if (tokenExpires) {
            const expireAt = parseInt(tokenExpires);
            state.tokenExpireAt = expireAt;
          }
          // Don't set isAuthenticated yet - wait for user data
          state.isAuthenticated = false;
        } else {
          // No token and no user - not authenticated
          state.token = null;
          state.tokenExpireAt = null;
          state.isAuthenticated = false;
        }
      }
    };
  },
});

