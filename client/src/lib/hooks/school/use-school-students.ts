import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolStudentsService } from "@/lib/services/school/students.service";
import type { SchoolStudentCreate, SchoolStudentFullDetails, SchoolStudentRead, SchoolStudentUpdate, SchoolStudentsPaginatedResponse } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useSchoolStudentsList(params?: { page?: number; page_size?: number }) {
  return useQuery({
    queryKey: schoolKeys.students.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolStudentsService.list(params) as Promise<SchoolStudentsPaginatedResponse>,
  });
}

export function useSchoolStudent(studentId: number | null | undefined) {
  return useQuery({
    queryKey: typeof studentId === "number" ? schoolKeys.students.detail(studentId) : [...schoolKeys.students.root(), "detail", "nil"],
    queryFn: () => SchoolStudentsService.getById(studentId as number) as Promise<SchoolStudentFullDetails>,
    enabled: typeof studentId === "number" && studentId > 0,
  });
}

export function useCreateSchoolStudent() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentCreate) => SchoolStudentsService.create(payload) as Promise<SchoolStudentFullDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.students.root() });
    },
  }, "Student created successfully");
}

export function useUpdateSchoolStudent(studentId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentUpdate) => SchoolStudentsService.update(studentId, payload) as Promise<SchoolStudentFullDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.students.detail(studentId) });
      qc.invalidateQueries({ queryKey: schoolKeys.students.root() });
    },
  }, "Student updated successfully");
}

export function useDeleteSchoolStudent() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (studentId: number) => SchoolStudentsService.delete(studentId) as Promise<void>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.students.root() });
    },
  }, "Student deleted successfully");
}