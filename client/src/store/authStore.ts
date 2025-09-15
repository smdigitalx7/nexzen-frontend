import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: "institute_admin" | "academic" | "accountant";
  institute_id: string;
  current_branch_id: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  academicYear: string | null;
  branches: Array<{
    branch_id: string;
    branch_name: string;
    branch_type: "school" | "college";
  }>;
  currentBranch: {
    branch_id: string;
    branch_name: string;
    branch_type: "school" | "college";
  } | null;
  login: (user: AuthUser, branches: any[]) => void;
  logout: () => void;
  switchBranch: (branch: any) => void;
  setLoading: (loading: boolean) => void;
  setAcademicYear: (year: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      academicYear: null,
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
          branches: [],
          currentBranch: null,
          isLoading: false,
        });
      },
      switchBranch: (branch) => {
        set({ currentBranch: branch });
      },
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      setAcademicYear: (year) => {
        set({ academicYear: year });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        academicYear: state.academicYear,
        branches: state.branches,
        currentBranch: state.currentBranch,
      }),
    }
  )
);
