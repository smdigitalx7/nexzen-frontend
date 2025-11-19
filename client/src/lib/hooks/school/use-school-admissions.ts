import { useQuery } from "@tanstack/react-query";
import { SchoolAdmissionsService, SchoolAdmissionsListParams } from "@/lib/services/school/admissions.service";
import { schoolKeys } from "./query-keys";

/**
 * Hook to fetch admissions list with pagination
 */
export function useSchoolAdmissions(params?: SchoolAdmissionsListParams) {
  return useQuery({
    queryKey: schoolKeys.admissions.list(params),
    queryFn: () => SchoolAdmissionsService.list(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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

