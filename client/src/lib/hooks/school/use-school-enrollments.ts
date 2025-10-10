import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EnrollmentsService } from "@/lib/services/school/enrollments.service";
import type { SchoolEnrollmentCreate, SchoolEnrollmentFilterParams, SchoolEnrollmentWithStudentDetails, SchoolEnrollmentsPaginatedResponse } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolEnrollmentsList(params?: SchoolEnrollmentFilterParams) {
  return useQuery({
    queryKey: schoolKeys.enrollments.list(params as Record<string, unknown> | undefined),
    queryFn: () => EnrollmentsService.list(params as any) as Promise<SchoolEnrollmentsPaginatedResponse>,
    enabled: typeof (params as any)?.class_id === "number" && (params as any).class_id > 0,
  });
}

export function useSchoolEnrollment(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof enrollmentId === "number" ? schoolKeys.enrollments.detail(enrollmentId) : [...schoolKeys.enrollments.root(), "detail", "nil"],
    queryFn: () => EnrollmentsService.getById(enrollmentId as number) as Promise<SchoolEnrollmentWithStudentDetails>,
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

export function useCreateSchoolEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SchoolEnrollmentCreate) => EnrollmentsService.create(payload) as Promise<SchoolEnrollmentWithStudentDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
    },
  });
}

export function useUpdateSchoolEnrollment(enrollmentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<SchoolEnrollmentCreate>) => EnrollmentsService.update(enrollmentId, payload) as Promise<SchoolEnrollmentWithStudentDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.detail(enrollmentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
    },
  });
}

export function useDeleteSchoolEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (enrollmentId: number) => EnrollmentsService.delete(enrollmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.enrollments.root() });
    },
  });
}


