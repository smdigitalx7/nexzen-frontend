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
         * Calls POST /api/v1/auth/refresh to restore session from refreshToken cookie
         * Only clears auth state if user is not already authenticated
         * CRITICAL: Skips restoration if logout was just initiated (prevents session restore after idle timeout)
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

          // CRITICAL: Check if logout was just initiated (BEFORE any API calls)
          // Check both localStorage and sessionStorage for the flag
          // If logout happened within last 5 minutes, skip bootstrap
          if (typeof window !== "undefined") {
            const logoutTimestamp = localStorage.getItem("__logout_initiated__") || 
                                   (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("__logout_initiated__") : null);
            
            if (logoutTimestamp) {
              const logoutTime = parseInt(logoutTimestamp, 10);
              const timeSinceLogout = Date.now() - logoutTime;
              const FIVE_MINUTES = 5 * 60 * 1000;
              
              // If logout happened within last 5 minutes, skip bootstrap
              if (timeSinceLogout < FIVE_MINUTES) {
                // Clear the flags
                localStorage.removeItem("__logout_initiated__");
                if (typeof sessionStorage !== "undefined") {
                  sessionStorage.removeItem("__logout_initiated__");
                }
                
                // Skip bootstrap - don't restore session after logout
                set((state) => {
                  state.isAuthInitializing = false;
                  state.isAuthenticated = false;
                  state.accessToken = null;
                  state.tokenExpireAt = null;
                  state.user = null;
                });
                
                if (process.env.NODE_ENV === "development") {
                  console.log(`Skipping bootstrapAuth: logout was initiated ${Math.round(timeSinceLogout / 1000)}s ago`);
                }
                return;
              }
            }
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

              // Set user info
              get().setUser(response.data.user_info);

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

            // Optionally get additional user info from /auth/me (user_id, institute_id, current_branch_id)
            // This is optional - if backend doesn't provide it, we use defaults
            try {
              const meResponse = await apiClient.get("/auth/me");
              if (meResponse.data) {
                const currentState = get();
                if (currentState.user && meResponse.data) {
                  const meData = meResponse.data;
                  set((state) => {
                    if (state.user) {
                      if (meData.user_id) {
                        state.user.user_id = String(meData.user_id);
                      }
                      if (meData.institute_id) {
                        state.user.institute_id = String(meData.institute_id);
                      }
                      if (meData.current_branch_id) {
                        state.user.current_branch_id = meData.current_branch_id;
                        // Update current branch if branch_id changed
                        // Ensure branches is an array before calling find
                        if (Array.isArray(state.branches) && state.branches.length > 0) {
                          const branch = state.branches.find(
                            (b) => b.branch_id === meData.current_branch_id
                          );
                          if (branch) {
                            state.currentBranch = branch;
                            // Update role from the actual current branch
                            if (branch.roles && Array.isArray(branch.roles) && branch.roles.length > 0) {
                              const roleFromBranch = extractPrimaryRole(branch.roles);
                              if (roleFromBranch) {
                                const normalizedRole = normalizeRole(roleFromBranch);
                                if (normalizedRole) {
                                  state.user.role = normalizedRole;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  });
                }
              }
            } catch (error) {
              // If /auth/me fails, continue with defaults from login response
              // Role identification is already set from login response branches
              if (process.env.NODE_ENV === "development") {
                console.warn("Failed to get additional user info from /auth/me:", error);
              }
            }

            // CRITICAL: Clear logout flag on successful login
            // This allows bootstrapAuth to work normally after login
            if (typeof window !== "undefined") {
              localStorage.removeItem("__logout_initiated__");
              if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem("__logout_initiated__");
              }
              if (process.env.NODE_ENV === "development") {
                console.log("Logout flag cleared after successful login");
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
          
          // CRITICAL: Prevent double logout (race condition protection)
          // If logout is already in progress, return early
          if (currentState.isLoggingOut) {
            if (process.env.NODE_ENV === "development") {
              console.log("Logout already in progress, skipping duplicate call");
            }
            return;
          }

          // HARD KILL-SWITCH: Step 1 - Set logout flag IMMEDIATELY
          // This triggers apiClient interceptor to cancel ALL requests
          set((state) => {
            state.isLoggingOut = true;
          });
          
          // HARD KILL-SWITCH: Step 2 - Cancel ALL React Query queries IMMEDIATELY
          // This aborts in-flight queries and prevents new ones
          try {
            await queryClient.cancelQueries(); // Cancel all in-flight queries
            queryClient.clear(); // Clear entire cache
          } catch (e) {
            console.warn("Failed to clear React Query cache:", e);
          }
          
          // HARD KILL-SWITCH: Step 3 - Cancel all active fetch requests
          cancelAllRequests();

          // Step 4: Set flag to prevent bootstrapAuth from restoring session after logout
          // CRITICAL: Use localStorage with timestamp - persists across page reloads
          // This must be set BEFORE calling logout API and BEFORE any redirect
          if (typeof window !== "undefined") {
            const logoutTimestamp = Date.now().toString();
            localStorage.setItem("__logout_initiated__", logoutTimestamp);
            // Also set in sessionStorage as backup
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem("__logout_initiated__", logoutTimestamp);
            }
            if (process.env.NODE_ENV === "development") {
              console.log("Logout flag set with timestamp:", logoutTimestamp);
            }
          }

          // Step 5: Perform logout API request DIRECTLY
          // CRITICAL: Wait for logout API to complete before clearing state
          // This ensures the refresh token is invalidated on the backend
          let logoutMessage = "You have been logged out successfully.";
          try {
            // Call logout API directly - this invalidates the refresh token on backend
            const response = await apiClient.post<{ message?: string }>("/auth/logout", {}, {
              withCredentials: true, // Ensure cookies are sent
            });
            if (response?.data?.message) {
              logoutMessage = response.data.message;
            }
            if (process.env.NODE_ENV === "development") {
              console.log("Logout API call completed successfully - refresh token invalidated");
            }
          } catch (error) {
            // Log error but continue with client-side cleanup
            const axiosError = error as AxiosError;
            if (process.env.NODE_ENV === "development") {
              console.warn("Backend logout endpoint failed:", axiosError.message);
              console.log("Continuing with client-side cleanup - flag will prevent session restore");
            }
            // Continue with cleanup even if backend logout fails
            // The localStorage flag will prevent bootstrapAuth from restoring session
          }

          // Step 6: Clear all auth state (AFTER logout API call)
          set((state) => {
            state.isAuthenticated = false;
            state.accessToken = null;
            state.tokenExpireAt = null;
            state.user = null;
            state.branches = [];
            state.currentBranch = null;
            state.isLoading = false;
            state.error = null;
            // Keep isLoggingOut = true until redirect completes
          });

          // Step 7: Show toast (non-blocking, won't delay redirect)
          if (typeof window !== "undefined") {
            try {
              // Show appropriate toast message based on logout reason
              if (reason === "idle_timeout") {
                toast({
                  title: "Session expired",
                  description: "You have been logged out due to inactivity. Please log in again.",
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Logout successful",
                  description: logoutMessage,
                  variant: "success",
                });
              }
            } catch (toastError) {
              console.error("Failed to show logout toast:", toastError);
            }
          }

          // Step 8: Hard redirect to login page IMMEDIATELY (LAST step)
          // CRITICAL: Redirect immediately after logout API completes
          // Use replace() instead of href to prevent back button issues
          // This ensures a fresh page load - bootstrapAuth will check the logout flag
          if (typeof window !== "undefined") {
            // Use a short delay to ensure state updates are flushed
            setTimeout(() => {
              // Only redirect if we're not already on the login page
              if (window.location.pathname !== "/login") {
                window.location.replace("/login");
              } else {
                // If already on login page, just reload to ensure clean slate
                window.location.reload();
              }
            }, 100);
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

          // CRITICAL: Preserve stored currentBranch if it exists and is valid
          // This prevents resetting to first branch on page refresh
          const currentState = get();
          let currentBranch: typeof branchList[0] | null = null;
          
          // Try to preserve the stored branch if it exists in the new branch list
          if (currentState.currentBranch?.branch_id) {
            const storedBranch = branchList.find(
              (b) => b.branch_id === currentState.currentBranch?.branch_id
            );
            if (storedBranch) {
              currentBranch = storedBranch;
            }
          }
          
          // Fallback to first branch if no stored branch found or preserved branch doesn't exist
          if (!currentBranch) {
            currentBranch = branchList[0];
            if (!currentBranch) {
              throw new Error("Failed to set current branch");
            }
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
              accessToken: null,
              tokenExpireAt: null,
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
              if (response.user_info && response.user_info.branches && Array.isArray(response.user_info.branches)) {
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
              useAuthStore
                .getState()
                .setTokenAndExpiry(response.access_token, response.expiretime);

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
                "Branch switched successfully with new token. Reloading page..."
              );

              // ✅ CRITICAL: Perform complete browser refresh after branch switch
              // This ensures all state is reset, all data is fresh, and new token is fully applied
              // Reload after a short delay to allow state updates to persist
              setTimeout(() => {
                window.location.reload();
              }, 100);
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
              console.log("Branch switched locally (no token response). Reloading page...");

              // ✅ CRITICAL: Perform complete browser refresh after branch switch
              // Even without token response, reload to ensure clean state
              setTimeout(() => {
                window.location.reload();
              }, 100);
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
            console.log("Branch switched locally (API call failed). Reloading page...");

            // ✅ CRITICAL: Perform complete browser refresh after branch switch
            // Even if API call failed, reload to ensure clean state with locally switched branch
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        },
        switchAcademicYear: async (year) => {
          set({ isLoading: true });
          try {
            console.log("Switching to academic year:", year.year_name, "ID:", year.academic_year_id);
            
            // Call the backend API to switch academic year and get new token
            const response = (await AuthService.switchAcademicYear(
              year.academic_year_id
            )) as any;
            
            console.log("Academic year switch response:", response);

            if (response?.access_token) {
              // Rotation of token
              useAuthStore.getState().setTokenAndExpiry(response.access_token, response.expiretime);

              set({
                academicYear: year.year_name,
                isAuthenticated: true,
                isLoading: false,
              });

              // Update user info if returned in response
              if (response.user_info) {
                const current = useAuthStore.getState();
                set({
                  user: {
                    ...current.user,
                    ...response.user_info
                  }
                });
              }

              console.log("Academic year switched successfully with token rotation. Reloading page...");
              
              // ✅ CRITICAL: Perform complete browser refresh
              setTimeout(() => {
                window.location.reload();
              }, 100);
            } else {
              // Fallback if no token in response
              set({
                academicYear: year.year_name,
                isAuthenticated: true,
                isLoading: false,
              });
              console.log("Academic year switched (no response token). Reloading page...");
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }
          } catch (error) {
            console.error("Failed to switch academic year through API:", error);
            // Even on error, update local state and reload to allow recovery
            set({
              academicYear: year.year_name,
              isAuthenticated: true,
              isLoading: false,
            });
            setTimeout(() => {
              window.location.reload();
            }, 100);
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
