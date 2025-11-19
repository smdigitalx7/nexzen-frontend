import { useQuery } from "@tanstack/react-query";
import { CollegeAdmissionsService, CollegeAdmissionsListParams } from "@/lib/services/college/admissions.service";
import { collegeKeys } from "./query-keys";

/**
 * Hook to fetch admissions list with pagination
 */
export function useCollegeAdmissions(params?: CollegeAdmissionsListParams) {
  return useQuery({
    queryKey: collegeKeys.admissions.list(params),
    queryFn: () => CollegeAdmissionsService.list(params),
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
