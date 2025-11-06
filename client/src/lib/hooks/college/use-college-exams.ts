import { useQuery, useQueryClient } from "@tanstack/react-query";
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
      } catch (error: unknown) {
        // Handle 404 errors by returning empty array
        if (import.meta.env.DEV) {
          console.log("Exams API error:", error);
        }
        const errorObj = error as { message?: string; status?: number };
        if (
          errorObj?.message?.includes("404") ||
          errorObj?.message?.includes("Exams not found") ||
          errorObj?.message?.includes("Not Found") ||
          errorObj?.status === 404 ||
          errorObj?.message === "Exams not found"
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
      void qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.exams.root(), type: 'active' });
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
      void qc.invalidateQueries({ queryKey: collegeKeys.exams.detail(examId) });
      void qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.exams.root(), type: 'active' });
    },
  }, "Exam updated successfully");
}

export function useDeleteCollegeExam() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (examId: number) => CollegeExamsService.delete(examId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collegeKeys.exams.root() });
      void qc.refetchQueries({ queryKey: collegeKeys.exams.root(), type: 'active' });
    },
  }, "Exam deleted successfully");
}
