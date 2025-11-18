import { useQuery } from "@tanstack/react-query";
import { SchoolStudentsService } from "@/lib/services/school/students.service";
import type { SchoolStudentCreate, SchoolStudentFullDetails, SchoolStudentRead, SchoolStudentUpdate, SchoolStudentsPaginatedResponse } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { batchInvalidateAndRefetch } from "../common/useGlobalRefetch";

export function useSchoolStudentsList(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: schoolKeys.students.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolStudentsService.list(params),
  });
}

export function useSchoolStudent(studentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof studentId === "number" ? schoolKeys.students.detail(studentId) : [...schoolKeys.students.root(), "detail", "nil"],
    queryFn: () => SchoolStudentsService.getById(studentId as number),
    enabled: typeof studentId === "number" && studentId > 0,
  });
}

export function useCreateSchoolStudent() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentCreate) => SchoolStudentsService.create(payload),
    onSuccess: () => {
      // ✅ FIX: Batch invalidate all student and enrollment queries to ensure table updates
      batchInvalidateAndRefetch([
        schoolKeys.students.root(),
        schoolKeys.enrollments.root(), // Student name appears in enrollment data
      ]);
    },
  }, "Student created successfully");
}

export function useUpdateSchoolStudent(studentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentUpdate) => SchoolStudentsService.update(studentId, payload),
    onSuccess: () => {
      // ✅ FIX: Batch invalidate all student and enrollment queries to ensure table updates
      // This ensures both StudentsTab and EnrollmentsTab refresh correctly
      batchInvalidateAndRefetch([
        schoolKeys.students.detail(studentId),
        schoolKeys.students.root(),
        schoolKeys.enrollments.root(), // Student name appears in enrollment data
      ]);
    },
  }, "Student updated successfully");
}

export function useDeleteSchoolStudent() {
  return useMutationWithSuccessToast({
    mutationFn: (studentId: number) => SchoolStudentsService.delete(studentId),
    onSuccess: () => {
      // ✅ FIX: Batch invalidate all student and enrollment queries to ensure table updates
      batchInvalidateAndRefetch([
        schoolKeys.students.root(),
        schoolKeys.enrollments.root(), // Student deletion affects enrollment data
      ]);
    },
  }, "Student deleted successfully");
}