/**
 * Dashboard API Types
 * 
 * These types match the backend Python schemas for dashboard responses.
 * The API returns different dashboard types based on user role priority.
 */

// =====================================================================================
// COMMON TYPES
// =====================================================================================

export interface ChartDataPoint {
  month?: string | null;
  date?: string | null;
  income?: string | null;
  expenditure?: string | null;
  enrollments?: string | null;
  rate?: string | null;
  category?: string | null;
  amount?: string | null;
  percentage?: string | null;
  method?: string | null;
}

export interface RecentTransaction {
  id: number;
  type: string;
  transaction_id?: string | null;
  purpose: string;
  amount: string;
  payment_method?: string | null;
  student_name?: string | null;
  admission_no?: string | null;
  reservation_no?: string | null;
  voucher_no?: string | null;
  transaction_date: string;
  created_by: string;
}

// =====================================================================================
// ADMIN DASHBOARD TYPES
// =====================================================================================

export interface AdminOverview {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_branches: number;
}

export interface AdminFinancial {
  total_income: string;
  total_expenditure: string;
  net_profit: string;
  income_this_month: string;
  expenditure_this_month: string;
  income_this_year: string;
  expenditure_this_year: string;
}

export interface AdminEnrollments {
  total_enrollments: number;
  pending_enrollments: number;
  confirmed_enrollments: number;
  cancelled_enrollments: number;
}

export interface AdminReservations {
  total_reservations: number;
  pending_reservations: number;
  confirmed_reservations: number;
  cancelled_reservations: number;
}

export interface AdminAttendance {
  average_attendance_rate: string;
  attendance_rate_change: string;
}

export interface AdminAcademic {
  total_exams: number;
  upcoming_exams: number;
  completed_exams: number;
  average_pass_rate: string;
  average_pass_rate_change: string;
}

export interface AdminCharts {
  income_trend: ChartDataPoint[];
  enrollment_trend: ChartDataPoint[];
  attendance_trend: ChartDataPoint[];
  income_by_category: ChartDataPoint[];
}

export interface AdminDashboardData {
  overview: AdminOverview;
  financial: AdminFinancial;
  enrollments: AdminEnrollments;
  reservations: AdminReservations;
  attendance: AdminAttendance;
  academic: AdminAcademic;
  charts: AdminCharts;
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
  timestamp: string;
  message?: string | null;
}

// =====================================================================================
// ACCOUNTANT DASHBOARD TYPES
// =====================================================================================

export interface AccountantFinancialOverview {
  income_today: string;
  total_income: string;
  total_expenditure: string;
  income_this_month: string;
  expenditure_this_month: string;
}

export interface IncomeBreakdown {
  tuition_fee_income: string;
  transport_fee_income: string;
  book_fee_income: string;
  application_fee_income: string;
  other_income: string;
}

export interface AccountantCharts {
  income_trend: ChartDataPoint[];
  income_by_category: ChartDataPoint[];
  expenditure_by_category: ChartDataPoint[];
  payment_method_distribution: ChartDataPoint[];
  daily_transactions: ChartDataPoint[];
}

export interface AccountantDashboardData {
  financial_overview: AccountantFinancialOverview;
  income_breakdown: IncomeBreakdown;
  recent_transactions: RecentTransaction[];
  charts?: AccountantCharts | null;
}

export interface AccountantDashboardResponse {
  success: boolean;
  data: AccountantDashboardData;
  timestamp: string;
  message?: string | null;
}

// =====================================================================================
// ACADEMIC DASHBOARD TYPES
// =====================================================================================

export interface AcademicOverview {
  total_students: number;
  total_teachers: number;
  total_classes: number;
  total_subjects: number;
}

export interface AcademicAttendance {
  student_attendance_rate: string;
  teacher_attendance_rate: string;
}

export interface AcademicPerformance {
  total_exams_conducted: number;
  upcoming_exams: number;
  completed_exams: number;
}

export interface AcademicExams {
  total_exams: number;
  upcoming_exams: number;
  completed_exams: number;
  exams_this_month: number;
  exams_this_year: number;
  next_exam_date?: string | null;
  next_exam_name?: string | null;
}

export interface AcademicTests {
  total_tests: number;
  tests_this_month: number;
  tests_this_year: number;
  average_test_score: string;
  average_test_score_change: string;
}

export interface AcademicDashboardData {
  overview: AcademicOverview;
  attendance: AcademicAttendance;
  academic_performance: AcademicPerformance;
  exams: AcademicExams;
  tests: AcademicTests;
}

export interface AcademicDashboardResponse {
  success: boolean;
  data: AcademicDashboardData;
  timestamp: string;
  message?: string | null;
}

// =====================================================================================
// UNIFIED DASHBOARD RESPONSE
// =====================================================================================

export type DashboardResponse = 
  | AdminDashboardResponse 
  | AccountantDashboardResponse 
  | AcademicDashboardResponse;

export interface DashboardQueryParams {
  start_date?: string | null;
  end_date?: string | null;
}

// =====================================================================================
// TYPE GUARDS
// =====================================================================================

export function isAdminDashboard(
  response: DashboardResponse
): response is AdminDashboardResponse {
  if (!response || !response.data) return false;
  return "overview" in response.data && "financial" in response.data && !("academic_performance" in response.data);
}

export function isAccountantDashboard(
  response: DashboardResponse
): response is AccountantDashboardResponse {
  if (!response || !response.data) return false;
  return "financial_overview" in response.data && "income_breakdown" in response.data && !("overview" in response.data || "academic_performance" in response.data);
}

export function isAcademicDashboard(
  response: DashboardResponse
): response is AcademicDashboardResponse {
  if (!response || !response.data) return false;
  return "overview" in response.data && "academic_performance" in response.data && !("financial" in response.data);
}
