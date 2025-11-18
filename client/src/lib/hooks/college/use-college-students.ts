import { useQuery } from "@tanstack/react-query";
import { CollegeStudentsService } from "@/lib/services/college/students.service";
import type {
  CollegeStudentCreate,
  CollegeStudentFullDetails,
  CollegeStudentRead,
  CollegeStudentUpdate,
  CollegeStudentsPaginatedResponse,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { batchInvalidateAndRefetch } from "../common/useGlobalRefetch";

export function useCollegeStudentsList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.students.list(params),
    queryFn: () => CollegeStudentsService.list(params),
  });
}

export function useCollegeStudent(studentId: number | null | undefined) {
  return useQuery({
    queryKey: studentId ? collegeKeys.students.detail(studentId) : [...collegeKeys.students.root(), "detail", "nil"],
    queryFn: () => CollegeStudentsService.getById(studentId as number),
    enabled: typeof studentId === "number" && studentId > 0,
  });
}

export function useCreateCollegeStudent() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentCreate) => CollegeStudentsService.create(payload),
    onSuccess: () => {
      // ✅ FIX: Batch invalidate all student and enrollment queries to ensure table updates
      batchInvalidateAndRefetch([
        collegeKeys.students.root(),
        collegeKeys.enrollments.root(), // Student name appears in enrollment data
      ]);
    },
  }, "Student created successfully");
}

export function useUpdateCollegeStudent(studentId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentUpdate) =>
      CollegeStudentsService.update(studentId, payload),
    onSuccess: () => {
      // ✅ FIX: Batch invalidate all student and enrollment queries to ensure table updates
      // This ensures both StudentsTab and EnrollmentsTab refresh correctly
      batchInvalidateAndRefetch([
        collegeKeys.students.detail(studentId),
        collegeKeys.students.root(),
        collegeKeys.enrollments.root(), // Student name appears in enrollment data
      ]);
    },
  }, "Student updated successfully");
}

export function useDeleteCollegeStudent() {
  return useMutationWithSuccessToast({
    mutationFn: (studentId: number) => CollegeStudentsService.delete(studentId),
    onSuccess: () => {
      // ✅ FIX: Batch invalidate all student and enrollment queries to ensure table updates
      batchInvalidateAndRefetch([
        collegeKeys.students.root(),
        collegeKeys.enrollments.root(), // Student deletion affects enrollment data
      ]);
    },
  }, "Student deleted successfully");
}


