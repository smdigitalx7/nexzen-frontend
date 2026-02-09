import type { AuthState } from "./authState";
import type { PersistOptions, PersistStorage, StorageValue } from "zustand/middleware";
import { getCookie } from "@/common/utils/cookie";
import { extractPrimaryRole } from "@/common/utils/roles";
import { normalizeRole } from "@/common/constants";

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
export const createAuthStorageConfig = (): PersistOptions<AuthState, Partial<AuthState>> => ({
  name: "enhanced-auth-storage",
  storage:
    typeof window !== "undefined"
      ? ({
          getItem: (name: string): StorageValue<Partial<AuthState>> | null => {
            // CRITICAL: Access token is NOT stored here - it's stored ONLY in memory
            const raw = localStorage.getItem(name);
            if (!raw) return null;

            try {
              const parsed = JSON.parse(raw) as StorageValue<Partial<AuthState>>;
              if (parsed && typeof parsed === "object" && "state" in parsed) {
                const state = (parsed as any).state as Partial<AuthState> | undefined;
                if (state && typeof state === "object") {
                  delete (state as any).accessToken;
                  delete (state as any).token;
                  delete (state as any).tokenExpireAt;
                  delete (state as any).refreshToken;
                  // CRITICAL: Never restore currentBranch - backend (cookies → /auth/me) is source of truth
                  delete (state as any).currentBranch;
                }
              }
              return parsed;
            } catch {
              return null;
            }
          },
          setItem: (name: string, value: StorageValue<Partial<AuthState>>) => {
            // PersistStorage expects already-parsed value.
            // We sanitize before writing.
            try {
              const sanitized: StorageValue<Partial<AuthState>> = {
                ...value,
                state: { ...(value.state as any) },
              };
              // Strip sensitive fields
              delete (sanitized.state as any).accessToken;
              delete (sanitized.state as any).token;
              delete (sanitized.state as any).tokenExpireAt;
              delete (sanitized.state as any).refreshToken;

              localStorage.setItem(name, JSON.stringify(sanitized));
            } catch {
              // If serialization fails, do not persist.
            }
          },
          removeItem: (name: string) => {
            localStorage.removeItem(name);
            // Note: We don't store accessToken in sessionStorage anymore
            // But clean up legacy data if it exists
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("token_expires");
          },
        } satisfies PersistStorage<Partial<AuthState>>)
      : undefined,
  partialize: (state: AuthState) => {
    // CRITICAL: Only persist user info and branch list, NOT accessToken, NOT currentBranch
    // currentBranch must always come from backend (cookies → /auth/me) so UI matches API context.
    // Persisting currentBranch would overwrite correct branch after bootstrapAuth sync (rehydration race).
    return {
      user: state.user,
      academicYear: state.academicYear,
      academicYears: state.academicYears,
      branches: state.branches,
      // Do NOT persist currentBranch - set only from GET /auth/me after login/refresh
    };
  },
  version: 1,
  migrate: (persistedState: unknown, version: number) => {
    // Handle migration from old version if needed
    if (version === 0) {
      if (persistedState && typeof persistedState === "object") {
        return {
          ...(persistedState as Record<string, unknown>),
          refreshToken: null,
          error: null,
          lastError: null,
        } as Partial<AuthState>;
      }
      return {} as Partial<AuthState>;
    }
    return (persistedState ?? {}) as Partial<AuthState>;
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
                if (parsed.state.branches) state.branches = parsed.state.branches;
                if (parsed.state.academicYear) state.academicYear = parsed.state.academicYear;
                if (parsed.state.academicYears) state.academicYears = parsed.state.academicYears;
                // Do NOT restore currentBranch - bootstrapAuth will set it from GET /auth/me (cookies)
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

          // CRITICAL: Restore currentBranch from cookies immediately if branches exist
          // This prevents Sidebar from showing wrong branch/empty until bootstrapAuth finishes
          if (state.branches && state.branches.length > 0) {
            const cookieBranchId = getCookie("X-Branch-ID") || getCookie("X-branch");
            const cookieBranchType = getCookie("X-Branch-Type");
            
            let currentBranch = state.branches[0];
            
            if (cookieBranchId) {
              const id = parseInt(cookieBranchId, 10);
              const found = state.branches.find((b) => b.branch_id === id);
              if (found) currentBranch = found;
            } else if (cookieBranchType) {
              const type = cookieBranchType.toUpperCase();
              const found = state.branches.find((b) => b.branch_type === type);
              if (found) currentBranch = found;
            }
            
            state.currentBranch = currentBranch;
            
            // Sync user's role and branch ID to match the restored branch
            if (currentBranch && state.user) {
              state.user.current_branch_id = currentBranch.branch_id;
              if (currentBranch.roles?.length) {
                const roleFromBranch = extractPrimaryRole(currentBranch.roles);
                if (roleFromBranch) {
                  const normalized = normalizeRole(roleFromBranch);
                  if (normalized) state.user.role = normalized;
                }
              }
            }
          }
        }

        // Don't set isAuthenticated here - bootstrapAuth() will handle that
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

