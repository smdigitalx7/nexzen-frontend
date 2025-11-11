import type { AuthUser, Branch, AcademicYear, AuthError } from "./types";

/**
 * AuthState interface - defines the complete state structure for authStore
 * This is extracted to allow modules to reference it without circular dependencies
 */
export interface AuthState {
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

