import { useQuery } from "@tanstack/react-query";
import { SchoolAdmissionsService } from "@/lib/services/school/admissions.service";

/**
 * Hook to fetch all admissions list
 */
export function useSchoolAdmissions() {
  return useQuery({
    queryKey: ["school", "admissions", "list"],
    queryFn: () => SchoolAdmissionsService.list(),
    staleTime: 30 * 1000, // 30 seconds
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

