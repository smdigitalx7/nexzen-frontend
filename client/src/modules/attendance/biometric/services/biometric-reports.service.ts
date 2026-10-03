import { apiClient } from "@/core/api";
import type {
  BiometricPaginatedResponse,
  DailyAttendanceRecord,
  MonthlySummaryRecord,
  MonthlyMatrixRecord,
  YearlySummaryRecord,
  YearlyMatrixRecord,
  MonthlyAttendanceReportRecord,
  YearlyAttendanceReportRecord,
  YearlyAttendanceReportResponse,
} from "../types/biometric-reports";

export interface ReportParams {
  employeeId?: number;
  companyId?: number;
  departmentId?: number;
  categoryId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
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
    const queryParams: Record<string, any> = {};
    if (params.attendanceDate) queryParams.attendance_date = params.attendanceDate;
    if (params.employeeId) queryParams.employee_id = params.employeeId;
    if (params.companyId) queryParams.company_id = params.companyId;
    if (params.departmentId) queryParams.department_id = params.departmentId;
    if (params.categoryId) queryParams.category_id = params.categoryId;
    if (params.search) queryParams.search = params.search;
    // Omit page and page_size by default so no pagination payload is sent to backend
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.page_size = params.pageSize;

    return apiClient.get("/biometric-reports/daily", {
      params: queryParams,
    }).then(res => res.data);
  },

  fetchMonthlySummary(params: MonthlyReportParams): Promise<BiometricPaginatedResponse<MonthlySummaryRecord>> {
    const queryParams: Record<string, any> = {
      year: params.year,
      month: params.month,
      employee_id: params.employeeId,
      company_id: params.companyId,
      department_id: params.departmentId,
      category_id: params.categoryId,
    };
    if (params.search) queryParams.search = params.search;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.page_size = params.pageSize;

    return apiClient.get("/biometric-reports/monthly-summary", {
      params: queryParams,
    }).then(res => res.data);
  },

  fetchMonthlyMatrix(params: MonthlyReportParams): Promise<BiometricPaginatedResponse<MonthlyMatrixRecord>> {
    const queryParams: Record<string, any> = {
      year: params.year,
      month: params.month,
      employee_id: params.employeeId,
      company_id: params.companyId,
      department_id: params.departmentId,
      category_id: params.categoryId,
    };
    if (params.search) queryParams.search = params.search;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.page_size = params.pageSize;

    return apiClient.get("/biometric-reports/monthly-matrix", {
      params: queryParams,
    }).then(res => res.data);
  },

  fetchYearlySummary(params: YearlyReportParams): Promise<BiometricPaginatedResponse<YearlySummaryRecord>> {
    const queryParams: Record<string, any> = {
      year: params.year,
      employee_id: params.employeeId,
      company_id: params.companyId,
      department_id: params.departmentId,
      category_id: params.categoryId,
    };
    if (params.search) queryParams.search = params.search;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.page_size = params.pageSize;

    return apiClient.get("/biometric-reports/yearly-summary", {
      params: queryParams,
    }).then(res => res.data);
  },

  fetchYearlyMatrix(params: YearlyReportParams): Promise<BiometricPaginatedResponse<YearlyMatrixRecord>> {
    const queryParams: Record<string, any> = {
      year: params.year,
      employee_id: params.employeeId,
      company_id: params.companyId,
      department_id: params.departmentId,
      category_id: params.categoryId,
    };
    if (params.search) queryParams.search = params.search;
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.page_size = params.pageSize;

    return apiClient.get("/biometric-reports/yearly-matrix", {
      params: queryParams,
    }).then(res => res.data);
  },

  fetchMonthlyReport(params: MonthlyReportParams): Promise<BiometricPaginatedResponse<MonthlyAttendanceReportRecord>> {
    return apiClient.get("/biometric-reports/monthly", {
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

  fetchYearlyReport(params: YearlyReportParams): Promise<YearlyAttendanceReportResponse> {
    return apiClient.get("/biometric-reports/yearly", {
      params: {
        year: params.year,
        employee_id: params.employeeId,
        company_id: params.companyId,
        department_id: params.departmentId,
        category_id: params.categoryId,
        page: params.page || 1,
        page_size: params.pageSize || 12,
      },
    }).then(res => res.data);
  },

  syncAttendance(year: number, month: number): Promise<any> {
    return apiClient.post("/biometric-reports/sync", null, {
      params: { year, month },
    }).then(res => res.data);
  },
};
