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
  academicYears: Array<{
    id: number;
    year_name: string;
    start_date: string;
    end_date: string;
    active: boolean;
    branch_type: "school" | "college";
  }>;
  token: string | null;
  tokenExpireAt: number | null;
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
        });
      },
      switchBranch: (branch) => {
        set({ currentBranch: branch });
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
