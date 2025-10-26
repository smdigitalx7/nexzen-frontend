import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeEnrollmentsService } from "@/lib/services/college/enrollments.service";
import type {
  CollegeEnrollmentCreate,
  CollegeEnrollmentFilterParams,
  CollegeEnrollmentUpdate,
  CollegeEnrollmentWithStudentDetails,
  CollegeEnrollmentsPaginatedResponse,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeEnrollmentsList(params?: CollegeEnrollmentFilterParams) {
  return useQuery({
    queryKey: collegeKeys.enrollments.list(params),
    queryFn: () => CollegeEnrollmentsService.list(params) as Promise<CollegeEnrollmentsPaginatedResponse>,
  });
}

export function useCollegeEnrollment(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? collegeKeys.enrollments.detail(enrollmentId) : [...collegeKeys.enrollments.root(), "detail", "nil"],
    queryFn: () => CollegeEnrollmentsService.getById(enrollmentId as number) as Promise<CollegeEnrollmentWithStudentDetails>,
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCollegeEnrollmentByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? collegeKeys.enrollments.byAdmission(admissionNo) : [...collegeKeys.enrollments.root(), "by-admission", "nil"],
    queryFn: () => CollegeEnrollmentsService.getByAdmission(admissionNo as string) as Promise<CollegeEnrollmentWithStudentDetails>,
    enabled: typeof admissionNo === "string" && admissionNo.length > 0,
  });
}

export function useCreateCollegeEnrollment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeEnrollmentCreate) => CollegeEnrollmentsService.create(payload) as Promise<CollegeEnrollmentWithStudentDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.enrollments.root() });
    },
  }, "Enrollment created successfully");
}

export function useUpdateCollegeEnrollment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeEnrollmentUpdate) =>
      CollegeEnrollmentsService.update(enrollmentId, payload) as Promise<CollegeEnrollmentWithStudentDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.enrollments.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.enrollments.root() });
    },
  }, "Enrollment updated successfully");
}

export function useDeleteCollegeEnrollment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (enrollmentId: number) => CollegeEnrollmentsService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.enrollments.root() });
    },
  }, "Enrollment deleted successfully");
}


