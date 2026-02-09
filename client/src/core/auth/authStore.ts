import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AuthService } from "@/features/general/services";
import { AuthTokenTimers } from "@/core/api";
import { ROLES, normalizeRole } from "@/common/constants";
import { extractPrimaryRole } from "@/common/utils/roles";
import { useCacheStore } from "@/store/cacheStore";
import { queryClient } from "@/core/query";
import { getTokenExpiration, decodeJWT, getRoleFromToken } from "@/common/utils/auth/jwt";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { getBranchDependentQueryKeys, getAcademicYearDependentQueryKeys } from "@/common/hooks/branch-dependent-keys";
import { apiClient } from "@/core/api";
import { cancelAllRequests } from "@/core/api/request-cancellation";
import type { AxiosError } from "axios";
import { toast } from "@/common/hooks/use-toast";
import { getCookie } from "@/common/utils/cookie";

// Import extracted types and modules
export type {
  AuthUser,
  Branch,
  AcademicYear,
  AuthError,
} from "./types";
import type { Branch } from "./types";
import { MODULE_PERMISSIONS, ROLE_PERMISSIONS } from "./permissions";
import type { AuthState } from "./authState";
import { createAuthStorageConfig } from "./storage";

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial state
        // CRITICAL: accessToken is stored ONLY in memory (Zustand store), NOT in localStorage/sessionStorage
        // This reduces XSS risk - even if malicious script runs, it cannot access the token
        // Refresh token is in HttpOnly cookie (set by backend), JavaScript cannot read it
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isBranchSwitching: false,
        isAcademicYearSwitching: false,
        isTokenRefreshing: false,
        isAuthInitializing: true, // Start as true - will be set to false after bootstrapAuth completes
        isLoggingOut: false, // Flag to prevent race conditions (idle timeout, interceptor, manual logout)
        academicYear: null,
        academicYears: [],
        accessToken: null, // Stored ONLY in memory, never in localStorage
        tokenExpireAt: null,
        branches: [],
        currentBranch: null,
        error: null,
        lastError: null,
        
        // Legacy: Keep 'token' as alias for backward compatibility
        get token() {
          try {
            const state = get();
            return state?.accessToken ?? null;
          } catch {
            return null;
          }
        },

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
        
        // New actions matching backend contract
        /**
         * Bootstrap auth on app startup
         * Calls POST /api/v1/auth/refresh to restore session from refreshToken cookie.
         * On logout we clear all storage; refresh will fail (cookie gone) and RequireAuth shows login.
         */
        bootstrapAuth: async () => {
          const currentState = get();
          
          // CRITICAL: Check if logout is in progress - don't bootstrap during logout
          if (currentState.isLoggingOut) {
            set((state) => {
              state.isAuthInitializing = false;
              state.isAuthenticated = false;
            });
            if (process.env.NODE_ENV === "development") {
              console.log("Skipping bootstrapAuth: logout is in progress");
            }
            return;
          }

          // Skip bootstrap if already authenticated (user just logged in)
          if (currentState.isAuthenticated && currentState.user && currentState.accessToken) {
            set((state) => {
              state.isAuthInitializing = false;
            });
            return;
          }

          set((state) => {
            state.isAuthInitializing = true;
            state.error = null;
          });

          try {
            // Call refresh endpoint - refreshToken is in HttpOnly cookie
            const response = await apiClient.post("/auth/refresh");

            if (response.data?.access_token && response.data?.user_info) {
              // Parse expiretime ISO string into timestamp (ms)
              const expireAtMs = response.data.expiretime
                ? new Date(response.data.expiretime).getTime()
                : null;

              // Store access token in memory only
              set((state) => {
                state.accessToken = response.data.access_token;
                state.tokenExpireAt = expireAtMs;
              });

              // Set user info (currentBranch is set to first branch; we overwrite from /auth/me next)
              get().setUser(response.data.user_info);

              // CRITICAL: Sync branch from backend cookies (X-Branch-ID, X-Branch-Type), not from local storage or first branch.
              // GET /auth/me is sent with current cookies, so response reflects the backend's branch context.
              try {
                const meResponse = await apiClient.get("/auth/me");
                const meData = meResponse.data;
                if (meData && get().user) {
                  set((state) => {
                    if (!state.user) return;
                    if (meData.user_id != null) state.user.user_id = String(meData.user_id);
                    if (meData.institute_id != null) state.user.institute_id = String(meData.institute_id);
                    if (meData.current_branch_id != null) {
                      state.user.current_branch_id = meData.current_branch_id;
                      const branchMatch = state.branches.find(
                        (b) => b.branch_id === meData.current_branch_id
                      );
                      if (branchMatch) {
                        state.currentBranch = branchMatch;
                        if (branchMatch.roles?.length) {
                          const roleFromBranch = extractPrimaryRole(branchMatch.roles);
                          if (roleFromBranch) {
                            const normalized = normalizeRole(roleFromBranch);
                            if (normalized) state.user.role = normalized;
                          }
                        }
                      } else {
                        const bt = meData.current_branch?.toUpperCase();
                        const branchType: "COLLEGE" | "SCHOOL" = bt === "COLLEGE" ? "COLLEGE" : "SCHOOL";
                        state.currentBranch = {
                          branch_id: meData.current_branch_id,
                          branch_name: meData.branch_name ?? "",
                          branch_type: branchType,
                          roles: meData.roles?.map((r: { role: string }) => r.role) ?? [],
                        };
                        if (meData.roles?.length) {
                          const roleFromBranch = extractPrimaryRole(meData.roles.map((r: { role: string }) => r.role));
                          if (roleFromBranch) {
                            const normalized = normalizeRole(roleFromBranch);
                            if (normalized) state.user.role = normalized;
                          }
                        }
                      }
                    }
                  });
                }
              } catch (meError) {
                if (process.env.NODE_ENV === "development") {
                  console.warn("Failed to sync branch from /auth/me after refresh:", meError);
                }
              }

              // Set authenticated
              set((state) => {
                state.isAuthenticated = true;
              });
            } else {
              // Invalid response - only clear auth state if not already authenticated
              const currentState = get();
              if (!currentState.isAuthenticated) {
                set((state) => {
                  state.accessToken = null;
                  state.tokenExpireAt = null;
                  state.user = null;
                  state.isAuthenticated = false;
                });
              }
            }
          } catch (error) {
            // Refresh failed (401 or network error) - only clear auth state if not already authenticated
            const axiosError = error as AxiosError;
            const currentState = get();
            
            // Bootstrap auth failed - handled below

            // Only clear auth state if user is not already authenticated
            // This prevents clearing auth state after a successful login
            if (!currentState.isAuthenticated) {
              set((state) => {
                state.accessToken = null;
                state.tokenExpireAt = null;
                state.user = null;
                state.isAuthenticated = false;
              });
            }
          } finally {
            set((state) => {
              state.isAuthInitializing = false;
            });
          }
        },

        /**
         * Login with identifier (email) and password
         * Calls POST /api/v1/auth/login
         * Backend sets HttpOnly refreshToken cookie automatically
         */
        login: async (identifier: string, password: string) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Call login endpoint - withCredentials: true is set in apiClient
            const response = await apiClient.post("/auth/login", {
              identifier,
              password,
            });

            if (!response.data?.access_token || !response.data?.user_info) {
              throw new Error("Invalid login response: missing access_token or user_info");
            }

            // Parse expiretime ISO string into timestamp (ms)
            const expireAtMs = response.data.expiretime
              ? new Date(response.data.expiretime).getTime()
              : null;

            // Store access token in memory only
            set((state) => {
              state.accessToken = response.data.access_token;
              state.tokenExpireAt = expireAtMs;
            });

            // Validate user_info structure before setting
            if (!response.data.user_info) {
              throw new Error("Invalid login response: user_info is missing");
            }

            const userInfo = response.data.user_info;
            
            // Validate branches - ensure it exists and is an array
            if (!userInfo.branches) {
              console.error("Login response user_info:", userInfo);
              throw new Error("Invalid login response: user_info.branches is missing");
            }

            if (!Array.isArray(userInfo.branches)) {
              console.error("Login response branches type:", typeof userInfo.branches, "value:", userInfo.branches);
              throw new Error(`Invalid login response: user_info.branches is not an array. Received: ${typeof userInfo.branches}. Value: ${JSON.stringify(userInfo.branches)}`);
            }

            if (userInfo.branches.length === 0) {
              throw new Error("Invalid login response: user_info.branches array is empty");
            }

            // Set user info (preserves role identification from login response)
            try {
              get().setUser(userInfo);
            } catch (setUserError) {
              console.error("Error in setUser:", setUserError);
              console.error("User info being set:", userInfo);
              throw setUserError;
            }

            // CRITICAL: Sync branch and user from /auth/me so UI matches backend cookies (X-Branch-ID, X-Branch-Type).
            // Brief delay so the browser has applied Set-Cookie from the login response before we call /auth/me.
            await new Promise((resolve) => setTimeout(resolve, 50));
            try {
              const meResponse = await apiClient.get("/auth/me");
              const meData = meResponse.data;
              if (meData && get().user) {
                set((state) => {
                  if (!state.user) return;
                  if (meData.user_id != null) state.user.user_id = String(meData.user_id);
                  if (meData.institute_id != null) state.user.institute_id = String(meData.institute_id);
                  if (meData.current_branch_id != null) {
                    state.user.current_branch_id = meData.current_branch_id;
                    const branchMatch = state.branches.find(
                      (b) => b.branch_id === meData.current_branch_id
                    );
                    if (branchMatch) {
                      state.currentBranch = branchMatch;
                      if (branchMatch.roles?.length) {
                        const roleFromBranch = extractPrimaryRole(branchMatch.roles);
                        if (roleFromBranch) {
                          const normalized = normalizeRole(roleFromBranch);
                          if (normalized) state.user.role = normalized;
                        }
                      }
                    } else {
                      // Fallback: build currentBranch from /auth/me so UI and API context stay in sync
                      const bt = meData.current_branch?.toUpperCase();
                      const branchType: "COLLEGE" | "SCHOOL" = bt === "COLLEGE" ? "COLLEGE" : "SCHOOL";
                      state.currentBranch = {
                        branch_id: meData.current_branch_id,
                        branch_name: meData.branch_name ?? "",
                        branch_type: branchType,
                        roles: meData.roles?.map((r: { role: string }) => r.role) ?? [],
                      };
                      if (meData.roles?.length) {
                        const roleFromBranch = extractPrimaryRole(meData.roles.map((r: { role: string }) => r.role));
                        if (roleFromBranch) {
                          const normalized = normalizeRole(roleFromBranch);
                          if (normalized) state.user.role = normalized;
                        }
                      }
                    }
                  }
                });
              }
            } catch (error) {
              if (process.env.NODE_ENV === "development") {
                console.warn("Failed to sync from /auth/me after login:", error);
              }
            }

            // Set authenticated
            set((state) => {
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error) {
            const axiosError = error as AxiosError;
            let errorMessage = "Login failed";

            if (axiosError.response?.data) {
              const data = axiosError.response.data as any;
              if (data.detail) {
                errorMessage = typeof data.detail === "string" 
                  ? data.detail 
                  : "Invalid credentials";
              }
            } else if (axiosError.message) {
              errorMessage = axiosError.message;
            }

            set((state) => {
              state.isLoading = false;
              state.error = {
                code: "LOGIN_FAILED",
                message: errorMessage,
                timestamp: Date.now(),
              };
            });

            throw new Error(errorMessage);
          }
        },

        /**
         * Logout - clears auth state and optionally calls backend logout endpoint
         * Prevents race conditions with idle timeout and interceptor
         * @param reason - Optional reason for logout (idle_timeout, manual, token_expired)
         */
        logout: async (reason?: "idle_timeout" | "manual" | "token_expired") => {
          const currentState = get();
          
          if (currentState.isLoggingOut) return;

          set((state) => {
            state.isLoggingOut = true;
          });
          
          // HARD KILL-SWITCH
          try {
            await queryClient.cancelQueries();
            queryClient.clear();
          } catch (e) {
            console.warn("Failed to clear React Query cache:", e);
          }
          try {
            // Use AuthService for consistency
            await AuthService.logout();
            if (process.env.NODE_ENV === "development") {
              console.log("Logout API call completed successfully");
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.warn("Backend logout failed:", error);
            }
          }

          // Clear auth store state
          set({
            user: null,
            isAuthenticated: false,
            academicYear: null,
            academicYears: [],
            accessToken: null,
            tokenExpireAt: null,
            branches: [],
            currentBranch: null,
            isLoading: false,
            isBranchSwitching: false,
            isAcademicYearSwitching: false,
            isLoggingOut: false,
            error: null,
            lastError: null,
          });

          // Clear ALL storage (full clear on logout; bootstrap will run on next load, refresh will fail)
          if (typeof window !== "undefined") {
            AuthTokenTimers.clearProactiveRefresh();
            sessionStorage.clear();
            localStorage.clear();
            try {
              useCacheStore.getState().clear();
            } catch (e) {
              console.warn("Failed to clear cache store:", e);
            }
            // Flag for login page to show "Successfully logged out" toast (set after clear so it survives until login mounts)
            sessionStorage.setItem("showLogoutToast", "1");
          }
        },

        /**
         * Set user info from backend response
         */
        setUser: (userInfo: {
          full_name: string;
          email: string;
          branches: Array<{
            branch_id: number;
            branch_name: string;
            roles: string[];
          }>;
        }) => {
          // Validate userInfo structure
          if (!userInfo) {
            throw new Error("Invalid user info: userInfo is null or undefined");
          }

          // Validate branches - ensure it's an array
          if (!userInfo.branches) {
            throw new Error("Invalid user info: branches field is missing");
          }

          if (!Array.isArray(userInfo.branches)) {
            throw new Error(`Invalid user info: branches is not an array. Received: ${typeof userInfo.branches}`);
          }

          if (userInfo.branches.length === 0) {
            throw new Error("Invalid user info: branches array is empty");
          }

          // Create branch list with validation
          const branchList = userInfo.branches.map((b, index) => {
            if (!b.branch_id || !b.branch_name) {
              throw new Error(`Invalid branch at index ${index}: missing branch_id or branch_name`);
            }
            return {
              branch_id: b.branch_id,
              branch_name: b.branch_name,
              branch_type: b.branch_name.toUpperCase().includes("COLLEGE")
                ? ("COLLEGE" as const)
                : ("SCHOOL" as const),
              roles: Array.isArray(b.roles) ? b.roles : [],
            };
          });

          // CRITICAL: Sync branch from backend cookies (X-Branch-ID, X-Branch-Type) if available.
          // This ensures that on refresh, the UI matches the backend's branch context (cookies) immediately,
          // preventing the "switch to default" issues where the UI shows School while API context is College.
          const cookieBranchId = getCookie("X-Branch-ID") || getCookie("X-branch");
          const cookieBranchType = getCookie("X-Branch-Type");
          
          let currentBranch = branchList[0];
          
          if (cookieBranchId) {
            const id = parseInt(cookieBranchId, 10);
            const found = branchList.find((b) => b.branch_id === id);
            if (found) {
              currentBranch = found;
            }
          } else if (cookieBranchType) {
            const type = cookieBranchType.toUpperCase();
            const found = branchList.find((b) => b.branch_type === type);
            if (found) {
              currentBranch = found;
            }
          }

          if (!currentBranch) {
            throw new Error("Failed to set current branch");
          }

          // Extract role from the selected branch (preserved or first)
          if (!currentBranch.roles || !Array.isArray(currentBranch.roles) || currentBranch.roles.length === 0) {
            throw new Error("Invalid user info: selected branch roles is missing or not an array");
          }

          const roleFromBranch = extractPrimaryRole(currentBranch.roles);
          if (!roleFromBranch) {
            throw new Error("User role not found in selected branch");
          }

          const normalizedRole = normalizeRole(roleFromBranch);
          if (!normalizedRole) {
            throw new Error(`Invalid user role: ${roleFromBranch}`);
          }

          // Create user object
          const user = {
            user_id: String(currentBranch.branch_id), // Fallback
            full_name: userInfo.full_name || "",
            email: userInfo.email || "",
            role: normalizedRole,
            institute_id: "1", // Default
            current_branch_id: currentBranch.branch_id,
          };

          set((state) => {
            state.user = user;
            state.branches = branchList;
            state.currentBranch = currentBranch;
          });

        },

        /**
         * Set current branch
         */
        setCurrentBranch: (branch: Branch | null) => {
          set((state) => {
            state.currentBranch = branch;
          });
        },

        /**
         * Set access token and expiry (in memory only)
         * expiretime can be ISO string or null
         */
        setTokenAndExpiry: (
          accessToken: string | null,
          expiretime: string | number | null
        ) => {
          const expireAtMs =
            typeof expiretime === "number"
              ? expiretime
              : expiretime
                ? new Date(expiretime).getTime()
                : null;
          set((state) => {
            state.accessToken = accessToken;
            state.tokenExpireAt = expireAtMs;
          });
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
        // Legacy login function (kept for backward compatibility)
        // NOTE: This is the old signature. New code should use login(identifier, password)
        loginLegacy: async (
          user: AuthState["user"],
          branches: Branch[],
          token: string | null,
          refreshToken: string | undefined
        ) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Validate branches is an array
            if (!branches) {
              throw new Error("Invalid login: branches parameter is missing");
            }

            if (!Array.isArray(branches)) {
              throw new Error(`Invalid login: branches is not an array. Received: ${typeof branches}`);
            }

            if (branches.length === 0) {
              throw new Error("Invalid login: branches array is empty");
            }

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
                state.accessToken = token;
                // Set authenticated only if we have both token and user
                if (user) {
                  state.isAuthenticated = true;
                }
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
        // Legacy logout (synchronous) - kept for backward compatibility
        logoutLegacy: () => {
          AuthTokenTimers.clearProactiveRefresh();

          // Note: Request deduplication is handled by React Query automatically

          // CRITICAL: Clear user state FIRST to prevent hooks from accessing stale data
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.academicYear = null;
            state.academicYears = [];
            state.accessToken = null;
            state.tokenExpireAt = null;
            state.branches = [];
            state.currentBranch = null;
            state.isLoading = false;
            state.isBranchSwitching = false;
            state.isAcademicYearSwitching = false;
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
          return get().logout("manual");
        },
        /**
         * Switch branch: POST /auth/switch-branch/{branch_id} with Bearer and credentials.
         * Response is context-only (branch_id, branch_type, academic_year_id); no new access token.
         * Backend sets X-Branch-ID, X-Academic-Year-ID, X-Branch-Type cookies.
         * We update store from response and /auth/me, then invalidate branch-dependent queries.
         */
        switchBranch: async (branch) => {
          set({ isBranchSwitching: true });
          try {
            await AuthService.switchBranch(branch.branch_id);

            // Update store from selected branch (response is context-only; no token)
            const current = useAuthStore.getState();
            const newRole =
              branch.roles && branch.roles.length > 0
                ? normalizeRole(extractPrimaryRole(branch.roles))
                : current.user?.role ?? null;

            set((state) => {
              state.currentBranch = branch;
              state.isAuthenticated = true;
              if (state.user) {
                state.user.current_branch_id = branch.branch_id;
                if (newRole) state.user.role = newRole;
              }
            });

            // Sync full context from /auth/me (single source of truth)
            try {
              const meData = await AuthService.me();
              set((s) => {
                if (s.user) {
                  s.user.user_id = String(meData.user_id);
                  s.user.institute_id = String(meData.institute_id);
                  s.user.current_branch_id = meData.current_branch_id;
                  s.user.full_name = meData.full_name;
                  s.user.email = meData.email;
                  const roleForBranch = meData.roles?.find(
                    (r) => r.branch_id === meData.current_branch_id
                  );
                  if (roleForBranch) {
                    const normalized = normalizeRole(roleForBranch.role);
                    if (normalized) s.user.role = normalized;
                  }
                }
                const branchMatch = s.branches.find(
                  (b) => b.branch_id === meData.current_branch_id
                );
                if (branchMatch) s.currentBranch = branchMatch;
                if (
                  meData.academic_year_id != null &&
                  s.academicYears.length > 0
                ) {
                  const yearMatch = s.academicYears.find(
                    (y) => y.academic_year_id === meData.academic_year_id
                  );
                  if (yearMatch) s.academicYear = yearMatch.year_name;
                }
              });
            } catch (meError) {
              if (process.env.NODE_ENV === "development") {
                console.warn("Failed to sync /auth/me after branch switch:", meError);
              }
            }

            batchInvalidateQueries(getBranchDependentQueryKeys());
            set({ isBranchSwitching: false });
          } catch (error) {
            console.error("Failed to switch branch:", error);
            set({ isBranchSwitching: false });
            toast({
              title: "Branch switch failed",
              description:
                error instanceof Error ? error.message : "Please try again.",
              variant: "destructive",
            });
          }
        },
        /**
         * Switch academic year: POST /auth/switch-academic-year/{academic_year_id} with Bearer and credentials.
         * Response is context-only (branch_id, branch_type, academic_year_id); no new access token.
         * Backend updates X-Academic-Year-ID cookie only.
         */
        switchAcademicYear: async (year) => {
          set({ isAcademicYearSwitching: true });
          try {
            await AuthService.switchAcademicYear(year.academic_year_id);

            set((s) => {
              s.academicYear = year.year_name;
              s.isAuthenticated = true;
            });

            // Sync full context from /auth/me (single source of truth)
            try {
              const meData = await AuthService.me();
              set((s) => {
                if (s.user) {
                  s.user.user_id = String(meData.user_id);
                  s.user.institute_id = String(meData.institute_id);
                  s.user.current_branch_id = meData.current_branch_id;
                  s.user.full_name = meData.full_name;
                  s.user.email = meData.email;
                  const roleForBranch = meData.roles?.find(
                    (r) => r.branch_id === meData.current_branch_id
                  );
                  if (roleForBranch) {
                    const normalized = normalizeRole(roleForBranch.role);
                    if (normalized) s.user.role = normalized;
                  }
                }
                const branchMatch = s.branches.find(
                  (b) => b.branch_id === meData.current_branch_id
                );
                if (branchMatch) s.currentBranch = branchMatch;
                if (
                  meData.academic_year_id != null &&
                  s.academicYears.length > 0
                ) {
                  const yearMatch = s.academicYears.find(
                    (y) => y.academic_year_id === meData.academic_year_id
                  );
                  if (yearMatch) s.academicYear = yearMatch.year_name;
                }
              });
            } catch (meError) {
              if (process.env.NODE_ENV === "development") {
                console.warn(
                  "Failed to sync /auth/me after academic year switch:",
                  meError
                );
              }
            }

            batchInvalidateQueries(getAcademicYearDependentQueryKeys());
            set({ isAcademicYearSwitching: false });
          } catch (error) {
            console.error("Failed to switch academic year:", error);
            set({ isAcademicYearSwitching: false });
            toast({
              title: "Academic year switch failed",
              description:
                error instanceof Error ? error.message : "Please try again.",
              variant: "destructive",
            });
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
        // Legacy setToken - kept for backward compatibility
        setToken: (token) => {
          set((state) => {
            state.accessToken = token;
          });
        },
        
        // Legacy setTokenAndExpiry - kept for backward compatibility
        // NOTE: This version accepts expireAtMs (number), new version accepts expiretime (ISO string)
        setTokenAndExpiryLegacy: (token: string | null, expireAtMs: number | null) => {
          set((state) => {
            state.accessToken = token;
            state.tokenExpireAt = expireAtMs;
          });
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
  const token = useAuthStore((state) => state.accessToken);
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
