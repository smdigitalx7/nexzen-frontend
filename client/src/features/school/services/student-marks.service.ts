import { Api } from "@/core/api";
import type {
  StudentMarksResponse,
  StudentPerformanceResponse,
  SchoolExamMarksReportData,
  SchoolTestMarksReportData,
  ExamMarksReportQuery,
  TestMarksReportQuery,
} from "@/features/school/types";

export const SchoolStudentMarksService = {
  /**
   * Get student marks by enrollment ID
   * GET /api/v1/school/marks-view/{enrollment_id}
   */
  getStudentMarks(enrollmentId: number) {
    return Api.get<StudentMarksResponse>(
      `/school/marks-view/${enrollmentId}`
    );
  },

  /**
   * Get student performance by enrollment ID
   * GET /api/v1/school/performance-view/{enrollment_id}
   */
  getStudentPerformance(enrollmentId: number) {
    return Api.get<StudentPerformanceResponse>(
      `/school/performance-view/${enrollmentId}`
    );
  },

  /**
   * Get exam marks report
   * GET /api/v1/school/exam-marks-report
   */
  getExamMarksReport(params: ExamMarksReportQuery) {
    return Api.get<SchoolExamMarksReportData>(
      `/school/exam-marks-report`,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
  },

  /**
   * Get test marks report
   * GET /api/v1/school/test-marks-report
   */
  getTestMarksReport(params: TestMarksReportQuery) {
    return Api.get<SchoolTestMarksReportData>(
      `/school/test-marks-report`,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
  },
};

