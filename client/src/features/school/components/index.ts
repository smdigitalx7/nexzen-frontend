// School features barrel export
// Main management components
export { default as StudentManagement } from "./students/StudentManagement";
export { default as FeesManagement } from "./fees/FeesManagement";
export { default as MarksManagement } from "./marks/MarksManagement";
export { default as AttendanceManagement } from "./attendance/AttendanceManagement";
export { default as ReservationManagement } from "./reservations/ReservationManagement";
export { default as AdmissionsList } from "./admissions/AdmissionsList";

// Academic exports
export * from "./academic";

// Reports
export { SchoolReportsTemplate } from "./reports/SchoolReportsTemplate";

// Stats cards
export { SchoolExpenditureStatsCards } from "./expenditure/SchoolExpenditureStatsCards";
export { SchoolIncomeStatsCards } from "./income/SchoolIncomeStatsCards";
export { SchoolReservationStatsCards } from "./reservations/SchoolReservationStatsCards";

