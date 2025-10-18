import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AuthService } from "@/lib/services/general/auth.service";
import { AuthTokenTimers } from "@/lib/api";

export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: "institute_admin" | "academic" | "accountant";
  institute_id: string;
  current_branch_id: number;
  avatar?: string;
}

export interface Branch {
  branch_id: number;
  branch_name: string;
  branch_type: "SCHOOL" | "COLLEGE";
  is_default?: boolean;
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
  institute_admin: ['*'], // All permissions
  academic: ['students', 'attendance', 'marks', 'reports'],
  accountant: ['fees', 'payments', 'reports', 'finance'],
};

const MODULE_PERMISSIONS: Record<string, string[]> = {
  dashboard: ['*'],
  students: ['institute_admin', 'academic'],
  attendance: ['institute_admin', 'academic'],
  marks: ['institute_admin', 'academic'],
  fees: ['institute_admin', 'accountant'],
  payments: ['institute_admin', 'accountant'],
  reports: ['institute_admin', 'academic', 'accountant'],
  finance: ['institute_admin', 'accountant'],
  settings: ['institute_admin'],
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
  canAccessModule: (module: string) => boolean;
  isTokenExpired: () => boolean;
  isTokenExpiringSoon: () => boolean;
  hasPermission: (permission: string) => boolean;
  getAvailableBranches: () => Branch[];
  getActiveAcademicYear: () => AcademicYear | null;
  
  // Actions
  login: (user: AuthUser, branches: Branch[], token?: string, refreshToken?: string) => Promise<void>;
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
        // Initial state
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
          return user?.role === 'institute_admin';
        },

        canAccessModule: (module: string) => {
          const { user } = get();
          if (!user) return false;
          
          const moduleRoles = MODULE_PERMISSIONS[module];
          if (!moduleRoles) return false;
          
          return moduleRoles.includes('*') || moduleRoles.includes(user.role);
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
          return Date.now() >= (tokenExpireAt - fiveMinutes);
        },

        hasPermission: (permission: string) => {
          const { user } = get();
          if (!user) return false;
          
          const rolePermissions = ROLE_PERMISSIONS[user.role];
          return rolePermissions.includes('*') || rolePermissions.includes(permission);
        },

        getAvailableBranches: () => {
          const { branches } = get();
          return branches.filter(branch => branch.branch_id > 0);
        },

        getActiveAcademicYear: () => {
          const { academicYears } = get();
          return academicYears.find(year => year.is_active) || null;
        },
        // Actions
        login: async (user, branches, token, refreshToken) => {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
        const defaultBranch = branches.find((b) => b.is_default) || branches[0];
            
            set((state) => {
              state.user = user;
              state.isAuthenticated = true;
              state.branches = branches;
              state.currentBranch = defaultBranch;
              state.isLoading = false;
              state.error = null;
              
              if (token) {
                state.token = token;
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
                code: 'LOGIN_FAILED',
                message: error instanceof Error ? error.message : 'Login failed',
                timestamp: Date.now(),
              };
            });
            throw error;
          }
      },
        logout: () => {
          AuthTokenTimers.clearProactiveRefresh();
          
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
          // Clear all client-side state
          AuthTokenTimers.clearProactiveRefresh();
          
          // Clear auth store
          set({
            user: null,
            isAuthenticated: false,
            academicYear: null,
            academicYears: [],
            token: null,
            tokenExpireAt: null,
            branches: [],
            currentBranch: null,
            isLoading: false,
            isBranchSwitching: false,
          });
          
          console.log("User logged out successfully");
        }
      },
      switchBranch: async (branch) => {
        set({ isBranchSwitching: true });
        try {
          console.log("Switching to branch:", branch.branch_name, "ID:", branch.branch_id);
          
          // Call the backend API to switch branch and get new token
          const response = await AuthService.switchBranch(branch.branch_id) as any;
          console.log("Branch switch response:", response);
          
          // Update branch and token with new branch context
          if (response?.access_token) {
            // Update current branch first for UI immediacy
            set({ currentBranch: branch });
            // Persist token
            const expireAtMs = response?.expiretime ? new Date(response.expiretime).getTime() : null;
            useAuthStore.getState().setTokenAndExpiry(response.access_token, expireAtMs);
            // Keep user object in sync with branch id if available
            const current = useAuthStore.getState();
            if (current.user) {
              set({ user: { ...current.user, current_branch_id: branch.branch_id } });
            }
            set({ isBranchSwitching: false });
            console.log("Branch switched successfully with new token and clients updated");
          } else {
            // Fallback to just updating the branch if no token response
            set({ 
              currentBranch: branch,
              isBranchSwitching: false
            });
            console.log("Branch switched locally (no token response)");
          }
        } catch (error) {
          console.error("Failed to switch branch:", error);
          // Still update the branch locally even if API call fails
          set({ 
            currentBranch: branch,
            isBranchSwitching: false
          });
          console.log("Branch switched locally (API call failed)");
        }
      },
      switchAcademicYear: (year) => {
        set({ academicYear: year.year_name });
      },
      setAcademicYears: (years) => {
        set({ academicYears: years });
      },
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      setAcademicYear: (year) => {
        set({ academicYear: year });
      },
      setToken: (token) => {
        set({ token });
      },
        setTokenAndExpiry: (token, expireAtMs) => {
          set((state) => {
            state.token = token;
            state.tokenExpireAt = expireAtMs;
          });
        },

        refreshTokenAsync: async () => {
          const { refreshToken } = get();
          if (!refreshToken) return false;

          set((state) => {
            state.isTokenRefreshing = true;
            state.error = null;
          });

          try {
            const response = await AuthService.refresh() as any;
            
            if (response?.access_token) {
              const expireAtMs = response?.expiretime ? new Date(response.expiretime).getTime() : null;
              get().setTokenAndExpiry(response.access_token, expireAtMs);
              
              set((state) => {
                state.isTokenRefreshing = false;
              });
              
              return true;
            }
            
            return false;
          } catch (error) {
            console.error("Token refresh failed:", error);
            
            set((state) => {
              state.isTokenRefreshing = false;
              state.error = {
                code: 'TOKEN_REFRESH_FAILED',
                message: error instanceof Error ? error.message : 'Token refresh failed',
                timestamp: Date.now(),
              };
            });
            
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
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          academicYear: state.academicYear,
          academicYears: state.academicYears,
          token: state.token,
          tokenExpireAt: state.tokenExpireAt,
          refreshToken: state.refreshToken,
          branches: state.branches,
          currentBranch: state.currentBranch,
        }),
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
  const isTokenExpiringSoon = useAuthStore((state) => state.isTokenExpiringSoon());
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
