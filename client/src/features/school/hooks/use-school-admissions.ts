import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { SchoolAdmissionsService, SchoolAdmissionsListParams } from "@/features/school/services/admissions.service";
import { schoolKeys } from "./query-keys";
import { useAuthStore } from "@/core/auth/authStore";

/**
 * Hook to fetch admissions list with pagination
 */
export function useSchoolAdmissions(params?: SchoolAdmissionsListParams) {
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
    queryKey: schoolKeys.admissions.list(stableParams as Record<string, unknown> | undefined),
    queryFn: () => SchoolAdmissionsService.list(stableParams),
    // CRITICAL: Disable query if logging out or not authenticated
    enabled: isAuthenticated && !isLoggingOut,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (data: any) => (Array.isArray(data) ? data : data.data || []),
  });
}

/**
 * Hook to fetch admission details by student ID
 */
export function useSchoolAdmissionById(student_id: number | null) {
  return useQuery({
    queryKey: ["school", "admissions", student_id],
    queryFn: () => SchoolAdmissionsService.getById(student_id!),
    enabled: !!student_id,
    staleTime: 60 * 1000, // 1 minute
  });
}

