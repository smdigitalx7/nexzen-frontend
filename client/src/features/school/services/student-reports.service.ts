import { Api } from "@/core/api";
import type { CumulativeReportResponse } from "@/features/school/types/student-reports";

export const StudentReportsService = {
  // GET /api/v1/school/student-reports/cumulative/{enrollment_id}
  getCumulativeReport(enrollment_id: number): Promise<CumulativeReportResponse> {
    return Api.get<CumulativeReportResponse>(`/school/student-reports/cumulative/${enrollment_id}`);
  },
};
