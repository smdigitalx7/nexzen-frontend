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

export function useCollegeStudentsList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.students.list(params),
    queryFn: () => CollegeStudentsService.list(params) as Promise<CollegeStudentsPaginatedResponse>,
  });
}

export function useCollegeStudent(studentId: number | null | undefined) {
  return useQuery({
    queryKey: studentId ? collegeKeys.students.detail(studentId) : [...collegeKeys.students.root(), "detail", "nil"],
    queryFn: () => CollegeStudentsService.getById(studentId as number) as Promise<CollegeStudentFullDetails>,
    enabled: typeof studentId === "number" && studentId > 0,
  });
}

export function useCreateCollegeStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeStudentCreate) => CollegeStudentsService.create(payload) as Promise<CollegeStudentFullDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  });
}

export function useUpdateCollegeStudent(studentId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeStudentUpdate) =>
      CollegeStudentsService.update(studentId, payload) as Promise<CollegeStudentFullDetails>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.students.detail(studentId) });
      qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  });
}

export function useDeleteCollegeStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (studentId: number) => CollegeStudentsService.delete(studentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.students.root() });
    },
  });
}


