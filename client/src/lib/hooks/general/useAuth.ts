import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { unifiedApi } from "@/lib/services/general/unified-api.service";
import { normalizeRole, ROLES, type UserRole } from "@/lib/constants/auth/roles";
import { extractPrimaryRole } from "@/lib/utils/roles";

// Types for authentication
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expiretime: string;
  user_info: {
    full_name: string;
    email: string;
    branches: Array<{
      branch_id: number;
      branch_name: string;
      roles: string[];
    }>;
  };
}

export interface BranchInfo {
  branch_id: number;
  branch_name: string;
  branch_type: "SCHOOL" | "COLLEGE";
}

export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  institute_id: string;
  current_branch_id: number;
}

const keys = {
  login: ["auth", "login"] as const,
};

export function useLogin() {
  const { login, setTokenAndExpiry } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationKey: keys.login,
    mutationFn: async ({ identifier, password }: LoginRequest) => {
      // Step 1: Authenticate and get token with user info
      const loginResponse = await unifiedApi.post<LoginResponse>(
        "/auth/login",
        { identifier, password },
        {},
        true
      );

      if (!loginResponse.user_info || !loginResponse.user_info.branches || loginResponse.user_info.branches.length === 0) {
        throw new Error("Invalid login response: missing user information or branches.");
      }

      // Step 2: Extract branches from user_info
      const branchesFromResponse = loginResponse.user_info.branches;

      // Step 3: Get current branch (first branch or find by branch_id if available)
      // The backend should indicate which branch is current, but we'll use the first one for now
      const currentBranch = branchesFromResponse[0];
      
      if (!currentBranch || !currentBranch.roles || currentBranch.roles.length === 0) {
        throw new Error("User role not found. Please contact administrator.");
      }

      // Step 4: Extract role from current branch
      let roleFromBranch = extractPrimaryRole(currentBranch.roles);
      if (!roleFromBranch) {
        throw new Error("User role not found. Please contact administrator.");
      }

      let normalizedRole = normalizeRole(roleFromBranch);
      if (!normalizedRole) {
        throw new Error(`Invalid user role: ${roleFromBranch}. Please contact administrator.`);
      }

      // Step 5: Set token in auth store with expiration from response
      const expirationTime = loginResponse.expiretime 
        ? new Date(loginResponse.expiretime).getTime() 
        : null;
      
      setTokenAndExpiry(loginResponse.access_token, expirationTime);

      // Step 6: Get additional user info from /auth/me (for user_id, institute_id, and current_branch_id only)
      let userId = "";
      let instituteId = "1";
      let currentBranchId = currentBranch.branch_id;
      try {
        const meResponse = await unifiedApi.get<any>("/auth/me");
        if (meResponse) {
          userId = meResponse.user_id ? String(meResponse.user_id) : "";
          instituteId = meResponse.institute_id ? String(meResponse.institute_id) : "1";
          // Use current_branch_id from /auth/me if available, otherwise use first branch
          if (meResponse.current_branch_id) {
            currentBranchId = meResponse.current_branch_id;
            // Find the branch that matches this ID and update role if different
            const branchFromId = branchesFromResponse.find(b => b.branch_id === currentBranchId);
            if (branchFromId && branchFromId.branch_id !== currentBranch.branch_id) {
              // Update role from the actual current branch
              const roleFromActualBranch = extractPrimaryRole(branchFromId.roles);
              if (roleFromActualBranch) {
                const newNormalizedRole = normalizeRole(roleFromActualBranch);
                if (newNormalizedRole) {
                  normalizedRole = newNormalizedRole;
                  roleFromBranch = roleFromActualBranch;
                }
              }
            }
          }
        }
      } catch (error) {
        // If /auth/me fails, continue with default values
        console.warn("Failed to get user info from /auth/me:", error);
      }

      // Step 7: Create branch list with roles from response
      const branchList = branchesFromResponse.map((b) => ({
        branch_id: b.branch_id,
        branch_name: b.branch_name,
        branch_type: b.branch_name.toUpperCase().includes('COLLEGE') ? "COLLEGE" as const : "SCHOOL" as const,
        roles: b.roles, // Store roles for each branch
      }));

      // Step 8: Create user object (roles come from login response, not /auth/me)
      const user: AuthUser = {
        user_id: userId || String(currentBranchId), // Fallback to branch_id if user_id not available
        full_name: loginResponse.user_info.full_name || "",
        email: loginResponse.user_info.email || identifier,
        role: normalizedRole,
        institute_id: instituteId,
        current_branch_id: currentBranchId,
      };

      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('🔐 Login Debug:', {
          roleFromBranch,
          normalizedRole: normalizedRole,
          userRole: user.role,
          branches: branchesFromResponse,
          currentBranch: currentBranch,
        });
      }

      // Step 9: Login user
      login(user as any, branchList as any);
          tokenPayload: {
            user_id: tokenPayload.user_id,
            current_branch_id: tokenPayload.current_branch_id,
            roles: tokenPayload.roles,
            is_institute_admin: tokenPayload.is_institute_admin,
          },
        });
      }

      // Step 9: Create branch list
      const branchList = branches.map((b) => ({
        branch_id: b.branch_id,
        branch_name: b.branch_name,
        branch_type: b.branch_type,
      }));

      // Step 10: Login user
      login(user, branchList);

      // Step 10: All users redirect to dashboard - DashboardRouter will show appropriate dashboard
      const redirectPath = "/";

      return {
        user,
        branches: branchList,
        redirectPath,
        token: loginResponse.access_token,
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.email}!`,
        variant: "success",
      });
    },
    onError: (error: any) => {
      const message = error?.message || "Login failed";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: async () => {
      // Clear auth store
      logout();
      
      // Clear any cached data
      // Note: In a real app, you might want to call a logout endpoint
      // to invalidate the token on the server
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error?.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });
}
