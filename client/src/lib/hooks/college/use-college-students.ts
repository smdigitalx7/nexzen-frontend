import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentCreate) => CollegeStudentsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  }, "Student created successfully");
}

export function useUpdateCollegeStudent(studentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentUpdate) =>
      CollegeStudentsService.update(studentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.students.detail(studentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  }, "Student updated successfully");
}

export function useDeleteCollegeStudent() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (studentId: number) => CollegeStudentsService.delete(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  }, "Student deleted successfully");
}


