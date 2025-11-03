import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { unifiedApi } from "@/lib/services/general/unified-api.service";
import { getRoleFromToken, decodeJWT, getTokenExpiration } from "@/lib/utils/jwt";
import { normalizeRole, ROLES } from "@/lib/constants/roles";

// Types for authentication
export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expiretime: string;
}

export interface UserInfo {
  user_id: number;
  institute_id: number;
  current_branch_id: number;
  branch_name?: string;
  current_branch?: "SCHOOL" | "COLLEGE";
  is_institute_admin?: boolean;
  roles?: Array<{ role_name?: string } | string>;
}

export interface BranchInfo {
  branch_id: number;
  branch_name: string;
  branch_type: "SCHOOL" | "COLLEGE";
}

import type { UserRole } from "@/lib/constants/roles";

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
      // Step 1: Authenticate and get token
      const tokenRes = await unifiedApi.post<TokenResponse>(
        "/auth/login",
        { identifier, password },
        {},
        true
      );

      // Step 2: Decode JWT token and extract data
      const tokenPayload = decodeJWT(tokenRes.access_token);
      
      if (!tokenPayload) {
        throw new Error("Failed to decode authentication token. Please try again.");
      }

      // Step 3: Extract role from JWT based on current branch
      // The JWT contains roles array: [{ role: "ADMIN", branch_id: 1 }, ...]
      const roleFromToken = getRoleFromToken(
        tokenRes.access_token,
        tokenPayload.current_branch_id
      );

      if (!roleFromToken) {
        throw new Error("User role not found in token. Please contact administrator.");
      }

      const normalizedRole = normalizeRole(roleFromToken);
      if (!normalizedRole) {
        throw new Error(`Invalid user role: ${roleFromToken}. Please contact administrator.`);
      }

      // Step 4: Set token in auth store with expiration from JWT
      const tokenExpiration = getTokenExpiration(tokenRes.access_token);
      const expirationTime = tokenExpiration 
        ? tokenExpiration 
        : (tokenRes.expiretime ? new Date(tokenRes.expiretime).getTime() : null);
      
      setTokenAndExpiry(tokenRes.access_token, expirationTime);

      // Step 5: Get user information (for additional user details)
      const me = await unifiedApi.get<UserInfo>("/auth/me");

      // Step 6: Get user branches
      const branches = await unifiedApi.get<BranchInfo[]>("/branches");

      // Step 7: Determine final user role (use JWT role as primary source)
      const role = normalizedRole;

      // Step 8: Create user object
      const user: AuthUser = {
        user_id: String(tokenPayload.user_id || me.user_id),
        full_name: "",
        email: identifier,
        role,
        institute_id: String(tokenPayload.institute_id || me.institute_id),
        current_branch_id: tokenPayload.current_branch_id || me.current_branch_id,
      };

      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Login Debug:', {
          roleFromToken,
          normalizedRole: role,
          userRole: user.role,
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
      login(user as any, branchList as any);

      // Step 11: Determine redirect path
      const redirectPath = (role === ROLES.ADMIN || role === ROLES.INSTITUTE_ADMIN) 
        ? "/" 
        : role === ROLES.ACCOUNTANT 
        ? "/fees" 
        : "/academic";

      return {
        user,
        branches: branchList,
        redirectPath,
        token: tokenRes.access_token,
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
