import { Api } from "@/core/api";
import type {
  StudentMarksResponse,
  StudentPerformanceResponse,
  CollegeExamMarksReportData,
  CollegeTestMarksReportData,
  ExamMarksReportQuery,
  TestMarksReportQuery,
} from "@/features/college/types";

export const CollegeStudentMarksService = {
  /**
   * Get student marks by admission number
   * GET /api/v1/college/marks-view/{admission_no}
   */
  getStudentMarks(admissionNo: string) {
    return Api.get<StudentMarksResponse>(
      `/college/marks-view/${admissionNo}`
    );
  },

  /**
   * Get student performance by admission number
   * GET /api/v1/college/performance-view/{admission_no}
   */
  getStudentPerformance(admissionNo: string) {
    return Api.get<StudentPerformanceResponse>(
      `/college/performance-view/${admissionNo}`
    );
  },

  /**
   * Get exam marks report
   * GET /api/v1/college/exam-marks-report
   */
  getExamMarksReport(params: ExamMarksReportQuery) {
    return Api.get<CollegeExamMarksReportData>(
      `/college/exam-marks-report`,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
  },

  /**
   * Get test marks report
   * GET /api/v1/college/test-marks-report
   */
  getTestMarksReport(params: TestMarksReportQuery) {
    return Api.get<CollegeTestMarksReportData>(
      `/college/test-marks-report`,
      params as unknown as Record<string, string | number | boolean | null | undefined>
    );
  },
};

