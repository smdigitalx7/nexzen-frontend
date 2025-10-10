import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExamsService } from "@/lib/services/college/exams.service";
import type { CollegeExamCreate, CollegeExamRead, CollegeExamResponse, CollegeExamUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeExams() {
  return useQuery({
    queryKey: collegeKeys.exams.list(),
    queryFn: () => CollegeExamsService.list() as Promise<CollegeExamRead[]>,
  });
}

export function useCollegeExam(examId: number | null | undefined) {
  return useQuery({
    queryKey: typeof examId === "number" ? collegeKeys.exams.detail(examId) : [...collegeKeys.exams.root(), "detail", "nil"],
    queryFn: () => CollegeExamsService.getById(examId as number) as Promise<CollegeExamResponse>,
    enabled: typeof examId === "number" && examId > 0,
  });
}

export function useCreateCollegeExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeExamCreate) => CollegeExamsService.create(payload) as Promise<CollegeExamResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
    },
  });
}

export function useUpdateCollegeExam(examId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeExamUpdate) => CollegeExamsService.update(examId, payload) as Promise<CollegeExamResponse>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.exams.detail(examId) });
      qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
    },
  });
}

export function useDeleteCollegeExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (examId: number) => CollegeExamsService.delete(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
    },
  });
}


