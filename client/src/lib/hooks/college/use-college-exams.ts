import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeExamsService } from "@/lib/services/college/exams.service";
import type {
  CollegeExamCreate,
  CollegeExamRead,
  CollegeExamResponse,
  CollegeExamUpdate,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

export function useCollegeExams(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: collegeKeys.exams.list(),
    queryFn: async () => {
      try {
        return await CollegeExamsService.list();
      } catch (error: any) {
        // Handle 404 errors by returning empty array
        console.log("Exams API error:", error);
        if (
          error?.message?.includes("404") ||
          error?.message?.includes("Exams not found") ||
          error?.message?.includes("Not Found") ||
          error?.status === 404 ||
          error?.message === "Exams not found"
        ) {
          return [];
        }
        throw error;
      }
    },
    enabled: options?.enabled !== false,
  });
}

export function useCollegeExam(examId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof examId === "number"
        ? collegeKeys.exams.detail(examId)
        : [...collegeKeys.exams.root(), "detail", "nil"],
    queryFn: () =>
      CollegeExamsService.getById(
        examId as number
      ),
    enabled: typeof examId === "number" && examId > 0,
  });
}

export function useCreateCollegeExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExamCreate) =>
      CollegeExamsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
    },
  }, "Exam created successfully");
}

export function useUpdateCollegeExam(examId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeExamUpdate) =>
      CollegeExamsService.update(
        examId,
        payload
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.exams.detail(examId) });
      qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
    },
  }, "Exam updated successfully");
}

export function useDeleteCollegeExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (examId: number) => CollegeExamsService.delete(examId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
    },
  }, "Exam deleted successfully");
}
