import { useQuery } from "@tanstack/react-query";
import { SchoolStudentMarksService } from "@/features/school/services/student-marks.service";
import type {
  ExamMarksReportQuery,
  TestMarksReportQuery,
} from "@/features/school/types";
import { schoolKeys } from "./query-keys";

/**
 * Hook to fetch student marks by enrollment ID
 * GET /api/v1/school/marks-view/{enrollment_id}
 */
export function useStudentMarks(enrollmentId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof enrollmentId === "number"
        ? schoolKeys.studentMarks.marksView(enrollmentId)
        : [...schoolKeys.studentMarks.root(), "marks-view", "nil"],
    queryFn: () => SchoolStudentMarksService.getStudentMarks(enrollmentId!),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

/**
 * Hook to fetch student performance by enrollment ID
 * GET /api/v1/school/performance-view/{enrollment_id}
 */
export function useStudentPerformance(
  enrollmentId: number | null | undefined
) {
  return useQuery({
    queryKey:
      typeof enrollmentId === "number"
        ? schoolKeys.studentMarks.performanceView(enrollmentId)
        : [...schoolKeys.studentMarks.root(), "performance-view", "nil"],
    queryFn: () =>
      SchoolStudentMarksService.getStudentPerformance(enrollmentId!),
    enabled: typeof enrollmentId === "number" && enrollmentId > 0,
  });
}

/**
 * Hook to fetch exam marks report
 * GET /api/v1/school/exam-marks-report
 */
export function useExamMarksReport(params?: ExamMarksReportQuery) {
  return useQuery({
    queryKey: schoolKeys.studentMarks.examReport(
      params as Record<string, unknown> | undefined
    ),
    queryFn: () => SchoolStudentMarksService.getExamMarksReport(params!),
    enabled:
      typeof params?.class_id === "number" &&
      params.class_id > 0 &&
      typeof params?.exam_id === "number" &&
      params.exam_id > 0,
  });
}

/**
 * Hook to fetch test marks report
 * GET /api/v1/school/test-marks-report
 */
export function useTestMarksReport(params?: TestMarksReportQuery) {
  return useQuery({
    queryKey: schoolKeys.studentMarks.testReport(
      params as Record<string, unknown> | undefined
    ),
    queryFn: () => SchoolStudentMarksService.getTestMarksReport(params!),
    enabled:
      typeof params?.class_id === "number" &&
      params.class_id > 0 &&
      typeof params?.test_id === "number" &&
      params.test_id > 0,
  });
}

