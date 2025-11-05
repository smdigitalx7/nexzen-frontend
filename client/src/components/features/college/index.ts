// College features barrel export
// Main management components
export { default as StudentManagement } from "./students/StudentManagement";
export { default as FeesManagement } from "./fees/FeesManagement";
export { default as MarksManagement } from "./marks/MarksManagement";
export { default as AttendanceManagement } from "./attendance/AttendanceManagement";
export { default as ReservationManagement } from "./reservations/ReservationManagement";
export { default as ClassManagement } from "./classes/ClassManagement";
export { default as AdmissionsList } from "./admissions/AdmissionsList";

// Academic exports
export * from "./academic";

// Reports
export { CollegeReportsTemplate } from "./reports/CollegeReportsTemplate";

// Stats cards
export { CollegeExpenditureStatsCards } from "./expenditure/CollegeExpenditureStatsCards";
export { CollegeIncomeStatsCards } from "./income/CollegeIncomeStatsCards";
export { CollegeReservationStatsCards } from "./reservations/CollegeReservationStatsCards";
export { CollegeTuitionFeeBalanceStatsCards } from "./tuition-fee-balances/CollegeTuitionFeeBalanceStatsCards";

