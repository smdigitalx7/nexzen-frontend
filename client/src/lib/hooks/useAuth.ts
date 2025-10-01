import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { unifiedApi } from "@/lib/services/unified-api.service";

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

export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: "institute_admin" | "academic" | "accountant";
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

      // Step 2: Set token in auth store
      setTokenAndExpiry(
        tokenRes.access_token,
        tokenRes.expiretime ? new Date(tokenRes.expiretime).getTime() : null
      );

      // Step 3: Get user information
      const me = await unifiedApi.get<UserInfo>("/auth/me");

      // Step 4: Get user branches
      const branches = await unifiedApi.get<BranchInfo[]>("/branches/");

      // Step 5: Determine user role
      const role: "institute_admin" | "academic" | "accountant" = (() => {
        // First check if user is marked as institute admin
        if (me.is_institute_admin) {
          return "institute_admin";
        }
        
        // Then check roles from UserBranchAccess
        const roleNames = (me.roles || [])
          .map((r: any) => {
            if (typeof r === "string") return r;
            if (r?.role_name) return r.role_name;
            if (r?.role) return r.role;
            return undefined;
          })
          .filter(Boolean)
          .map((s: string) => s.toUpperCase());

        if (roleNames.includes("INSTITUTE_ADMIN") || roleNames.includes("ADMIN")) return "institute_admin";
        if (roleNames.includes("ACCOUNTANT")) return "accountant";
        if (roleNames.includes("ACADEMIC")) return "academic";

        // Default fallback
        return "academic";
      })();

      // Step 6: Create user object
      const user: AuthUser = {
        user_id: String(me.user_id),
        full_name: "",
        email: identifier,
        role,
        institute_id: String(me.institute_id),
        current_branch_id: me.current_branch_id,
      };

      // Step 7: Create branch list
      const branchList = branches.map((b) => ({
        branch_id: b.branch_id,
        branch_name: b.branch_name,
        branch_type: b.branch_type,
      }));

      // Step 8: Login user
      login(user as any, branchList as any);

      // Step 9: Determine redirect path
      const redirectPath = role === "institute_admin" ? "/" : role === "accountant" ? "/fees" : "/academic";

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
