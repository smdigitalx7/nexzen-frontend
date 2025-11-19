import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AuthService } from "@/lib/services/general";
import { AuthTokenTimers } from "@/lib/api";
import { ROLES, normalizeRole } from "@/lib/constants";
import { extractPrimaryRole } from "@/lib/utils/roles";
import { useCacheStore } from "@/store/cacheStore";
import { queryClient } from "@/lib/query";
import { getTokenExpiration, decodeJWT, getRoleFromToken } from "@/lib/utils/auth/jwt";
import { batchInvalidateQueries } from "@/lib/hooks/common/useGlobalRefetch";
import { getBranchDependentQueryKeys, getAcademicYearDependentQueryKeys } from "@/lib/hooks/common/branch-dependent-keys";

// Import extracted types and modules
export type {
  AuthUser,
  Branch,
  AcademicYear,
  AuthError,
} from "./auth/types";
import { MODULE_PERMISSIONS, ROLE_PERMISSIONS } from "./auth/permissions";
import type { AuthState } from "./auth/authState";
import { createAuthStorageConfig } from "./auth/storage";

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state - Zustand persist will hydrate this from localStorage
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isBranchSwitching: false,
        isTokenRefreshing: false,
        academicYear: null,
        academicYears: [],
        token: null,
        tokenExpireAt: null,
        refreshToken: null,
        branches: [],
        currentBranch: null,
        error: null,
        lastError: null,

        // Computed selectors
        isAdmin: () => {
          const { user } = get();
          return (
            user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN
          );
        },

        isFullAccess: () => {
          const { user } = get();
          return (
            user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN
          );
        },

        canAccessModule: (module: string) => {
          const { user } = get();
          if (!user) return false;

          const moduleRoles = MODULE_PERMISSIONS[module];
          if (!moduleRoles) return false;

          return moduleRoles.includes("*") || moduleRoles.includes(user.role);
        },

        isTokenExpired: () => {
          const { tokenExpireAt } = get();
          if (!tokenExpireAt) return true;
          return Date.now() >= tokenExpireAt;
        },

        isTokenExpiringSoon: () => {
          const { tokenExpireAt } = get();
          if (!tokenExpireAt) return true;
          const fiveMinutes = 5 * 60 * 1000;
          return Date.now() >= tokenExpireAt - fiveMinutes;
        },

        hasPermission: (permission: string) => {
          const { user } = get();
          if (!user) return false;

          const rolePermissions = ROLE_PERMISSIONS[user.role];
          return (
            rolePermissions.includes("*") ||
            rolePermissions.includes(permission)
          );
        },

        getAvailableBranches: () => {
          const { branches } = get();
          return branches.filter((branch) => branch.branch_id > 0);
        },

        getActiveAcademicYear: () => {
          const { academicYears } = get();
          return academicYears.find((year) => year.is_active) || null;
        },
        // Actions
        login: async (user, branches, token, refreshToken) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const defaultBranch =
              branches.find((b) => b.is_default) || branches[0];

            set((state) => {
              state.user = user;
              state.branches = branches;
              state.currentBranch = defaultBranch;
              state.isLoading = false;
              state.error = null;

              // CRITICAL: Set token and authenticated state
              // Token should already be set via setTokenAndExpiry before login is called
              // But we ensure it's set here as well for safety
              if (token) {
                state.token = token;
                // Set authenticated only if we have both token and user
                if (user) {
                  state.isAuthenticated = true;
                }
              }
              
              if (refreshToken) {
                state.refreshToken = refreshToken;
              }
            });

            // Set up token refresh if we have a token
            if (token) {
              AuthTokenTimers.scheduleProactiveRefresh();
            }
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.error = {
                code: "LOGIN_FAILED",
                message:
                  error instanceof Error ? error.message : "Login failed",
                timestamp: Date.now(),
              };
            });
            throw error;
          }
        },
        logout: () => {
          AuthTokenTimers.clearProactiveRefresh();

          // Note: Request deduplication is handled by React Query automatically

          // CRITICAL: Clear user state FIRST to prevent hooks from accessing stale data
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.academicYear = null;
            state.academicYears = [];
            state.token = null;
            state.tokenExpireAt = null;
            state.refreshToken = null;
            state.branches = [];
            state.currentBranch = null;
            state.isLoading = false;
            state.isBranchSwitching = false;
            state.isTokenRefreshing = false;
            state.error = null;
            state.lastError = null;
          });

          // Clear ALL storage: sessionStorage, localStorage, and Zustand persist
          if (typeof window !== "undefined") {
            // Clear sessionStorage
            sessionStorage.removeItem("access_token");
            sessionStorage.removeItem("token_expires");
            
            // CRITICAL: Clear localStorage (Zustand persist stores user data here)
            localStorage.removeItem("enhanced-auth-storage");
            
            // Clear API cache
            try {
              useCacheStore.getState().clear();
            } catch (e) {
              console.warn("Failed to clear cache store:", e);
            }
            
            // ✅ FIX: Invalidate all queries instead of clearing (prevents flicker)
            // Note: On logout, we DO want to clear everything since user is leaving
            try {
              // Invalidate all queries - React Query will handle cleanup
              void queryClient.invalidateQueries();
              // Reset queries to ensure fresh state on next login
              queryClient.resetQueries();
            } catch (e) {
              console.warn("Failed to invalidate React Query cache:", e);
            }
          }
        },
        logoutAsync: async () => {
          try {
            console.log("Starting logout process...");

            // Call the backend logout endpoint (this needs the current token)
            await AuthService.logout();
            console.log("Backend logout successful");
          } catch (error) {
            console.error("Backend logout failed:", error);
            // Continue with client-side cleanup even if backend fails
          } finally {
            // Clear all client-side state (same as logout())
            AuthTokenTimers.clearProactiveRefresh();

            // Note: Request deduplication is handled by React Query automatically

            // CRITICAL: Clear auth store FIRST to prevent hooks from accessing stale data
            set({
              user: null,
              isAuthenticated: false,
              academicYear: null,
              academicYears: [],
              token: null,
              tokenExpireAt: null,
              refreshToken: null,
              branches: [],
              currentBranch: null,
              isLoading: false,
              isBranchSwitching: false,
              isTokenRefreshing: false,
              error: null,
              lastError: null,
            });

            // Clear ALL storage: sessionStorage, localStorage, and caches
            if (typeof window !== "undefined") {
              sessionStorage.removeItem("access_token");
              sessionStorage.removeItem("token_expires");
              localStorage.removeItem("enhanced-auth-storage");
              
              try {
                useCacheStore.getState().clear();
              } catch (e) {
                console.warn("Failed to clear cache store:", e);
              }
              
              // ✅ FIX: Invalidate all queries instead of clearing (prevents flicker)
              // Note: On logout, we DO want to clear everything since user is leaving
              try {
                // Invalidate all queries - React Query will handle cleanup
                void queryClient.invalidateQueries();
                // Reset queries to ensure fresh state on next login
                queryClient.resetQueries();
              } catch (e) {
                console.warn("Failed to invalidate React Query cache:", e);
              }
            }

            console.log("User logged out successfully");
          }
        },
        switchBranch: async (branch) => {
          set({ isBranchSwitching: true });
          try {
            console.log(
              "Switching to branch:",
              branch.branch_name,
              "ID:",
              branch.branch_id
            );

            // Call the backend API to switch branch and get new token
            const response = (await AuthService.switchBranch(
              branch.branch_id
            )) as any;
            console.log("Branch switch response:", response);

            // Update branch and token with new branch context
            if (response?.access_token) {
              // Extract user info from response if available
              let newRole: string | null = null;
              if (response.user_info && response.user_info.branches) {
                const branchInfo = response.user_info.branches.find(
                  (b: any) => b.branch_id === branch.branch_id
                );
                if (
                  branchInfo &&
                  branchInfo.roles &&
                  branchInfo.roles.length > 0
                ) {
                  newRole = extractPrimaryRole(branchInfo.roles);
                }
              }

              // Update current branch first for UI immediacy
              set({ currentBranch: branch });

              // Persist token
              const expireAtMs = response?.expiretime
                ? new Date(response.expiretime).getTime()
                : null;
              useAuthStore
                .getState()
                .setTokenAndExpiry(response.access_token, expireAtMs);

              // Update user role if we extracted it from response
              const current = useAuthStore.getState();
              if (current.user && newRole) {
                const normalizedRole = normalizeRole(newRole);
                if (normalizedRole) {
                  set({
                    user: {
                      ...current.user,
                      current_branch_id: branch.branch_id,
                      role: normalizedRole,
                    },
                    // CRITICAL: Keep authenticated true after branch switch
                    isAuthenticated: true,
                  });
                }
              } else if (current.user) {
                // Fallback: extract role from branch.roles if available
                if (branch.roles && branch.roles.length > 0) {
                  const roleToUse = extractPrimaryRole(branch.roles);
                  if (roleToUse) {
                    const normalizedRole = normalizeRole(roleToUse);
                    if (normalizedRole) {
                      set({
                        user: {
                          ...current.user,
                          current_branch_id: branch.branch_id,
                          role: normalizedRole,
                        },
                        // CRITICAL: Keep authenticated true after branch switch
                        isAuthenticated: true,
                      });
                    }
                  }
                } else {
                  set({
                    user: {
                      ...current.user,
                      current_branch_id: branch.branch_id,
                    },
                    // CRITICAL: Keep authenticated true after branch switch
                    isAuthenticated: true,
                  });
                }
              }

              set({ isBranchSwitching: false });
              console.log(
                "Branch switched successfully with new token and clients updated"
              );

              // ✅ FIX: Selective invalidation instead of clear() - prevents UI flicker
              try {
                // Only invalidate queries that depend on branch context
                const branchDependentKeys = getBranchDependentQueryKeys();
                batchInvalidateQueries(branchDependentKeys);
                
                // Refetch active queries in next frame (React Query handles deduplication)
                requestAnimationFrame(() => {
                  queryClient.refetchQueries({ type: 'active' });
                });
                
                console.log("Branch-dependent queries invalidated and will refetch");
              } catch (error) {
                console.error("Error invalidating queries after branch switch:", error);
              }
            } else {
              // Fallback to just updating the branch if no token response
              // Extract role from branch.roles if available
              const current = useAuthStore.getState();
              if (current.user && branch.roles && branch.roles.length > 0) {
                const roleToUse = extractPrimaryRole(branch.roles);
                if (roleToUse) {
                  const normalizedRole = normalizeRole(roleToUse);
                  if (normalizedRole) {
                    set({
                      currentBranch: branch,
                      user: {
                        ...current.user,
                        current_branch_id: branch.branch_id,
                        role: normalizedRole,
                      },
                      // CRITICAL: Keep authenticated true
                      isAuthenticated: true,
                      isBranchSwitching: false,
                    });
                  } else {
                    set({
                      currentBranch: branch,
                      isAuthenticated: true, // Keep authenticated
                      isBranchSwitching: false,
                    });
                  }
                } else {
                  set({
                    currentBranch: branch,
                    isAuthenticated: true, // Keep authenticated
                    isBranchSwitching: false,
                  });
                }
              } else {
                set({
                  currentBranch: branch,
                  isAuthenticated: true, // Keep authenticated
                  isBranchSwitching: false,
                });
              }
              console.log("Branch switched locally (no token response)");

              // ✅ FIX: Selective invalidation instead of clear() - prevents UI flicker
              try {
                // Only invalidate queries that depend on branch context
                const branchDependentKeys = getBranchDependentQueryKeys();
                batchInvalidateQueries(branchDependentKeys);
                
                // Refetch active queries in next frame (React Query handles deduplication)
                requestAnimationFrame(() => {
                  queryClient.refetchQueries({ type: 'active' });
                });
                
                console.log("Branch-dependent queries invalidated and will refetch");
              } catch (error) {
                console.error("Error invalidating queries after branch switch:", error);
              }
            }
          } catch (error) {
            console.error("Failed to switch branch:", error);
            // Still update the branch locally even if API call fails
            // Extract role from branch.roles if available
            const current = useAuthStore.getState();
            if (current.user && branch.roles && branch.roles.length > 0) {
              const roleToUse = extractPrimaryRole(branch.roles);
              if (roleToUse) {
                const normalizedRole = normalizeRole(roleToUse);
                if (normalizedRole) {
                  set({
                    currentBranch: branch,
                    user: {
                      ...current.user,
                      current_branch_id: branch.branch_id,
                      role: normalizedRole,
                    },
                    // CRITICAL: Keep authenticated true even on error
                    isAuthenticated: true,
                    isBranchSwitching: false,
                  });
                } else {
                  set({
                    currentBranch: branch,
                    isAuthenticated: true, // Keep authenticated
                    isBranchSwitching: false,
                  });
                }
              } else {
                set({
                  currentBranch: branch,
                  isAuthenticated: true, // Keep authenticated
                  isBranchSwitching: false,
                });
              }
            } else {
              set({
                currentBranch: branch,
                isAuthenticated: true, // Keep authenticated
                isBranchSwitching: false,
              });
            }
            console.log("Branch switched locally (API call failed)");

            // ✅ FIX: Selective invalidation instead of clear() - prevents UI flicker
            try {
              // Only invalidate queries that depend on branch context
              const branchDependentKeys = getBranchDependentQueryKeys();
              batchInvalidateQueries(branchDependentKeys);
              
              // Refetch active queries (React Query handles deduplication)
              queryClient.refetchQueries({ type: 'active' });
              
              console.log("Branch-dependent queries invalidated and refetched");
            } catch (error) {
              console.error("Error invalidating queries after branch switch:", error);
            }
          }
        },
        switchAcademicYear: (year) => {
          // CRITICAL: Keep authentication state when switching academic year
          set({
            academicYear: year.year_name,
            isAuthenticated: true, // Preserve authentication
          });

          // ✅ FIX: Selective invalidation instead of clear() - prevents UI flicker
          try {
            // Only invalidate queries that depend on academic year context
            const academicYearDependentKeys = getAcademicYearDependentQueryKeys();
            batchInvalidateQueries(academicYearDependentKeys);
            
            // Refetch active queries in next frame (React Query handles deduplication)
            requestAnimationFrame(() => {
              queryClient.refetchQueries({ type: 'active' });
            });
            
            console.log("Academic year-dependent queries invalidated and will refetch");
          } catch (error) {
            console.error("Error invalidating queries after academic year switch:", error);
          }
        },
        setAcademicYears: (years) => {
          set({ academicYears: years });
        },
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        setAcademicYear: (year) => {
          // CRITICAL: Keep authentication state when setting academic year
          set({
            academicYear: year,
            isAuthenticated: true, // Preserve authentication
          });
        },
        setToken: (token) => {
          set({ token });
        },
        setTokenAndExpiry: (token, expireAtMs) => {
          set((state) => {
            state.token = token;
            state.tokenExpireAt = expireAtMs;
          });

          // Also store in sessionStorage for security
          if (typeof window !== "undefined") {
            if (token) {
              sessionStorage.setItem("access_token", token);
              if (expireAtMs) {
                sessionStorage.setItem("token_expires", String(expireAtMs));
              }
            } else {
              sessionStorage.removeItem("access_token");
              sessionStorage.removeItem("token_expires");
            }
          }
        },

        refreshTokenAsync: async () => {
          set((state) => {
            state.isTokenRefreshing = true;
            state.error = null;
          });

          try {
            const response = await AuthService.refresh();

            if (!response?.access_token) {
              set((state) => {
                state.isTokenRefreshing = false;
                state.error = {
                  code: "TOKEN_REFRESH_FAILED",
                  message: "No access token in refresh response",
                  timestamp: Date.now(),
                };
              });
              return false;
            }

            // Decode new token to extract expiration and update role if needed
            const tokenPayload = decodeJWT(response.access_token);
            let expireAtMs: number | null = null;

            if (tokenPayload) {
              // Extract new expiration from token
              const tokenExpiration = getTokenExpiration(response.access_token);
              expireAtMs = tokenExpiration
                ? tokenExpiration
                : response.expiretime
                  ? new Date(response.expiretime).getTime()
                  : null;

              // Update user role if it changed
              const currentState = get();
              if (currentState.user && tokenPayload.current_branch_id) {
                const newRole = getRoleFromToken(
                  response.access_token,
                  tokenPayload.current_branch_id
                );
                const normalizedRole = normalizeRole(newRole);

                if (
                  normalizedRole &&
                  currentState.user.role !== normalizedRole
                ) {
                  set((state) => {
                    if (state.user) {
                      state.user.role = normalizedRole;
                    }
                  });
                }
              }
            } else {
              // Fallback to expiretime from response
              expireAtMs = response.expiretime
                ? new Date(response.expiretime).getTime()
                : null;
            }

            // Update token and expiration once
            get().setTokenAndExpiry(response.access_token, expireAtMs);

            set((state) => {
              state.isTokenRefreshing = false;
            });

            return true;
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("Token refresh failed:", error);
            }

            set((state) => {
              state.isTokenRefreshing = false;
              state.error = {
                code: "TOKEN_REFRESH_FAILED",
                message:
                  error instanceof Error
                    ? error.message
                    : "Token refresh failed",
                timestamp: Date.now(),
              };
            });

            // If refresh fails, logout user
            get().logout();

            return false;
          }
        },

        clearError: () => {
          set((state) => {
            state.lastError = state.error;
            state.error = null;
          });
        },

        setError: (error) => {
          set((state) => {
            state.lastError = state.error;
            state.error = error;
          });
        },

        // Optimistic updates
        optimisticBranchSwitch: (branch) => {
          const previousBranch = get().currentBranch;

          set((state) => {
            state.currentBranch = branch;
            state.isBranchSwitching = true;
          });

          // Store previous state for rollback
          (get() as any)._previousBranch = previousBranch;
        },

        rollbackBranchSwitch: () => {
          const previousBranch = (get() as any)._previousBranch;

          if (previousBranch) {
            set((state) => {
              state.currentBranch = previousBranch;
              state.isBranchSwitching = false;
            });
          }
        },

        optimisticAcademicYearSwitch: (year) => {
          const previousYear = get().academicYear;

          set((state) => {
            state.academicYear = year.year_name;
          });

          // Store previous state for rollback
          (get() as any)._previousAcademicYear = previousYear;
        },

        rollbackAcademicYearSwitch: () => {
          const previousYear = (get() as any)._previousAcademicYear;

          if (previousYear) {
            set((state) => {
              state.academicYear = previousYear;
            });
          }
        },
      })),
      createAuthStorageConfig()
    )
  )
);

// Selectors for better performance
export const useAuthSelectors = () => {
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  return {
    isAdmin,
    isAuthenticated,
    user,
    currentBranch,
    isLoading,
    error,
  };
};

// Permission hooks
export const usePermissions = () => {
  const canAccessModule = useAuthStore((state) => state.canAccessModule);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  return {
    canAccessModule,
    hasPermission,
  };
};

// Token management hooks
export const useTokenManagement = () => {
  const token = useAuthStore((state) => state.token);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired());
  const isTokenExpiringSoon = useAuthStore((state) =>
    state.isTokenExpiringSoon()
  );
  const isTokenRefreshing = useAuthStore((state) => state.isTokenRefreshing);
  const refreshTokenAsync = useAuthStore((state) => state.refreshTokenAsync);

  return {
    token,
    isTokenExpired,
    isTokenExpiringSoon,
    isTokenRefreshing,
    refreshTokenAsync,
  };
};
