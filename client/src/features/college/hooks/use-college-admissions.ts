import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CollegeAdmissionsService, CollegeAdmissionsListParams } from "@/features/college/services/admissions.service";
import { collegeKeys } from "./query-keys";
import { useAuthStore } from "@/core/auth/authStore";

/**
 * Hook to fetch admissions list with pagination
 */
export function useCollegeAdmissions(params?: CollegeAdmissionsListParams) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  const stableParams = useMemo(
    () => ({
      page: params?.page,
      page_size: params?.page_size,
      search: params?.search,
    }),
    [params?.page, params?.page_size, params?.search]
  );
  
  return useQuery({
    queryKey: collegeKeys.admissions.list(stableParams as Record<string, unknown> | undefined),
    queryFn: () => CollegeAdmissionsService.list(stableParams),
    // CRITICAL: Disable query if logging out or not authenticated
    enabled: isAuthenticated && !isLoggingOut,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch admission details by student ID
 */
export function useCollegeAdmissionById(student_id: number | null) {
  return useQuery({
    queryKey: ["college", "admissions", student_id],
    queryFn: () => CollegeAdmissionsService.getById(student_id!),
    enabled: !!student_id,
    staleTime: 60 * 1000, // 1 minute
  });
}
