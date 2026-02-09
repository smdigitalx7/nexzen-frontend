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
  isAcademicYearSwitching: boolean;
  isTokenRefreshing: boolean;
  isAuthInitializing: boolean; // For initial app load / refresh check
  isLoggingOut: boolean; // Flag to prevent race conditions during logout

  // Academic data
  academicYear: string | null;
  academicYears: AcademicYear[];

  // Token management
  // CRITICAL: accessToken is stored ONLY in memory (Zustand store), NOT in localStorage
  // This reduces XSS risk - even if malicious script runs, it cannot access the token
  // Refresh token is in HttpOnly cookie (set by backend), JavaScript cannot read it
  accessToken: string | null; // Renamed from 'token' for clarity
  /**
   * Legacy alias for backward compatibility.
   * IMPORTANT: This should always mirror `accessToken`.
   */
  token?: string | null;
  tokenExpireAt: number | null; // Timestamp in milliseconds

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
  /**
   * Login with identifier (email) and password
   * Calls POST /api/v1/auth/login
   * Backend sets HttpOnly refreshToken cookie automatically
   */
  login: (identifier: string, password: string) => Promise<void>;
  
  /**
   * Logout - clears auth state and optionally calls backend logout endpoint
   * @param reason - Optional reason for logout (idle_timeout, manual, token_expired)
   */
  logout: (reason?: "idle_timeout" | "manual" | "token_expired") => Promise<void>;
  
  /**
   * Bootstrap auth on app startup
   * Calls POST /api/v1/auth/refresh to restore session from refreshToken cookie
   */
  bootstrapAuth: () => Promise<void>;
  
  /**
   * Set access token and expiry (in memory only)
   */
  setTokenAndExpiry: (
    accessToken: string | null,
    expiretime: string | number | null
  ) => void;
  
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
  }) => void;
  
  /**
   * Set current branch
   */
  setCurrentBranch: (branch: Branch | null) => void;
  
  // Legacy actions (kept for backward compatibility)
  loginLegacy?: (
    user: AuthUser | null,
    branches: Branch[],
    token: string | null,
    refreshToken?: string
  ) => Promise<void>;
  logoutLegacy?: () => void;
  setTokenAndExpiryLegacy?: (token: string | null, expireAtMs: number | null) => void;
  logoutAsync: () => Promise<void>;
  switchBranch: (branch: Branch) => Promise<void>;
  switchAcademicYear: (year: AcademicYear) => Promise<void>;
  setAcademicYears: (years: AcademicYear[]) => void;
  setLoading: (loading: boolean) => void;
  setAcademicYear: (year: string) => void;
  setToken: (token: string | null) => void;
  refreshTokenAsync: () => Promise<boolean>;
  clearError: () => void;
  setError: (error: AuthError) => void;

  // Optimistic updates
  optimisticBranchSwitch: (branch: Branch) => void;
  rollbackBranchSwitch: () => void;
  optimisticAcademicYearSwitch: (year: AcademicYear) => void;
  rollbackAcademicYearSwitch: () => void;
}

