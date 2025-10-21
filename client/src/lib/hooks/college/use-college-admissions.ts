import { useQuery } from "@tanstack/react-query";
import { CollegeAdmissionsService } from "@/lib/services/college/admissions.service";

/**
 * Hook to fetch all admissions list
 */
export function useCollegeAdmissions() {
  return useQuery({
    queryKey: ["college", "admissions", "list"],
    queryFn: () => CollegeAdmissionsService.list(),
    staleTime: 30 * 1000, // 30 seconds
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
