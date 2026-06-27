import { apiClient } from "@/core/api";
import type {
  BiometricPaginatedResponse,
  DailyAttendanceRecord,
  MonthlySummaryRecord,
  MonthlyMatrixRecord,
  YearlySummaryRecord,
  YearlyMatrixRecord,
} from "../types/biometric-reports";

export interface ReportParams {
  employeeId?: number;
  companyId?: number;
  departmentId?: number;
  categoryId?: number;
  page?: number;
  pageSize?: number;
}

export interface DailyReportParams extends ReportParams {
  attendanceDate?: string;
}

export interface MonthlyReportParams extends ReportParams {
  year: number;
  month: number;
}

export interface YearlyReportParams extends ReportParams {
  year: number;
}

export const BiometricReportsService = {
  fetchDailyReport(params: DailyReportParams): Promise<BiometricPaginatedResponse<DailyAttendanceRecord>> {
    return apiClient.get("/biometric-reports/daily", {
      params: {
        attendance_date: params.attendanceDate, // YYYY-MM-DD format
        employee_id: params.employeeId,
        company_id: params.companyId,
        department_id: params.departmentId,
        category_id: params.categoryId,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      },
    }).then(res => res.data);
  },

  fetchMonthlySummary(params: MonthlyReportParams): Promise<BiometricPaginatedResponse<MonthlySummaryRecord>> {
    return apiClient.get("/biometric-reports/monthly-summary", {
      params: {
        year: params.year,
        month: params.month,
        employee_id: params.employeeId,
        company_id: params.companyId,
        department_id: params.departmentId,
        category_id: params.categoryId,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      },
    }).then(res => res.data);
  },

  fetchMonthlyMatrix(params: MonthlyReportParams): Promise<BiometricPaginatedResponse<MonthlyMatrixRecord>> {
    return apiClient.get("/biometric-reports/monthly-matrix", {
      params: {
        year: params.year,
        month: params.month,
        employee_id: params.employeeId,
        company_id: params.companyId,
        department_id: params.departmentId,
        category_id: params.categoryId,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      },
    }).then(res => res.data);
  },

  fetchYearlySummary(params: YearlyReportParams): Promise<BiometricPaginatedResponse<YearlySummaryRecord>> {
    return apiClient.get("/biometric-reports/yearly-summary", {
      params: {
        year: params.year,
        employee_id: params.employeeId,
        company_id: params.companyId,
        department_id: params.departmentId,
        category_id: params.categoryId,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      },
    }).then(res => res.data);
  },

  fetchYearlyMatrix(params: YearlyReportParams): Promise<BiometricPaginatedResponse<YearlyMatrixRecord>> {
    return apiClient.get("/biometric-reports/yearly-matrix", {
      params: {
        year: params.year,
        employee_id: params.employeeId,
        company_id: params.companyId,
        department_id: params.departmentId,
        category_id: params.categoryId,
        page: params.page || 1,
        page_size: params.pageSize || 10,
      },
    }).then(res => res.data);
  },
};
