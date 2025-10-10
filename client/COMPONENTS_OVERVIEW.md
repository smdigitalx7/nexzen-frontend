### Components Overview

This document lists general-purpose, school-related, and college-related components in the frontend codebase.

### General components

- **UI primitives**
  - `src/components/ui/*` (accordion, button, card, dialog, form, input, select, table, toast, etc.)

- **Layout**
  - `src/components/layout/Dashboard.tsx`
  - `src/components/layout/Header.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/ThemeProvider.tsx`
  - `src/components/layout/ThemeToggle.tsx`
  - `src/components/layout/BranchSwitcher.tsx`
  - `src/components/layout/AcademicYearSwitcher.tsx`
  - `src/components/layout/index.ts`

- **Shared utilities**
  - `src/components/shared/ConfirmDialog.tsx`
  - `src/components/shared/FormDialog.tsx`
  - `src/components/shared/EnhancedDataTable.tsx`
  - `src/components/shared/DataTableWithFilters.tsx`
  - `src/components/shared/index.ts`

- **General pages**
  - `src/components/pages/general/Login.tsx`
  - `src/components/pages/general/not-found.tsx`
  - `src/components/pages/general/Dashboard.tsx`
  - `src/components/pages/general/UserManagementPage.tsx`
  - `src/components/pages/general/EmployeeManagementPage.tsx`
  - `src/components/pages/general/PayrollManagementPage.tsx`
  - `src/components/pages/general/FinancialReportsPage.tsx`
  - `src/components/pages/general/TransportManagementPage.tsx`
  - `src/components/pages/general/AnnouncementPage.tsx`
  - `src/components/pages/general/AuditLog.tsx`

- **User management**
  - `src/components/features/general/user-management/UserManagement.tsx`

- **Announcements**
  - `src/components/features/general/Announcemnts/AnnouncementsManagement.tsx`
  - `src/components/features/general/Announcemnts/AnnouncementCard.tsx`
  - `src/components/features/general/Announcemnts/AnnouncementDetailsDialog.tsx`
  - `src/components/features/general/Announcemnts/AnnouncementFormDialog.tsx`
  - `src/components/features/general/Announcemnts/AnnouncementsFilters.tsx`
  - `src/components/features/general/Announcemnts/AnnouncementsList.tsx`
  - `src/components/features/general/Announcemnts/AnnouncementsOverview.tsx`

- **Employee management**
  - `src/components/features/general/employee-management/templates/EmployeeManagementTemplate.tsx`
  - `src/components/features/general/employee-management/components/AttendanceStatsCards.tsx`
  - `src/components/features/general/employee-management/components/AttendanceTable.tsx`
  - `src/components/features/general/employee-management/components/EmployeeStatsCards.tsx`
  - `src/components/features/general/employee-management/components/EmployeeTable.tsx`
  - `src/components/features/general/employee-management/employee/EmployeeAdvancesList.tsx`
  - `src/components/features/general/employee-management/employee/EmployeeAttendanceList.tsx`
  - `src/components/features/general/employee-management/employee/EmployeeDeleteDialog.tsx`
  - `src/components/features/general/employee-management/employee/EmployeeDetailDialog.tsx`
  - `src/components/features/general/employee-management/employee/EmployeeFormDialog.tsx`
  - `src/components/features/general/employee-management/employee/EmployeeLeavesList.tsx`
  - `src/components/features/general/employee-management/employee/EmployeesStatsCards.tsx`
  - `src/components/features/general/employee-management/employee/EmployeesTab.tsx`
  - `src/components/features/general/employee-management/employee/EmployeesTable.tsx`
  - `src/components/features/general/employee-management/Advance/AdvanceAmountDialog.tsx`
  - `src/components/features/general/employee-management/Advance/AdvanceDeleteDialog.tsx`
  - `src/components/features/general/employee-management/Advance/AdvanceFormDialog.tsx`
  - `src/components/features/general/employee-management/Advance/AdvanceStatusDialog.tsx`
  - `src/components/features/general/employee-management/Attendance/AttendanceDeleteDialog.tsx`
  - `src/components/features/general/employee-management/Attendance/AttendanceFormDialog.tsx`
  - `src/components/features/general/employee-management/Leave/LeaveApproveDialog.tsx`
  - `src/components/features/general/employee-management/Leave/LeaveFormDialog.tsx`
  - `src/components/features/general/employee-management/Leave/LeaveRejectDialog.tsx`

- **Financial management**
  - `src/components/features/general/financial-management/FinancialReportsTemplate.tsx`
  - `src/components/features/general/financial-management/PayrollManagementTemplate.tsx`
  - `src/components/features/general/financial-management/components/AddExpenditureDialog.tsx`
  - `src/components/features/general/financial-management/components/AddIncomeDialog.tsx`
  - `src/components/features/general/financial-management/components/EmployeePayrollTable.tsx`
  - `src/components/features/general/financial-management/components/ExpenditureTable.tsx`
  - `src/components/features/general/financial-management/components/ExpenseChart.tsx`
  - `src/components/features/general/financial-management/components/FinancialStatsCards.tsx`
  - `src/components/features/general/financial-management/components/IncomeTable.tsx`
  - `src/components/features/general/financial-management/components/PayrollStatsCards.tsx`
  - `src/components/features/general/financial-management/components/ProfitLossTable.tsx`
  - `src/components/features/general/financial-management/components/RevenueChart.tsx`
  - `src/components/features/general/financial-management/components/SalaryCalculationForm.tsx`

- **Transport management**
  - `src/components/features/general/transport/TransportManagement.tsx`
  - `src/components/features/general/transport/TransportOverview.tsx`
  - `src/components/features/general/transport/BusRoutesTab.tsx`
  - `src/components/features/general/transport/DistanceSlabsTab.tsx`
  - `src/components/features/general/transport/RouteCard.tsx`
  - `src/components/features/general/transport/RouteDetailsDialog.tsx`
  - `src/components/features/general/transport/RouteFormDialog.tsx`
  - `src/components/features/general/transport/DistanceSlabFormDialog.tsx`

- **System management**
  - `src/components/features/general/system-management/BranchesManagement.tsx`
  - `src/components/features/general/system-management/InstituteManagement.tsx`

### School-related components

- **Academic management**
  - `src/components/features/school/academic/AcademicManagement.tsx`
  - `src/components/features/school/academic/AcademicOverviewCards.tsx`
  - `src/components/features/school/academic/AcademicCard.tsx`
  - `src/components/features/school/academic/academic-years/AcademicYearManagement.tsx`
  - `src/components/features/school/academic/classes/ClassesTab.tsx`
  - `src/components/features/school/academic/classes/AddClassDialog.tsx`
  - `src/components/features/school/academic/subjects/SubjectsTab.tsx`
  - `src/components/features/school/academic/subjects/AddSubjectDialog.tsx`
  - `src/components/features/school/academic/exams/ExamsTab.tsx`
  - `src/components/features/school/academic/exams/AddExamDialog.tsx`
  - `src/components/features/school/academic/tests/TestTab.tsx`

- **Student management**
  - `src/components/features/school/students/StudentManagement.tsx`
  - `src/components/features/school/students/StudentsTab.tsx`
  - `src/components/features/school/students/EnrollmentsTab.tsx`
  - `src/components/features/school/students/TransportTab.tsx`

- **Class management**
  - `src/components/features/school/classes/ClassManagement.tsx`

- **Attendance management**
  - `src/components/features/school/attendance/AttendanceManagement.tsx`

- **Marks management**
  - `src/components/features/school/marks/MarksManagement.tsx`
  - `src/components/features/school/marks/ExamMarksManagement.tsx`
  - `src/components/features/school/marks/TestMarksManagement.tsx`

- **Fees management**
  - `src/components/features/school/fees/FeesManagement.tsx`
  - `src/components/features/school/fees/FeeStatsCards.tsx`
  - `src/components/features/school/fees/tution-fee-balance/TuitionFeeBalancesPanel.tsx`
  - `src/components/features/school/fees/tution-fee-balance/StudentFeeBalancesTable.tsx`
  - `src/components/features/school/fees/tution-fee-structure/TuitionFeeStructuresPanel.tsx`
  - `src/components/features/school/fees/tution-fee-structure/FeeStructureTable.tsx`
  - `src/components/features/school/fees/transport-fee-balance/TransportFeeBalancesPanel.tsx`
  - `src/components/features/school/fees/fee-collection/PaymentCollectionForm.tsx`

- **Reservations / Admissions**
  - `src/components/features/school/reservations/ReservationManagement.tsx`
  - `src/components/features/school/reservations/ReservationForm.tsx`
  - `src/components/features/school/reservations/ReservationsTable.tsx`

- **School-related pages**
  - `src/components/pages/school/SchoolAcademicManagement.tsx`
  - `src/components/pages/school/SchoolStudentsManagement.tsx`
  - `src/components/pages/school/SchoolClassesManagement.tsx`
  - `src/components/pages/school/SchoolAttendanceManagement.tsx`
  - `src/components/pages/school/SchoolMarksManagement.tsx`
  - `src/components/pages/school/SchoolFeesManagement.tsx`
  - `src/components/pages/school/SchoolReservationManagement.tsx`


### College-related components

- **Academic management**
  - `src/components/features/college/templates/CollegeManagementTemplate.tsx`
  - `src/components/features/college/components/CollegeStatsCards.tsx`
  - `src/components/features/college/components/CoursesTable.tsx`
  - `src/components/features/college/components/GroupsTable.tsx`
  - `src/components/features/college/components/CombinationsTable.tsx`
  - `src/components/features/college/components/SectionsTable.tsx`

- **Student management**
  - `src/components/features/college/students/` (college-specific student components)

- **Class management**
  - `src/components/features/college/classes/` (college-specific class components)

- **Attendance management**
  - `src/components/features/college/attendance/` (college-specific attendance components)

- **Marks management**
  - `src/components/features/college/marks/` (college-specific marks components)

- **Fees management**
  - `src/components/features/college/fees/` (college-specific fees components)

- **Reservations / Admissions**
  - `src/components/features/college/reservations/` (college-specific reservation components)

- **College-related pages**
  - `src/components/pages/college/CollegeAcademicManagement.tsx`
  - `src/components/pages/college/CollegeStudentsManagement.tsx`
  - `src/components/pages/college/CollegeClassesManagement.tsx`
  - `src/components/pages/college/CollegeAttendanceManagement.tsx`
  - `src/components/pages/college/CollegeMarksManagement.tsx`
  - `src/components/pages/college/CollegeFeesManagement.tsx`
  - `src/components/pages/college/CollegeReservationManagement.tsx`

### APIs & Services

- **College services**
  - `src/lib/services/college/*` (e.g., `courses.service.ts`, `groups.service.ts`, `tests.service.ts`, `exam-marks.service.ts`, `tuition-fee-balances.service.ts`)

- **College hooks**
  - `src/lib/hooks/college/*` (e.g., `use-college-courses.ts`, `use-college-groups.ts`, `use-college-tests.ts`, `use-college-exam-marks.ts`)

- **College types**
  - `src/lib/types/college/*` (e.g., `courses.ts`, `groups.ts`, `tests.ts`, `exam-marks.ts`)

### Navigation Structure

- **General pages**
  - `/dashboard` → `src/components/pages/general/Dashboard.tsx`
  - `/institutes` → `src/components/features/general/system-management/InstituteManagement.tsx`
  - `/users` → `src/components/pages/general/UserManagementPage.tsx`
  - `/employees` → `src/components/pages/general/EmployeeManagementPage.tsx`
  - `/payroll` → `src/components/pages/general/PayrollManagementPage.tsx`
  - `/transport` → `src/components/pages/general/TransportManagementPage.tsx`
  - `/financial-reports` → `src/components/pages/general/FinancialReportsPage.tsx`
  - `/announcements` → `src/components/pages/general/AnnouncementPage.tsx`
  - `/audit-log` → `src/components/pages/general/AuditLog.tsx`

- **School pages**
  - `/school/academic` → `src/components/pages/school/SchoolAcademicManagement.tsx`
  - `/school/students` → `src/components/pages/school/SchoolStudentsManagement.tsx`
  - `/school/classes` → `src/components/pages/school/SchoolClassesManagement.tsx`
  - `/school/attendance` → `src/components/pages/school/SchoolAttendanceManagement.tsx`
  - `/school/marks` → `src/components/pages/school/SchoolMarksManagement.tsx`
  - `/school/fees` → `src/components/pages/school/SchoolFeesManagement.tsx`
  - `/school/reservations` → `src/components/pages/school/SchoolReservationManagement.tsx`

- **College pages**
  - `/college/academic` → `src/components/pages/college/CollegeAcademicManagement.tsx`
  - `/college/students` → `src/components/pages/college/CollegeStudentsManagement.tsx`
  - `/college/classes` → `src/components/pages/college/CollegeClassesManagement.tsx`
  - `/college/attendance` → `src/components/pages/college/CollegeAttendanceManagement.tsx`
  - `/college/marks` → `src/components/pages/college/CollegeMarksManagement.tsx`
  - `/college/fees` → `src/components/pages/college/CollegeFeesManagement.tsx`
  - `/college/reservations` → `src/components/pages/college/CollegeReservationManagement.tsx`
