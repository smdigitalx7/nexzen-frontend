import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/features/general/services/auth.service";

export type { AuthMeResponse } from "@/features/general/services/auth.service";

const AUTH_ME_KEY = ["auth", "me"] as const;

/**
 * Fetches current user info from GET /api/v1/auth/me
 * Use this for the profile view and any UI that needs the canonical current user data.
 */
export function useAuthMe() {
  return useQuery({
    queryKey: AUTH_ME_KEY,
    queryFn: () => AuthService.me(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
