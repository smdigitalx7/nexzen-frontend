import { create } from "zustand";
import { persist } from "zustand/middleware";
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

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBranchSwitching: boolean;
  academicYear: string | null;
  academicYears: Array<{
    academic_year_id: number;
    year_name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string | null;
    created_by: number | null;
    updated_by: number | null;
  }>;
  token: string | null;
  tokenExpireAt: number | null;
  branches: Array<{
    branch_id: number;
    branch_name: string;
    branch_type: "SCHOOL" | "COLLEGE";
  }>;
  currentBranch: {
    branch_id: number;
    branch_name: string;
    branch_type: "SCHOOL" | "COLLEGE";
  } | null;
  login: (user: AuthUser, branches: any[]) => void;
  logout: () => void;
  logoutAsync: () => Promise<void>;
  switchBranch: (branch: any) => void;
  switchAcademicYear: (year: any) => void;
  setAcademicYears: (years: any[]) => void;
  setLoading: (loading: boolean) => void;
  setAcademicYear: (year: string) => void;
  setToken: (token: string | null) => void;
  setTokenAndExpiry: (token: string | null, expireAtMs: number | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isBranchSwitching: false,
      academicYear: null,
      academicYears: [],
      token: null,
      tokenExpireAt: null,
      branches: [],
      currentBranch: null,
      login: (user, branches) => {
        const defaultBranch = branches.find((b) => b.is_default) || branches[0];
        set({
          user,
          isAuthenticated: true,
          branches,
          currentBranch: defaultBranch,
          isLoading: false,
        });
      },
      logout: () => {
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
        set({ token, tokenExpireAt: expireAtMs });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        academicYear: state.academicYear,
        academicYears: state.academicYears,
        token: state.token,
        tokenExpireAt: state.tokenExpireAt,
        branches: state.branches,
        currentBranch: state.currentBranch,
      }),
    }
  )
);
