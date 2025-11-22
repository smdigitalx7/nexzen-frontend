import { useQuery } from "@tanstack/react-query";
import { CollegeAdmissionsService, CollegeAdmissionsListParams } from "@/features/college/services/admissions.service";
import { collegeKeys } from "./query-keys";
import { useAuthStore } from "@/core/auth/authStore";

/**
 * Hook to fetch admissions list with pagination
 */
export function useCollegeAdmissions(params?: CollegeAdmissionsListParams) {
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  
  return useQuery({
    queryKey: collegeKeys.admissions.list(params),
    queryFn: () => CollegeAdmissionsService.list(params),
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
