import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EnrollmentsService } from "@/lib/services/school/enrollments.service";
import type { SchoolEnrollmentCreate, SchoolEnrollmentFilterParams, SchoolEnrollmentWithStudentDetails, SchoolEnrollmentsPaginatedResponse } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolEnrollmentsList(params?: SchoolEnrollmentFilterParams) {
  return useQuery({
    queryKey: schoolKeys.enrollments.list(params as Record<string, unknown> | undefined),
    queryFn: () => EnrollmentsService.list(params as any),
    enabled: typeof (params as any)?.class_id === "number" && (params as any).class_id > 0,
  });
}

export function useSchoolEnrollment(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.enrollments.detail(enrollmentId) : [...schoolKeys.enrollments.root(), "detail", "nil"],
    queryFn: () => EnrollmentsService.getById(enrollmentId as number),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCreateSchoolEnrollment() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolEnrollmentCreate) => EnrollmentsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: 'active' });
    },
  }, "Enrollment created successfully");
}

export function useSchoolEnrollmentByAdmission(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey: admissionNo ? [...schoolKeys.enrollments.root(), "by-admission", admissionNo] : [...schoolKeys.enrollments.root(), "by-admission", "nil"],
    queryFn: () => EnrollmentsService.getByAdmission(admissionNo as string),
    enabled: Boolean(admissionNo && admissionNo.trim()),
  });
}


