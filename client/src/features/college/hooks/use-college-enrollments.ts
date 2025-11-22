import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeEnrollmentsService } from "@/features/college/services/enrollments.service";
import type {
  CollegeEnrollmentCreate,
  CollegeEnrollmentFilterParams,
  CollegeEnrollmentWithStudentDetails,
  CollegeEnrollmentsPaginatedResponse,
} from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";

export function useCollegeEnrollmentsList(params?: CollegeEnrollmentFilterParams) {
  return useQuery({
    queryKey: collegeKeys.enrollments.list(params),
    queryFn: () => CollegeEnrollmentsService.list(params),
    enabled: !!params && !!params.class_id && !!params.group_id,
  });
}

export function useCollegeEnrollment(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? collegeKeys.enrollments.detail(enrollmentId) : [...collegeKeys.enrollments.root(), "detail", "nil"],
    queryFn: () => CollegeEnrollmentsService.getById(enrollmentId as number),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCollegeEnrollmentByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.enrollments.byAdmission(admissionNo) : [...collegeKeys.enrollments.root(), "by-admission", "nil"],
    queryFn: () => CollegeEnrollmentsService.getByAdmission(admissionNo as string),
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateCollegeEnrollment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeEnrollmentCreate) => CollegeEnrollmentsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.enrollments.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.enrollments.root(), type: 'active' });
    },
  }, "Enrollment created successfully");
}


