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
            // CRITICAL: Access token is NOT stored here - it's stored ONLY in memory
            const userData = localStorage.getItem(name);
            if (!userData) {
              return null;
            }

            try {
              const parsed = JSON.parse(userData);
              // Ensure accessToken is not in persisted data
              if (parsed.state) {
                delete parsed.state.accessToken;
                delete parsed.state.token; // Legacy
                delete parsed.state.tokenExpireAt;
                delete parsed.state.refreshToken;
              }
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
              // CRITICAL: Do NOT store accessToken in sessionStorage or localStorage
              // Access token is stored ONLY in memory (Zustand store)
              // Remove accessToken from persisted data if it exists
              delete parsed.state?.accessToken;
              delete parsed.state?.token; // Legacy
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
            // Note: We don't store accessToken in sessionStorage anymore
            // But clean up legacy data if it exists
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("token_expires");
          },
        } satisfies StateStorage)
      : undefined,
  partialize: (state: AuthState) => {
    // CRITICAL: Only persist user info and branch data, NOT accessToken
    // Access token is stored ONLY in memory (Zustand store) to reduce XSS risk
    // Refresh token is in HttpOnly cookie (set by backend), JavaScript cannot read it
    return {
      user: state.user,
      // Don't persist isAuthenticated - it will be recalculated during rehydration
      academicYear: state.academicYear,
      academicYears: state.academicYears,
      // Don't persist accessToken - stored ONLY in memory
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

      // CRITICAL: Access token is NOT restored from storage - it's stored ONLY in memory
      // On app startup, bootstrapAuth() will call /auth/refresh to get a new access token
      // This ensures we always have a fresh, valid token
      if (state && typeof window !== "undefined") {
        // Restore user data from localStorage (if available)
        // Access token will be obtained via bootstrapAuth() calling /auth/refresh
        let userData = state.user;
        if (!userData) {
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

        // Set user if we have it
        if (userData) {
          state.user = userData;
        }

        // Don't set isAuthenticated here - bootstrapAuth() will handle that
        // after successfully calling /auth/refresh
        state.isAuthenticated = false;
        state.accessToken = null;
        state.tokenExpireAt = null;
        
        // CRITICAL: Keep isAuthInitializing = true if we have user data
        // This ensures AppRouter shows loader instead of login page during bootstrapAuth
        // bootstrapAuth will set isAuthInitializing = false when it completes
        // This prevents the login page flash on refresh
        if (userData) {
          // Keep isAuthInitializing = true so AppRouter shows loader, not login
          // bootstrapAuth will complete and set it to false
          state.isAuthInitializing = true;
        }
      }
    };
  },
});

