import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AuthService } from "@/lib/services/general";
import { AuthTokenTimers, DedupeUtils } from "@/lib/api";
import { ROLES, type UserRole, normalizeRole } from "@/lib/constants";
import { extractPrimaryRole } from "@/lib/utils/roles";
import { useCacheStore } from "@/store/cacheStore";
import { queryClient } from "@/lib/query";
import { getTokenExpiration, decodeJWT, getRoleFromToken } from "@/lib/utils/auth/jwt";

export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  institute_id: string;
  current_branch_id: number;
  avatar?: string;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  branch_type: "SCHOOL" | "COLLEGE";
  is_default?: boolean;
  roles?: string[]; // Roles for this branch
}

export interface AcademicYear {
  academic_year_id: number;
  year_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: number | null;
  updated_by: number | null;
}

export interface AuthError {
  code: string;
  message: string;
  timestamp: number;
}

// Permission mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ["*"], // All permissions
  INSTITUTE_ADMIN: ["*"], // All permissions
  ACADEMIC: ["students", "attendance", "marks", "announcements"],
  ACCOUNTANT: [
    "reservations",
    "admissions",
    "students",
    "fees",
    "financial_reports",
    "announcements",
  ],
};

const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ["*"],
  students: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
  attendance: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
  marks: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
  academic: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC"],
  reservations: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  admissions: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  fees: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  financial_reports: ["ADMIN", "INSTITUTE_ADMIN", "ACCOUNTANT"],
  announcements: ["ADMIN", "INSTITUTE_ADMIN", "ACADEMIC", "ACCOUNTANT"],
  users: ["ADMIN", "INSTITUTE_ADMIN"],
  employees: ["ADMIN", "INSTITUTE_ADMIN"],
  payroll: ["ADMIN", "INSTITUTE_ADMIN"],
  transport: ["ADMIN", "INSTITUTE_ADMIN"],
  audit_log: ["ADMIN", "INSTITUTE_ADMIN"],
};

interface AuthState {
  // Core state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBranchSwitching: boolean;
  isTokenRefreshing: boolean;

  // Academic data
  academicYear: string | null;
  academicYears: AcademicYear[];

  // Token management
  token: string | null;
  tokenExpireAt: number | null;
  refreshToken: string | null;

  // Branch management
  branches: Branch[];
  currentBranch: Branch | null;

  // Error handling
  error: AuthError | null;
  lastError: AuthError | null;

  // Computed selectors (getters)
  isAdmin: () => boolean;
  isFullAccess: () => boolean;
  canAccessModule: (module: string) => boolean;
  isTokenExpired: () => boolean;
  isTokenExpiringSoon: () => boolean;
  hasPermission: (permission: string) => boolean;
  getAvailableBranches: () => Branch[];
  getActiveAcademicYear: () => AcademicYear | null;

  // Actions
  login: (
    user: AuthUser,
    branches: Branch[],
    token?: string,
    refreshToken?: string
  ) => Promise<void>;
  logout: () => void;
  logoutAsync: () => Promise<void>;
  switchBranch: (branch: Branch) => Promise<void>;
  switchAcademicYear: (year: AcademicYear) => void;
  setAcademicYears: (years: AcademicYear[]) => void;
  setLoading: (loading: boolean) => void;
  setAcademicYear: (year: string) => void;
  setToken: (token: string | null) => void;
  setTokenAndExpiry: (token: string | null, expireAtMs: number | null) => void;
  refreshTokenAsync: () => Promise<boolean>;
  clearError: () => void;
  setError: (error: AuthError) => void;

  // Optimistic updates
  optimisticBranchSwitch: (branch: Branch) => void;
  rollbackBranchSwitch: () => void;
  optimisticAcademicYearSwitch: (year: AcademicYear) => void;
  rollbackAcademicYearSwitch: () => void;
}

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

          // CRITICAL: Clear pending API requests to prevent them from completing with old token
          try {
            DedupeUtils.clearAll();
          } catch (e) {
            console.warn("Failed to clear pending requests:", e);
          }

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
            
            // CRITICAL: Clear React Query cache to prevent stale dashboard data
            try {
              queryClient.clear();
              // Reset all queries to ensure fresh state
              queryClient.resetQueries();
            } catch (e) {
              console.warn("Failed to clear React Query cache:", e);
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

            // CRITICAL: Clear pending API requests to prevent them from completing with old token
            try {
              DedupeUtils.clearAll();
            } catch (e) {
              console.warn("Failed to clear pending requests:", e);
            }

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
              
              // CRITICAL: Clear React Query cache to prevent stale dashboard data
              try {
                queryClient.clear();
                // Reset all queries to ensure fresh state
                queryClient.resetQueries();
              } catch (e) {
                console.warn("Failed to clear React Query cache:", e);
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
          }
        },
        switchAcademicYear: (year) => {
          // CRITICAL: Keep authentication state when switching academic year
          set({
            academicYear: year.year_name,
            isAuthenticated: true, // Preserve authentication
          });
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
      {
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
                      }) as any;
                    }
                    return null;
                  }

                  try {
                    const parsed = JSON.parse(userData);
                    // Token is not stored in localStorage, we'll get it from sessionStorage in onRehydrateStorage
                    // Just return the user data as-is
                    return JSON.stringify(parsed) as any;
                  } catch {
                    return userData as any;
                  }
                },
                setItem: (name: string, value: any) => {
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
              } as any)
            : undefined,
        partialize: (state) => {
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
        migrate: (persistedState: any, version: number) => {
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
          return (state, error) => {
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
      }
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
