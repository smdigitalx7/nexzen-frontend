import { useQuery } from "@tanstack/react-query";
import { CollegeStudentMarksService } from "@/lib/services/college/student-marks.service";
import type {
  ExamMarksReportQuery,
  TestMarksReportQuery,
} from "@/lib/types/college";
import { collegeKeys } from "./query-keys";

/**
 * Hook to fetch student marks by admission number
 * GET /api/v1/college/marks-view/{admission_no}
 */
export function useStudentMarks(admissionNo: string | null | undefined) {
  return useQuery({
    queryKey:
      typeof admissionNo === "string" && admissionNo.trim()
        ? collegeKeys.studentMarks.marksView(admissionNo)
        : [...collegeKeys.studentMarks.root(), "marks-view", "nil"],
    queryFn: () => CollegeStudentMarksService.getStudentMarks(admissionNo!),
    enabled: typeof admissionNo === "string" && admissionNo.trim().length > 0,
  });
}

/**
 * Hook to fetch student performance by admission number
 * GET /api/v1/college/performance-view/{admission_no}
 */
export function useStudentPerformance(
  admissionNo: string | null | undefined
) {
  return useQuery({
    queryKey:
      typeof admissionNo === "string" && admissionNo.trim()
        ? collegeKeys.studentMarks.performanceView(admissionNo)
        : [...collegeKeys.studentMarks.root(), "performance-view", "nil"],
    queryFn: () =>
      CollegeStudentMarksService.getStudentPerformance(admissionNo!),
    enabled: typeof admissionNo === "string" && admissionNo.trim().length > 0,
  });
}

/**
 * Hook to fetch exam marks report
 * GET /api/v1/college/exam-marks-report
 */
export function useExamMarksReport(params?: ExamMarksReportQuery) {
  return useQuery({
    queryKey: collegeKeys.studentMarks.examReport(
      params as Record<string, unknown> | undefined
    ),
    queryFn: () => CollegeStudentMarksService.getExamMarksReport(params!),
    enabled:
      typeof params?.class_id === "number" &&
      params.class_id > 0 &&
      typeof params?.exam_id === "number" &&
      params.exam_id > 0 &&
      typeof params?.course_id === "number" &&
      params.course_id > 0,
  });
}

/**
 * Hook to fetch test marks report
 * GET /api/v1/college/test-marks-report
 */
export function useTestMarksReport(params?: TestMarksReportQuery) {
  return useQuery({
    queryKey: collegeKeys.studentMarks.testReport(
      params as Record<string, unknown> | undefined
    ),
    queryFn: () => CollegeStudentMarksService.getTestMarksReport(params!),
    enabled:
      typeof params?.class_id === "number" &&
      params.class_id > 0 &&
      typeof params?.test_id === "number" &&
      params.test_id > 0 &&
      typeof params?.course_id === "number" &&
      params.course_id > 0,
  });
}
