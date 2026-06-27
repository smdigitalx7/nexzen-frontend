import { useQuery } from "@tanstack/react-query";
import {
  BiometricReportsService,
  DailyReportParams,
  MonthlyReportParams,
  YearlyReportParams,
} from "../services/biometric-reports.service";

export const biometricReportKeys = {
  all: ["biometric-reports"] as const,
  daily: (params: DailyReportParams) => [...biometricReportKeys.all, "daily", params] as const,
  monthlySummary: (params: MonthlyReportParams) => [...biometricReportKeys.all, "monthly-summary", params] as const,
  monthlyMatrix: (params: MonthlyReportParams) => [...biometricReportKeys.all, "monthly-matrix", params] as const,
  yearlySummary: (params: YearlyReportParams) => [...biometricReportKeys.all, "yearly-summary", params] as const,
  yearlyMatrix: (params: YearlyReportParams) => [...biometricReportKeys.all, "yearly-matrix", params] as const,
};

export const useBiometricDailyReport = (params: DailyReportParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: biometricReportKeys.daily(params),
    queryFn: () => BiometricReportsService.fetchDailyReport(params),
    enabled,
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useBiometricMonthlySummary = (params: MonthlyReportParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: biometricReportKeys.monthlySummary(params),
    queryFn: () => BiometricReportsService.fetchMonthlySummary(params),
    enabled: enabled && !!params.year && !!params.month,
    staleTime: 60 * 1000,
  });
};

export const useBiometricMonthlyMatrix = (params: MonthlyReportParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: biometricReportKeys.monthlyMatrix(params),
    queryFn: () => BiometricReportsService.fetchMonthlyMatrix(params),
    enabled: enabled && !!params.year && !!params.month,
    staleTime: 60 * 1000,
  });
};

export const useBiometricYearlySummary = (params: YearlyReportParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: biometricReportKeys.yearlySummary(params),
    queryFn: () => BiometricReportsService.fetchYearlySummary(params),
    enabled: enabled && !!params.year,
    staleTime: 60 * 1000,
  });
};

export const useBiometricYearlyMatrix = (params: YearlyReportParams, enabled: boolean = true) => {
  return useQuery({
    queryKey: biometricReportKeys.yearlyMatrix(params),
    queryFn: () => BiometricReportsService.fetchYearlyMatrix(params),
    enabled: enabled && !!params.year,
    staleTime: 60 * 1000,
  });
};
