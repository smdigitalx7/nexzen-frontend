import { useQuery } from "@tanstack/react-query";
import { CollegeExamsService } from "@/lib/services/college/exams.service";
import type { CollegeExamRead } from "@/lib/types/college/index.ts";
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
    queryFn: () => CollegeExamsService.getById(examId as number) as Promise<CollegeExamRead>,
    enabled: typeof examId === "number" && examId > 0,
  });
}


