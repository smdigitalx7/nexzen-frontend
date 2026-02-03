# FINAL PRODUCTION AUDIT — Nexzen ERP Frontend

> Generated offline by `tools/final-audit.mjs`.
> Timestamp: 2026-02-02T02:24:04.416Z
> Repo root: `E:/SMDigitalX-Works/Velocity_ERP/nexzen-frontend`

## Methodology (non-negotiable constraints)

- **Repository-wide read**: this report enumerates every file reachable under the repo root, excluding common build/deps folders, and skips binary/oversized files (listed explicitly).
- **Deterministic static checks**: findings are based on concrete text matches with line evidence. No guesswork.
- **Important limitation**: A file marked **CLEAN** only means **no issues were matched by these checks**; it does not prove functional correctness.

## Coverage Summary

- **Files analyzed (text)**: 902
- **Files flagged (problematic)**: 250
- **Files clean (by these checks)**: 652
- **Files skipped (binary)**: 16
- **Files skipped (too large > 2097152 bytes)**: 3

### Skipped binary files

| File | Size (bytes) |
|---|---:|
| `client/public/Assets - Akshara/aiterldlt.png` | 63527 |
| `client/public/Assets - Akshara/Akshara-headname.png` | 29701 |
| `client/public/Assets - Akshara/Akshara-loginbg.jpg` | 603214 |
| `client/public/Assets - Akshara/Fast2SMS.png` | 10895 |
| `client/public/assets/airteldltlogo.png` | 6456 |
| `client/public/assets/Akshara-headname.png` | 29701 |
| `client/public/assets/Akshara-loginbg.jpg` | 603214 |
| `client/public/assets/Akshara-loginbg2.jpg` | 519903 |
| `client/public/assets/Akshara-logo.png` | 1997641 |
| `client/public/assets/Fast2SMS.png` | 10895 |
| `client/public/assets/forgot_password_bg.png` | 403803 |
| `client/public/assets/institiute-bgg.jpg` | 1025161 |
| `client/public/assets/loginbg.jpg` | 641296 |
| `client/public/assets/nexzen-logo.png` | 778829 |
| `client/public/assets/Velocity-logo.png` | 169694 |
| `client/public/assets/Velonex-headname1.png` | 14629 |

### Skipped oversized files

| File | Size (bytes) |
|---|---:|
| `client/public/Assets - Akshara/Akshara-logo.png` | 5948754 |
| `client/public/assets/12x18---Ryaliii2.jpg` | 6597580 |
| `client/public/assets/institute-photo.jpg` | 2331774 |

## Production Risk Table (file-level)

| File / Module | Issue (detected) | Severity | Impact | Fix Priority |
|---|---|---|---|---|
| `client/docs/college_pay_fee_endpoint_guide.md` | JSON.stringify usage (perf + key stability review) (line 1061) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `client/src/common/components/layout/AcademicYearSwitcher.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/layout/BranchSwitcher.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/layout/Header.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/layout/Sidebar.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/AddOtherIncomeDialog.tsx` | Framer-motion usage (perf review) (line 5) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/CollegeSearchResultCard.tsx` | Framer-motion usage (perf review) (line 5) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/dashboard/StatsCard.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/EnhancedDataTable.tsx` | ExcelJS import (bundle + freeze risk) (line 46) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/common/components/shared/FormDialog.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 114) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/shared/NetworkErrorPage.tsx` | Framer-motion usage (perf review) (line 11) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/OtherIncomeTable.tsx` | Framer-motion usage (perf review) (line 8) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/CollegeReservationPaymentProcessor.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/multiple-payment/components/OtherComponent.tsx` | Framer-motion usage (perf review) (line 7) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/multiple-payment/MultiplePaymentForm.tsx` | Framer-motion usage (perf review) (line 7) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/multiple-payment/PaymentItemCard.tsx` | Framer-motion usage (perf review) (line 7) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/multiple-payment/PaymentItemsList.tsx` | Framer-motion usage (perf review) (line 7) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/multiple-payment/PaymentSummary.tsx` | Framer-motion usage (perf review) (line 7) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/PaymentConfirmationDialog.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/PaymentProcessor.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/PaymentSuccess.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/README.md` | Console logging (prod noise / potential perf) (line 88) | Medium | Console logging (prod noise / potential perf) | P2 |
| `client/src/common/components/shared/payment/ReceiptDownload.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/payment/ReservationPaymentProcessor.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/ProductionErrorBoundary.tsx` | Hard navigation/remount risk (line 81) | High | Hard navigation/remount risk | P1 |
| `client/src/common/components/shared/ReceiptPreviewModal.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 332) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/shared/reservations/ReservationEditDialog.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 74) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/shared/reservations/ReservationPaymentDialog.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 57) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/shared/reservations/ReservationViewDialog.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 58) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/shared/SchoolSearchResultCard.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/shared/ServerSidePagination.tsx` | ARIA label present (spot-check) (line 119) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/common/components/shared/ViewDialog.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/components/ui/badge.tsx` | ARIA label present (spot-check) (line 72) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/common/components/ui/calendar.tsx` | Select without aria-label (a11y risk) (line 60) | Medium | Select without aria-label (a11y risk) | P2 |
| `client/src/common/components/ui/date-picker.tsx` | Select without aria-label (a11y risk) (line 76) | Medium | Select without aria-label (a11y risk) | P2 |
| `client/src/common/components/ui/dialog.tsx` | ARIA label present (spot-check) (line 153) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/common/components/ui/input.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 119) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/ui/pagination.tsx` | ARIA label present (spot-check) (line 10) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/common/components/ui/ProfessionalLoader.tsx` | ARIA label present (spot-check) (line 60) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/common/components/ui/sidebar.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 258) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/common/components/ui/skeleton.tsx` | Framer-motion usage (perf review) (line 3) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/common/hooks/README-tab-navigation.md` | Console logging (prod noise / potential perf) (line 300) | Medium | Console logging (prod noise / potential perf) | P2 |
| `client/src/common/hooks/use-mutation-with-toast.ts` | JSON.stringify usage (perf + key stability review) (line 52) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `client/src/common/hooks/useGlobalRefetch.ts` | Global invalidateQueries() (over-invalidation risk) (line 102) | Medium | Global invalidateQueries() (over-invalidation risk) | P2 |
| `client/src/common/hooks/useIdleTimeout.ts` | Hard navigation/remount risk (line 92) | High | Hard navigation/remount risk | P1 |
| `client/src/common/hooks/useQueryOptimization.ts` | Manual refetchQueries() (storm risk) (line 32) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/common/react-test.tsx` | Console logging (prod noise / potential perf) (line 23) | Medium | Console logging (prod noise / potential perf) | P2 |
| `client/src/common/utils/export/admissionsExport.ts` | ExcelJS import (bundle + freeze risk) (line 1) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/common/utils/export/excel-export-utils.ts` | ExcelJS import (bundle + freeze risk) (line 1) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/common/utils/export/export-utils.ts` | ExcelJS import (bundle + freeze risk) (line 4) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/common/utils/export/student-marks-export.ts` | ExcelJS import (bundle + freeze risk) (line 1) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/common/utils/export/student-performance-export.ts` | ExcelJS import (bundle + freeze risk) (line 1) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/common/utils/performance/bundleOptimizer.ts` | Console logging (prod noise / potential perf) (line 64) | Medium | Console logging (prod noise / potential perf) | P2 |
| `client/src/common/utils/performance/performance.ts` | Console logging (prod noise / potential perf) (line 123) | Medium | Console logging (prod noise / potential perf) | P2 |
| `client/src/common/utils/performance/production-optimizations.ts` | Hard navigation/remount risk (line 368) | High | Hard navigation/remount risk | P1 |
| `client/src/common/utils/workers` | ExcelJS import (bundle + freeze risk) (line 2) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/core/api/api-college-other-income.ts` | JSON.stringify usage (perf + key stability review) (line 46) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `client/src/core/api/api-college.ts` | JSON.stringify usage (perf + key stability review) (line 86) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `client/src/core/api/api-school-other-income.ts` | JSON.stringify usage (perf + key stability review) (line 40) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `client/src/core/api/api-school.ts` | JSON.stringify usage (perf + key stability review) (line 64) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `client/src/core/api/api.ts` | Axios interceptor present (refresh/cancel complexity) (line 162) | Critical | Axios interceptor present (refresh/cancel complexity) | P0 |
| `client/src/core/api/index.ts` | Custom token refresh implementation (line 160) | Critical | Custom token refresh implementation | P0 |
| `client/src/core/auth/authStore.ts` | Hard navigation/remount risk (line 504) | High | Hard navigation/remount risk | P1 |
| `client/src/core/auth/storage.ts` | Logout restore-prevention flag usage (line 141) | Critical | Logout restore-prevention flag usage | P0 |
| `client/src/core/permissions/USAGE_EXAMPLES.tsx` | Console logging (prod noise / potential perf) (line 29) | Medium | Console logging (prod noise / potential perf) | P2 |
| `client/src/core/query/index.ts` | Enabled guard present (review for correctness) (line 9) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/college/components/academic/AcademicCard.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/academic/AcademicManagement.tsx` | Enabled guard present (review for correctness) (line 64) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/college/components/academic/AcademicOverviewCards.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/admissions/ConfirmedReservationsTab.tsx` | Manual refetchQueries() (storm risk) (line 1059) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/components/attendance/AttendanceManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/attendance/AttendanceView.tsx` | Enabled guard present (review for correctness) (line 57) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/college/components/classes/ClassManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/collect-fee/CollectFee.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/collect-fee/CollectFeeSearch.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/FeesManagement.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/FeeStatsCards.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/transport-fee-balance/TransportFeeBalancesPanel.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/tution-fee-balance/StudentFeeBalancesTable.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/fees/tution-fee-balance/TuitionFeeBalancesPanel.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/components/ExamMarksReport.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/components/StudentMarksView.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/components/StudentPerformanceView.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/components/TestMarksReport.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/ExamMarksManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/MarksManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/marks/TestMarksManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/CollegeReportsTemplate.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/components/CollegeFinanceReportButtons.tsx` | ARIA label present (spot-check) (line 116) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/college/components/reports/components/CollegeFinanceReportDialog.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/components/CollegeFinancialAnalytics.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/components/ExpenditureTable.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/components/IncomeTable.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/components/ViewExpenditureDialog.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/components/reports/components/ViewIncomeDialog.tsx` | Enabled guard present (review for correctness) (line 41) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/college/components/reservations/ReservationManagement.tsx` | Hard navigation/remount risk (line 1195) | High | Hard navigation/remount risk | P1 |
| `client/src/features/college/components/reservations/ReservationsTable.tsx` | ARIA label present (spot-check) (line 255) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/college/components/reservations/StatusUpdateComponent.tsx` | ARIA label present (spot-check) (line 90) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/college/components/students/PromotionDropoutTab.tsx` | ARIA label present (spot-check) (line 134) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/college/components/students/StudentManagement.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/college/hooks/use-college-admissions.ts` | Enabled guard present (review for correctness) (line 29) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/college/hooks/use-college-attendance.ts` | Manual refetchQueries() (storm risk) (line 36) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-classes.ts` | Manual refetchQueries() (storm risk) (line 60) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-courses.ts` | Manual refetchQueries() (storm risk) (line 31) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-enrollments.ts` | Manual refetchQueries() (storm risk) (line 42) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-exam-marks.ts` | Manual refetchQueries() (storm risk) (line 38) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-exams.ts` | Manual refetchQueries() (storm risk) (line 65) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-expenditure.ts` | Query key contains object literal (stability risk) (line 73) | Medium | Query key contains object literal (stability risk) | P2 |
| `client/src/features/college/hooks/use-college-groups.ts` | Manual refetchQueries() (storm risk) (line 57) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-income.ts` | Query key contains object literal (stability risk) (line 74) | Medium | Query key contains object literal (stability risk) | P2 |
| `client/src/features/college/hooks/use-college-subjects.ts` | Manual refetchQueries() (storm risk) (line 78) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-test-marks.ts` | Manual refetchQueries() (storm risk) (line 62) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-tests.ts` | Manual refetchQueries() (storm risk) (line 47) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-college-transport-balances.ts` | Query key contains object literal (stability risk) (line 13) | Medium | Query key contains object literal (stability risk) | P2 |
| `client/src/features/college/hooks/use-college-tuition-balances.ts` | Manual refetchQueries() (storm risk) (line 50) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-student-transport-assignments.ts` | Manual refetchQueries() (storm risk) (line 29) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-teacher-course-subjects.ts` | Manual refetchQueries() (storm risk) (line 20) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/use-teacher-group-subjects.ts` | Manual refetchQueries() (storm risk) (line 28) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/college/hooks/useMonthlyFeeConfig.ts` | Enabled guard present (review for correctness) (line 51) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/college/services/income.service.ts` | responseType passed (may be wrong for fetch-based client) (line 90) | Critical | responseType passed (may be wrong for fetch-based client) | P0 |
| `client/src/features/general/components/Announcemnts/AnnouncementCard.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/Announcemnts/AnnouncementsFilters.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/Announcemnts/AnnouncementsList.tsx` | Hard navigation/remount risk (line 56) | High | Hard navigation/remount risk | P1 |
| `client/src/features/general/components/Announcemnts/AnnouncementsManagement.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/Announcemnts/AnnouncementsOverview.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/Announcemnts/SMS/SMSManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/Announcemnts/SMS/SMSReports.tsx` | ExcelJS import (bundle + freeze risk) (line 14) | Medium | ExcelJS import (bundle + freeze risk) | P2 |
| `client/src/features/general/components/Announcemnts/SMS/SMSTemplates.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/employee-management/Advance/AdvanceVoucherPrintDialog.tsx` | Framer-motion usage (perf review) (line 12) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/employee-management/components/EmployeeManagementHeader.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/employee-management/employee/EmployeesStatsCards.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/employee-management/Leave/LeaveViewDialog.tsx` | Keyboard accessibility suppression (tabIndex=-1) (line 120) | Medium | Keyboard accessibility suppression (tabIndex=-1) | P2 |
| `client/src/features/general/components/financial-management/components/PayrollStatsCards.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/financial-management/components/SalaryCalculationForm.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/financial-management/PayrollManagementTemplate.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/system-management/InstituteManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/transport/BusRoutesTab.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/transport/RouteCard.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/transport/TransportManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/transport/TransportOverview.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/components/user-management/UserManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/hooks/use-logos.ts` | Manual refetchQueries() (storm risk) (line 47) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/hooks/use-payment-receipts.ts` | Manual refetchQueries() (storm risk) (line 27) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/hooks/useAcademicYear.ts` | Enabled guard present (review for correctness) (line 37) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useAdvances.ts` | Enabled guard present (review for correctness) (line 50) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useAnnouncements.ts` | Enabled guard present (review for correctness) (line 86) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useAuth.ts` | Global invalidateQueries() (over-invalidation risk) (line 209) | Medium | Global invalidateQueries() (over-invalidation risk) | P2 |
| `client/src/features/general/hooks/useBranches.ts` | Enabled guard present (review for correctness) (line 36) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useDistanceSlabs.ts` | Enabled guard present (review for correctness) (line 32) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useEmployeeAttendance.ts` | Enabled guard present (review for correctness) (line 53) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useEmployeeLeave.ts` | Manual refetchQueries() (storm risk) (line 121) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/hooks/useEmployeeManagement.ts` | Manual refetchQueries() (storm risk) (line 403) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/hooks/useEmployees.ts` | Enabled guard present (review for correctness) (line 90) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useGrades.ts` | Enabled guard present (review for correctness) (line 39) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useLogs.ts` | Enabled guard present (review for correctness) (line 38) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/usePayrollManagement.ts` | Manual refetchQueries() (storm risk) (line 379) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/hooks/useRoles.ts` | Enabled guard present (review for correctness) (line 28) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useSMS.ts` | Enabled guard present (review for correctness) (line 75) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/general/hooks/useTransport.ts` | Manual refetchQueries() (storm risk) (line 67) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/hooks/useUsers.ts` | Manual refetchQueries() (storm risk) (line 69) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/general/pages/AuditLog.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/pages/components/settings/DataManagementTab.tsx` | Hard navigation/remount risk (line 59) | High | Hard navigation/remount risk | P1 |
| `client/src/features/general/pages/components/settings/SecurityTab.tsx` | Framer-motion usage (perf review) (line 11) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/pages/Login.tsx` | Framer-motion usage (perf review) (line 3) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/pages/ProfilePage.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/pages/SettingsPage.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/general/services/payment-receipts.service.ts` | responseType passed (may be wrong for fetch-based client) (line 50) | Critical | responseType passed (may be wrong for fetch-based client) | P0 |
| `client/src/features/school/components/academic/AcademicCard.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/academic/AcademicManagement.tsx` | Enabled guard present (review for correctness) (line 62) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/components/academic/AcademicOverviewCards.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/admissions/ConfirmedReservationsTab.tsx` | Manual refetchQueries() (storm risk) (line 1034) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/components/attendance/AttendanceManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/fees/collect-fee/CollectFee.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/fees/collect-fee/CollectFeeSearch.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/fees/FeesManagement.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/fees/transport-fee-balance/TransportFeeBalancesPanel.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/fees/tution-fee-balance/StudentFeeBalancesTable.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/fees/tution-fee-balance/TuitionFeeBalancesPanel.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/marks/AddMarksByClassDialog.tsx` | Enabled guard present (review for correctness) (line 117) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/components/marks/AddTestMarksByClassDialog.tsx` | Enabled guard present (review for correctness) (line 117) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/components/marks/CompleteMarksEntry.tsx` | Enabled guard present (review for correctness) (line 101) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/components/marks/CompleteMarksTab.tsx` | Enabled guard present (review for correctness) (line 101) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/components/marks/components/ExamMarksReport.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/marks/components/StudentPerformanceView.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/marks/components/TestMarksReport.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/marks/ExamMarksManagement.tsx` | Manual refetchQueries() (storm risk) (line 770) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/components/marks/MarksManagement.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/marks/TestMarksManagement.tsx` | Manual refetchQueries() (storm risk) (line 1505) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/components/reports/components/ExpenditureTable.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reports/components/FinanceReportDialog.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reports/components/IncomeSummaryTable.tsx` | Enabled guard present (review for correctness) (line 136) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/components/reports/components/SchoolFinanceReportButtons.tsx` | ARIA label present (spot-check) (line 117) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/school/components/reports/components/SchoolFinancialAnalytics.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reports/components/ViewExpenditureDialog.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reports/components/ViewIncomeDialog.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reports/SchoolReportsTemplate.tsx` | Framer-motion usage (perf review) (line 2) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reservations/ReservationManagement.tsx` | Framer-motion usage (perf review) (line 11) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/components/reservations/ReservationsTable.tsx` | ARIA label present (spot-check) (line 349) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/school/components/reservations/StatusUpdateTable.tsx` | ARIA label present (spot-check) (line 94) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/school/components/students/PromotionDropoutTab.tsx` | ARIA label present (spot-check) (line 135) | Medium | ARIA label present (spot-check) | P2 |
| `client/src/features/school/components/students/StudentManagement.tsx` | Framer-motion usage (perf review) (line 1) | Medium | Framer-motion usage (perf review) | P2 |
| `client/src/features/school/hooks/use-school-admissions.ts` | Enabled guard present (review for correctness) (line 29) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/hooks/use-school-attendance.ts` | Manual refetchQueries() (storm risk) (line 37) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-class-subjects.ts` | Manual refetchQueries() (storm risk) (line 28) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-class.ts` | Enabled guard present (review for correctness) (line 17) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/hooks/use-school-classes.ts` | Manual refetchQueries() (storm risk) (line 29) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-enrollments.ts` | Manual refetchQueries() (storm risk) (line 54) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-exam-marks.ts` | Manual refetchQueries() (storm risk) (line 36) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-exams-tests.ts` | Manual refetchQueries() (storm risk) (line 74) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-fee-balances.ts` | Enabled guard present (review for correctness) (line 15) | Medium | Enabled guard present (review for correctness) | P2 |
| `client/src/features/school/hooks/use-school-income-expenditure.ts` | Query key contains object literal (stability risk) (line 40) | Medium | Query key contains object literal (stability risk) | P2 |
| `client/src/features/school/hooks/use-school-sections.ts` | Manual refetchQueries() (storm risk) (line 26) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-student-transport.ts` | Manual refetchQueries() (storm risk) (line 27) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-subjects.ts` | Manual refetchQueries() (storm risk) (line 32) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-school-test-marks.ts` | Manual refetchQueries() (storm risk) (line 35) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/features/school/hooks/use-teacher-class-subjects.ts` | Manual refetchQueries() (storm risk) (line 42) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `client/src/store/cacheStore.ts` | JSON.stringify usage (perf + key stability review) (line 166) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `docs/API_CALLS_TAB_NAVIGATION_SUMMARY.md` | Enabled guard present (review for correctness) (line 185) | Medium | Enabled guard present (review for correctness) | P2 |
| `docs/ARCHITECTURE_FIXES_IMPLEMENTED.md` | Custom token refresh implementation (line 109) | Critical | Custom token refresh implementation | P0 |
| `docs/AUTHENTICATION_ARCHITECTURE.md` | Token persisted to storage (security) (line 345) | Critical | Token persisted to storage (security) | P0 |
| `docs/AUTHENTICATION_AUDIT_REPORT.md` | Token persisted to storage (security) (line 169) | Critical | Token persisted to storage (security) | P0 |
| `docs/AUTHENTICATION_HARDENING_REPORT.md` | Hard navigation/remount risk (line 248) | High | Hard navigation/remount risk | P1 |
| `docs/CACHING_EXPLANATION.md` | Manual refetchQueries() (storm risk) (line 50) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/COMPLETE_FIXES_APPLIED.md` | Manual refetchQueries() (storm risk) (line 117) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/COMPREHENSIVE_PROJECT_AUDIT_REPORT.md` | Console logging (prod noise / potential perf) (line 249) | Medium | Console logging (prod noise / potential perf) | P2 |
| `docs/CRITICAL_ISSUES_REPORT.md` | Manual refetchQueries() (storm risk) (line 30) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/DEEP_ARCHITECTURE_AUDIT.md` | Custom token refresh implementation (line 265) | Critical | Custom token refresh implementation | P0 |
| `docs/EMPLOYEE_MODULE_DEEP_AUDIT.md` | Manual refetchQueries() (storm risk) (line 37) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/EMPLOYEE_MODULE_FIXES_VERIFICATION.md` | Manual refetchQueries() (storm risk) (line 36) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/ENV_VARIABLES_FLOW.md` | Console logging (prod noise / potential perf) (line 172) | Medium | Console logging (prod noise / potential perf) | P2 |
| `docs/FINAL_VALIDATION_REPORT.md` | Global invalidateQueries() (over-invalidation risk) (line 124) | Medium | Global invalidateQueries() (over-invalidation risk) | P2 |
| `docs/LEAVE_APPROVAL_COMPLETE_REDESIGN.md` | Manual refetchQueries() (storm risk) (line 73) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/LOADING_AND_PERFORMANCE_ISSUES.md` | Query key contains object literal (stability risk) (line 375) | Medium | Query key contains object literal (stability risk) | P2 |
| `docs/LOGOUT_REQUEST_ANALYSIS.md` | Hard navigation/remount risk (line 38) | High | Hard navigation/remount risk | P1 |
| `docs/main_ui_updated.md` | Custom token refresh implementation (line 435) | Critical | Custom token refresh implementation | P0 |
| `docs/MODULE_WISE_ANALYSIS_AND_SOLUTIONS.md` | Manual refetchQueries() (storm risk) (line 138) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/PRODUCTION_GUIDE.md` | Console logging (prod noise / potential perf) (line 220) | Medium | Console logging (prod noise / potential perf) | P2 |
| `docs/PROJECT_COMPREHENSIVE_ANALYSIS.md` | Global invalidateQueries() (over-invalidation risk) (line 317) | Medium | Global invalidateQueries() (over-invalidation risk) | P2 |
| `docs/STUDENT_UPDATE_TABLE_REFRESH_ISSUE_ANALYSIS.md` | Manual refetchQueries() (storm risk) (line 19) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/TAB_ON_DEMAND_OPTIMIZATION_SUMMARY.md` | Enabled guard present (review for correctness) (line 172) | Medium | Enabled guard present (review for correctness) | P2 |
| `docs/TABLE_REFRESH_ISSUES_ANALYSIS.md` | Global invalidateQueries() (over-invalidation risk) (line 39) | Medium | Global invalidateQueries() (over-invalidation risk) | P2 |
| `docs/UI_FREEZE_ACTIONABLE_AUDIT.md` | Manual refetchQueries() (storm risk) (line 153) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/UI_FREEZE_COMPREHENSIVE_AUDIT.md` | Manual refetchQueries() (storm risk) (line 543) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/UI_FREEZE_DIAGNOSIS.md` | Manual refetchQueries() (storm risk) (line 163) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/UI_FREEZE_FIX_PRIORITY.md` | JSON.stringify usage (perf + key stability review) (line 66) | Medium | JSON.stringify usage (perf + key stability review) | P2 |
| `docs/UI_FREEZE_FIXES_APPLIED.md` | Manual refetchQueries() (storm risk) (line 91) | Medium | Manual refetchQueries() (storm risk) | P2 |
| `docs/UI_FREEZING_ISSUES_ANALYSIS.md` | Global invalidateQueries() (over-invalidation risk) (line 93) | Medium | Global invalidateQueries() (over-invalidation risk) | P2 |
| `SMS_INTEGRATION_GUIDE.md` | Select without aria-label (a11y risk) (line 930) | Medium | Select without aria-label (a11y risk) | P2 |
| `tools/final-audit.mjs` | Logout restore-prevention flag usage (line 94) | Critical | Logout restore-prevention flag usage | P0 |
| `vite.config.ts` | JSON.stringify usage (perf + key stability review) (line 22) | Medium | JSON.stringify usage (perf + key stability review) | P2 |

## Per-file Findings (explicit CLEAN vs PROBLEMATIC)

### `client/docs/college_pay_fee_endpoint_guide.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 1061 — `body: JSON.stringify(request),`
  - **JSON.stringify usage (perf + key stability review)**: line 1179 — `body: JSON.stringify(request),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/layout/AcademicYearSwitcher.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 88 — `<motion.div`
  - **ARIA label present (spot-check)**: line 68 — `aria-label="Select academic year"`
  - **Console logging (prod noise / potential perf)**: line 30 — `console.log(`Academic year switch initiated for ${year.year_name}`);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/layout/BranchSwitcher.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 106 — `<motion.div`
  - **ARIA label present (spot-check)**: line 74 — `aria-label="Select schema and branch"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/layout/Header.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 263 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 277 — `<motion.header`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/layout/Sidebar.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 299 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 333 — `<motion.aside`
  - **Framer-motion usage (perf review)**: line 350 — `<motion.div`
  - **JSON.stringify usage (perf + key stability review)**: line 283 — `JSON.stringify(navData)`
  - **Console logging (prod noise / potential perf)**: line 405 — `// console.log("🎨 Rendering Schema Modules:", {`
  - **Console logging (prod noise / potential perf)**: line 444 — `// console.log("🎨 Rendering General Modules:", {`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/AddOtherIncomeDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 5 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 302 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/CollegeSearchResultCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 5 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 120 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/dashboard/StatsCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 381 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/EnhancedDataTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 46 — `import * as ExcelJS from "exceljs";`
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 1113 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 1440 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 1506 — `<motion.tr`
  - **Framer-motion usage (perf review)**: line 1569 — `<motion.tr`
  - **JSON.stringify usage (perf + key stability review)**: line 745 — `return JSON.stringify(value).replace(/[{}"]/g, "").slice(0, 40); // Reduced from 50`
  - **ARIA label present (spot-check)**: line 1157 — `aria-label="Search table data"`
  - **ARIA label present (spot-check)**: line 1373 — `aria-label="Data table"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/FormDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 114 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 113 — `aria-label="Form content"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/NetworkErrorPage.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 11 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 41 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 59 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 71 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 90 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 98 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 131 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/OtherIncomeTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 8 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 130 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/CollegeReservationPaymentProcessor.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 315 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 404 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 443 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/multiple-payment/components/OtherComponent.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 7 — `import { motion } from 'framer-motion';`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/multiple-payment/MultiplePaymentForm.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 7 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 515 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 573 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/multiple-payment/PaymentItemCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 7 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 132 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/multiple-payment/PaymentItemsList.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 7 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 161 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 188 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 213 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 251 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 359 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 461 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 477 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/multiple-payment/PaymentSummary.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 7 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 157 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 208 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 222 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/PaymentConfirmationDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 75 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 126 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 142 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 173 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 190 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/PaymentProcessor.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 210 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 237 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 254 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/PaymentSuccess.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 139 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 147 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 152 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 158 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 166 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 179 — `<motion.div variants={itemVariants}>`
  - **Framer-motion usage (perf review)**: line 261 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 284 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/README.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 88 — `console.log('Payment completed:', data);`
  - **Console logging (prod noise / potential perf)**: line 96 — `onCancel={() => console.log('Cancelled')}`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/ReceiptDownload.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 166 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 249 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 282 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 297 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/payment/ReservationPaymentProcessor.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 330 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 384 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/ProductionErrorBoundary.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 81 — `url: window.location.href,`
  - **Hard navigation/remount risk**: line 107 — `window.location.href = "/";`
  - **Hard navigation/remount risk**: line 111 — `window.location.reload();`
  - **JSON.stringify usage (perf + key stability review)**: line 125 — `.writeText(JSON.stringify(errorDetails, null, 2))`
  - **Console logging (prod noise / potential perf)**: line 87 — `console.log("Error report:", errorReport);`
  - **Console logging (prod noise / potential perf)**: line 133 — `console.log("Error details:", errorDetails);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/ReceiptPreviewModal.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 332 — `tabIndex={-1}`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/reservations/ReservationEditDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 74 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 73 — `aria-label="Edit reservation form"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/reservations/ReservationPaymentDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 57 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 56 — `aria-label="Payment processing form"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/reservations/ReservationViewDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 58 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 57 — `aria-label="Reservation details"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/SchoolSearchResultCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 95 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/ServerSidePagination.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 119 — `aria-label="First page"`
  - **ARIA label present (spot-check)**: line 129 — `aria-label="Previous page"`
  - **ARIA label present (spot-check)**: line 177 — `aria-label="Next page"`
  - **ARIA label present (spot-check)**: line 187 — `aria-label="Last page"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/shared/ViewDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 258 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/badge.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 72 — `aria-label="Remove"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/calendar.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Select without aria-label (a11y risk)**: line 60 — `<select`
  - **Select without aria-label (a11y risk)**: line 71 — `<select`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/date-picker.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Select without aria-label (a11y risk)**: line 76 — `<select`
  - **Select without aria-label (a11y risk)**: line 87 — `<select`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/dialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 153 — `aria-label="Close dialog"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/input.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 119 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 74 — `<span className="text-destructive ml-1" aria-label="required">`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/pagination.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 10 — `aria-label="pagination"`
  - **ARIA label present (spot-check)**: line 67 — `aria-label="Go to previous page"`
  - **ARIA label present (spot-check)**: line 83 — `aria-label="Go to next page"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/ProfessionalLoader.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 60 — `aria-label="Loading"`
  - **ARIA label present (spot-check)**: line 83 — `<div className={cn("flex items-center gap-1.5", className)} role="status" aria-label="Loading">`
  - **ARIA label present (spot-check)**: line 125 — `aria-label="Loading"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/sidebar.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 258 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 257 — `aria-label="Toggle Sidebar"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/components/ui/skeleton.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 3 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 37 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 54 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/hooks/README-tab-navigation.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 300 — `console.log("Active tab:", activeTab);`
  - **Console logging (prod noise / potential perf)**: line 301 — `console.log("All params:", Object.fromEntries(searchParams));`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/hooks/use-mutation-with-toast.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 52 — `errorMessage = JSON.stringify(errorDetail);`
  - **JSON.stringify usage (perf + key stability review)**: line 134 — `errorMessage = JSON.stringify(errorDetail);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/hooks/useGlobalRefetch.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Global invalidateQueries() (over-invalidation risk)**: line 102 — `* @deprecated Use invalidateQueries() instead`
  - **Global invalidateQueries() (over-invalidation risk)**: line 103 — `* This function is kept for backward compatibility but simply calls invalidateQueries()`
  - **Global invalidateQueries() (over-invalidation risk)**: line 275 — `void queryClient.invalidateQueries();`
  - **Manual refetchQueries() (storm risk)**: line 227 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/hooks/useIdleTimeout.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 92 — `window.location.replace("/login");`
  - **Hard navigation/remount risk**: line 240 — `window.location.replace("/login");`
  - **Hard navigation/remount risk**: line 246 — `window.location.replace("/login");`
  - **Console logging (prod noise / potential perf)**: line 77 — `console.log("Logout skipped in useIdleTimeout: already logging out or not authenticated");`
  - **Console logging (prod noise / potential perf)**: line 83 — `console.log("Performing idle timeout logout...");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/hooks/useQueryOptimization.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 32 — `await queryClient.refetchQueries({ queryKey });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/react-test.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 23 — `console.log("✅ forwardRef test passed");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/export/admissionsExport.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 1 — `import ExcelJS from "exceljs";`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/export/excel-export-utils.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 1 — `import ExcelJS from "exceljs";`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/export/export-utils.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 4 — `import ExcelJS from 'exceljs';`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/export/student-marks-export.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 1 — `import ExcelJS from 'exceljs';`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/export/student-performance-export.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 1 — `import ExcelJS from 'exceljs';`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/performance/bundleOptimizer.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 64 — `console.log('📊 Bundle Analysis Available');`
  - **Console logging (prod noise / potential perf)**: line 65 — `console.log('Run: npm run build:analyze to generate bundle report');`
  - **Console logging (prod noise / potential perf)**: line 105 — `console.log('No critical resources to preload');`
  - **Console logging (prod noise / potential perf)**: line 128 — `console.log('📦 Bundle Load Time:', {`
  - **Console logging (prod noise / potential perf)**: line 158 — `console.log('🧠 Memory Usage:', {`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/performance/performance.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 123 — `console.log(`⏱️ ${operationName} completed in ${duration.toFixed(2)}ms`);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/performance/production-optimizations.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 368 — `url: window.location.href,`
  - **Hard navigation/remount risk**: line 395 — `url: window.location.href,`
  - **Console logging (prod noise / potential perf)**: line 28 — `console.log(`${name} completed in ${(endTime - startTime).toFixed(2)}ms`);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/common/utils/workers`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 2 — `import ExcelJS from 'exceljs';`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/api/api-college-other-income.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 46 — `body: JSON.stringify(payload),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/api/api-college.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 86 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 186 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 288 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 442 — `body: JSON.stringify(payload),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/api/api-school-other-income.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 40 — `body: JSON.stringify(payload),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/api/api-school.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 64 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 163 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 265 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 424 — `body: JSON.stringify(payload),`
  - **JSON.stringify usage (perf + key stability review)**: line 493 — `body: JSON.stringify(payload),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/api/api.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Axios interceptor present (refresh/cancel complexity)**: line 162 — `apiClient.interceptors.request.use(`
  - **Axios interceptor present (refresh/cancel complexity)**: line 215 — `apiClient.interceptors.response.use(`
  - **Custom token refresh implementation**: line 74 — `async function refreshAccessToken(): Promise<string | null> {`
  - **Custom token refresh implementation**: line 251 — `const newToken = await refreshAccessToken();`
  - **Custom token refresh implementation**: line 268 — `// Refresh failed - error already handled in refreshAccessToken`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/api/index.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Custom token refresh implementation**: line 160 — `await tryRefreshToken(useAuthStore.getState().token);`
  - **Custom token refresh implementation**: line 198 — `async function tryRefreshToken(`
  - **Custom token refresh implementation**: line 433 — `const refreshed = await tryRefreshToken(token);`
  - **Custom token refresh implementation**: line 551 — `const refreshed = await tryRefreshToken(token);`
  - **JSON.stringify usage (perf + key stability review)**: line 485 — `body: body !== undefined ? JSON.stringify(body) : undefined,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/auth/authStore.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 504 — `window.location.replace("/login");`
  - **Hard navigation/remount risk**: line 507 — `window.location.reload();`
  - **Hard navigation/remount risk**: line 929 — `window.location.reload();`
  - **Hard navigation/remount risk**: line 977 — `window.location.reload();`
  - **Hard navigation/remount risk**: line 1027 — `window.location.reload();`
  - **Hard navigation/remount risk**: line 1068 — `window.location.reload();`
  - **Hard navigation/remount risk**: line 1079 — `window.location.reload();`
  - **Hard navigation/remount risk**: line 1091 — `window.location.reload();`
  - **Logout restore-prevention flag usage**: line 119 — `const logoutTimestamp = localStorage.getItem("__logout_initiated__") ||`
  - **Logout restore-prevention flag usage**: line 120 — `(typeof sessionStorage !== "undefined" ? sessionStorage.getItem("__logout_initiated__") : null);`
  - **Logout restore-prevention flag usage**: line 130 — `localStorage.removeItem("__logout_initiated__");`
  - **Logout restore-prevention flag usage**: line 132 — `sessionStorage.removeItem("__logout_initiated__");`
  - **Logout restore-prevention flag usage**: line 342 — `localStorage.removeItem("__logout_initiated__");`
  - **Logout restore-prevention flag usage**: line 344 — `sessionStorage.removeItem("__logout_initiated__");`
  - **Logout restore-prevention flag usage**: line 424 — `localStorage.setItem("__logout_initiated__", logoutTimestamp);`
  - **Logout restore-prevention flag usage**: line 427 — `sessionStorage.setItem("__logout_initiated__", logoutTimestamp);`
  - **Global invalidateQueries() (over-invalidation risk)**: line 765 — `void queryClient.invalidateQueries();`
  - **Global invalidateQueries() (over-invalidation risk)**: line 823 — `void queryClient.invalidateQueries();`
  - **JSON.stringify usage (perf + key stability review)**: line 272 — `throw new Error(`Invalid login response: user_info.branches is not an array. Received: ${typeof userInfo.branches}. Value: ${JSON.stringify(userInfo.branches)}`);`
  - **Console logging (prod noise / potential perf)**: line 110 — `console.log("Skipping bootstrapAuth: logout is in progress");`
  - **Console logging (prod noise / potential perf)**: line 145 — `console.log(`Skipping bootstrapAuth: logout was initiated ${Math.round(timeSinceLogout / 1000)}s ago`);`
  - **Console logging (prod noise / potential perf)**: line 347 — `console.log("Logout flag cleared after successful login");`
  - **Console logging (prod noise / potential perf)**: line 396 — `console.log("Logout already in progress, skipping duplicate call");`
  - **Console logging (prod noise / potential perf)**: line 430 — `console.log("Logout flag set with timestamp:", logoutTimestamp);`
  - **Console logging (prod noise / potential perf)**: line 447 — `console.log("Logout API call completed successfully - refresh token invalidated");`
  - **Console logging (prod noise / potential perf)**: line 454 — `console.log("Continuing with client-side cleanup - flag will prevent session restore");`
  - **Console logging (prod noise / potential perf)**: line 775 — `console.log("Starting logout process...");`
  - **Console logging (prod noise / potential perf)**: line 779 — `console.log("Backend logout successful");`
  - **Console logging (prod noise / potential perf)**: line 831 — `console.log("User logged out successfully");`
  - **Console logging (prod noise / potential perf)**: line 837 — `console.log(`
  - **Console logging (prod noise / potential perf)**: line 848 — `console.log("Branch switch response:", response);`
  - **Console logging (prod noise / potential perf)**: line 921 — `console.log(`
  - **Console logging (prod noise / potential perf)**: line 972 — `console.log("Branch switched locally (no token response). Reloading page...");`
  - **Console logging (prod noise / potential perf)**: line 1022 — `console.log("Branch switched locally (API call failed). Reloading page...");`
  - **Console logging (prod noise / potential perf)**: line 1034 — `console.log("Switching to academic year:", year.year_name, "ID:", year.academic_year_id);`
  - **Console logging (prod noise / potential perf)**: line 1041 — `console.log("Academic year switch response:", response);`
  - **Console logging (prod noise / potential perf)**: line 1064 — `console.log("Academic year switched successfully with token rotation. Reloading page...");`
  - **Console logging (prod noise / potential perf)**: line 1077 — `console.log("Academic year switched (no response token). Reloading page...");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/auth/storage.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Logout restore-prevention flag usage**: line 141 — `localStorage.removeItem("__logout_initiated__");`
  - **Logout restore-prevention flag usage**: line 142 — `sessionStorage.removeItem("__logout_initiated__");`
  - **JSON.stringify usage (perf + key stability review)**: line 36 — `return JSON.stringify(parsed);`
  - **JSON.stringify usage (perf + key stability review)**: line 44 — `typeof value === "string" ? value : JSON.stringify(value);`
  - **JSON.stringify usage (perf + key stability review)**: line 54 — `localStorage.setItem(name, JSON.stringify(parsed));`
  - **JSON.stringify usage (perf + key stability review)**: line 57 — `typeof value === "string" ? value : JSON.stringify(value);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/permissions/USAGE_EXAMPLES.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 29 — `<Button onClick={() => console.log("Create")}>Create Student</Button>`
  - **Console logging (prod noise / potential perf)**: line 32 — `<Button onClick={() => console.log("Edit")}>Edit Student</Button>`
  - **Console logging (prod noise / potential perf)**: line 35 — `<Button variant="destructive" onClick={() => console.log("Delete")}>`
  - **Console logging (prod noise / potential perf)**: line 173 — `console.log("Edit student", student);`
  - **Console logging (prod noise / potential perf)**: line 178 — `console.log("Delete student", student);`
  - **Console logging (prod noise / potential perf)**: line 216 — `<Button className="mt-4" onClick={() => console.log("Export")}>`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/core/query/index.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 9 — `* - refetchOnMount: false - No auto-refetch on component mount (use enabled: true explicitly where needed)`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/academic/AcademicCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 29 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/academic/AcademicManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 64 — `enabled: true, // Always enabled for cards (minimal data)`
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 260 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/academic/AcademicOverviewCards.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 28 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/admissions/ConfirmedReservationsTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 1059 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 1067 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 1161 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 1169 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/attendance/AttendanceManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 100 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 131 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 220 — `<motion.div`
  - **Console logging (prod noise / potential perf)**: line 117 — `console.log("Export attendance data");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/attendance/AttendanceView.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 57 — `enabled: !!attendanceParams && isTabActive, // ✅ Gate by tab active state`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/classes/ClassManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 257 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 328 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 415 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 455 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/collect-fee/CollectFee.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 587 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/collect-fee/CollectFeeSearch.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 484 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/FeesManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 72 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/FeeStatsCards.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 21 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/transport-fee-balance/TransportFeeBalancesPanel.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 269 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/tution-fee-balance/StudentFeeBalancesTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 180 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/fees/tution-fee-balance/TuitionFeeBalancesPanel.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 207 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/components/ExamMarksReport.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 182 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 296 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 369 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/components/StudentMarksView.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 268 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 314 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 351 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/components/StudentPerformanceView.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 208 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 262 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 281 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 300 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 338 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/components/TestMarksReport.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 178 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 292 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 364 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/ExamMarksManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 559 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 1125 — `<motion.div`
  - **Console logging (prod noise / potential perf)**: line 498 — `console.log('Exam Marks Data:', {`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/MarksManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 265 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 290 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/marks/TestMarksManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 575 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 1135 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/CollegeReportsTemplate.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 84 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/CollegeFinanceReportButtons.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 116 — `aria-label="Generate daily finance report"`
  - **ARIA label present (spot-check)**: line 132 — `aria-label="Generate custom date range finance report"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/CollegeFinanceReportDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 173 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/CollegeFinancialAnalytics.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 134 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 161 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 188 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 219 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 255 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 291 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 318 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 358 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 387 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/ExpenditureTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 312 — `<motion.div`
  - **Console logging (prod noise / potential perf)**: line 77 — `console.log("handleEdit called with expenditure:", expenditure);`
  - **Console logging (prod noise / potential perf)**: line 97 — `console.log("handleDelete called with expenditure:", expenditure);`
  - **Console logging (prod noise / potential perf)**: line 182 — `console.log("College Bill date cell - value:", value);`
  - **Console logging (prod noise / potential perf)**: line 215 — `console.log("College Payment method cell - value:", value);`
  - **Console logging (prod noise / potential perf)**: line 226 — `console.log("College Remarks cell - value:", value);`
  - **Console logging (prod noise / potential perf)**: line 243 — `console.log("College View clicked - expenditure:", expenditure);`
  - **Console logging (prod noise / potential perf)**: line 258 — `console.log("College Edit clicked - expenditure:", expenditure);`
  - **Console logging (prod noise / potential perf)**: line 269 — `console.log("College Delete clicked - expenditure:", expenditure);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/IncomeTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 275 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 290 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 306 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/ViewExpenditureDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 104 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reports/components/ViewIncomeDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 41 — `enabled: !!income?.income_id && open,`
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 140 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reservations/ReservationManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 1195 — `window.location.href = `/admissions/new?reservation=${reservation.reservation_id}`;`
  - **Framer-motion usage (perf review)**: line 11 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 1248 — `<motion.div`
  - **JSON.stringify usage (perf + key stability review)**: line 981 — `siblingsJson: JSON.stringify(siblings),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reservations/ReservationsTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 255 — `<SelectTrigger aria-label="Filter by status">`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/reservations/StatusUpdateComponent.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 90 — `<SelectTrigger aria-label="Select status" disabled={isConfirmed}>`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/students/PromotionDropoutTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 134 — `aria-label="Select all students"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/components/students/StudentManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 88 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-admissions.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 29 — `enabled: !!student_id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-attendance.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 36 — `void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 47 — `void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 59 — `void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 70 — `void qc.refetchQueries({ queryKey: collegeKeys.attendance.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-classes.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 60 — `void qc.refetchQueries({ queryKey: collegeKeys.classes.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 76 — `void qc.refetchQueries({ queryKey: collegeKeys.classes.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 109 — `void qc.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 113 — `void qc.refetchQueries({ queryKey: collegeKeys.classes.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-courses.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 31 — `void qc.refetchQueries({ queryKey: collegeKeys.courses.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 43 — `void qc.refetchQueries({ queryKey: collegeKeys.courses.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 54 — `void qc.refetchQueries({ queryKey: collegeKeys.courses.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-enrollments.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 42 — `void qc.refetchQueries({ queryKey: collegeKeys.enrollments.root(), type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 16 — `enabled: !!params && !!params.class_id && !!params.group_id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-exam-marks.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 38 — `void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 50 — `void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 61 — `void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 73 — `void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 84 — `void qc.refetchQueries({ queryKey: collegeKeys.examMarks.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-exams.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 65 — `void qc.refetchQueries({ queryKey: collegeKeys.exams.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 81 — `void qc.refetchQueries({ queryKey: collegeKeys.exams.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 92 — `void qc.refetchQueries({ queryKey: collegeKeys.exams.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-expenditure.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Query key contains object literal (stability risk)**: line 73 — `queryKey: [...collegeKeys.expenditure.root(), "recent", { limit }],`
  - **Manual refetchQueries() (storm risk)**: line 32 — `void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 44 — `void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 55 — `void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 86 — `void qc.refetchQueries({ queryKey: collegeKeys.expenditure.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-groups.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 57 — `void qc.refetchQueries({ queryKey: collegeKeys.groups.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 69 — `void qc.refetchQueries({ queryKey: collegeKeys.groups.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 80 — `void qc.refetchQueries({ queryKey: collegeKeys.groups.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-income.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Query key contains object literal (stability risk)**: line 74 — `queryKey: [...collegeKeys.income.root(), "recent", { limit }],`
  - **Manual refetchQueries() (storm risk)**: line 33 — `void qc.refetchQueries({ queryKey: collegeKeys.income.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 45 — `void qc.refetchQueries({ queryKey: collegeKeys.income.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 56 — `void qc.refetchQueries({ queryKey: collegeKeys.income.root(), type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 83 — `enabled: !!params && !!params.start_date && !!params.end_date,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-subjects.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 78 — `void qc.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 102 — `void qc.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-test-marks.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 62 — `void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 74 — `void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 85 — `void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 97 — `void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 108 — `void qc.refetchQueries({ queryKey: collegeKeys.testMarks.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-tests.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 47 — `void qc.refetchQueries({ queryKey: collegeKeys.tests.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 59 — `void qc.refetchQueries({ queryKey: collegeKeys.tests.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 70 — `void qc.refetchQueries({ queryKey: collegeKeys.tests.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-transport-balances.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Query key contains object literal (stability risk)**: line 13 — `queryKey: [...collegeKeys.transport.root(), "payment-summary", params ?? {}],`
  - **Enabled guard present (review for correctness)**: line 28 — `enabled: !!enrollment_id && enrollment_id > 0,`
  - **Enabled guard present (review for correctness)**: line 41 — `enabled: !!enrollment_id && enrollment_id > 0,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-college-tuition-balances.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 50 — `void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 62 — `void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 75 — `void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 88 — `void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 101 — `void qc.refetchQueries({ queryKey: collegeKeys.tuition.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-student-transport-assignments.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 29 — `void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 42 — `void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 54 — `void qc.refetchQueries({ queryKey: collegeKeys.studentTransport.root(), type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 11 — `enabled: !!params && !!params.class_id && !!params.group_id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-teacher-course-subjects.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 20 — `void qc.refetchQueries({ queryKey: collegeKeys.teacherCourseSubjects.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 31 — `void qc.refetchQueries({ queryKey: collegeKeys.teacherCourseSubjects.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 43 — `void qc.refetchQueries({ queryKey: collegeKeys.teacherCourseSubjects.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/use-teacher-group-subjects.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 28 — `void qc.refetchQueries({ queryKey: collegeKeys.teacherGroupSubjects.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 39 — `void qc.refetchQueries({ queryKey: collegeKeys.teacherGroupSubjects.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 51 — `void qc.refetchQueries({ queryKey: collegeKeys.teacherGroupSubjects.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/hooks/useMonthlyFeeConfig.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 51 — `enabled: true, // Always enabled to fetch on mount`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/college/services/income.service.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **responseType passed (may be wrong for fetch-based client)**: line 90 — `responseType: 'blob'`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/AnnouncementCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 31 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/AnnouncementsFilters.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 33 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/AnnouncementsList.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 56 — `onClick={() => window.location.reload()}`
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 75 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/AnnouncementsManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 13 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 69 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/AnnouncementsOverview.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 18 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/SMS/SMSManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 38 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/SMS/SMSReports.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ExcelJS import (bundle + freeze risk)**: line 14 — `import ExcelJS from "exceljs";`
  - **Framer-motion usage (perf review)**: line 12 — `import { motion } from "framer-motion";`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/Announcemnts/SMS/SMSTemplates.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 120 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/employee-management/Advance/AdvanceVoucherPrintDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 12 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 49 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/employee-management/components/EmployeeManagementHeader.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 11 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/employee-management/employee/EmployeesStatsCards.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 20 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/employee-management/Leave/LeaveViewDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Keyboard accessibility suppression (tabIndex=-1)**: line 120 — `tabIndex={-1}`
  - **ARIA label present (spot-check)**: line 119 — `aria-label="Form content"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/financial-management/components/PayrollStatsCards.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 65 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/financial-management/components/SalaryCalculationForm.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 412 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 531 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 556 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 760 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/financial-management/PayrollManagementTemplate.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 42 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/system-management/InstituteManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 236 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 461 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 486 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 493 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 574 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 691 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/transport/BusRoutesTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/transport/RouteCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 29 — `<motion.div`
  - **ARIA label present (spot-check)**: line 76 — `aria-label="Delete route"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/transport/TransportManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 114 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/transport/TransportOverview.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 20 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/components/user-management/UserManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 443 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/use-logos.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 47 — `queryClient.refetchQueries({ queryKey: ["logos"] });`
  - **Manual refetchQueries() (storm risk)**: line 69 — `queryClient.refetchQueries({ queryKey: ["logos"] });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/use-payment-receipts.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 27 — `qc.refetchQueries({ queryKey: paymentReceiptKeys.all, type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useAcademicYear.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 37 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useAdvances.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 50 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useAnnouncements.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 86 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useAuth.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Global invalidateQueries() (over-invalidation risk)**: line 209 — `void queryClient.invalidateQueries();`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useBranches.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 36 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useDistanceSlabs.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 32 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useEmployeeAttendance.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 53 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useEmployeeLeave.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 121 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 132 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 188 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 199 — `queryClient.refetchQueries({`
  - **Enabled guard present (review for correctness)**: line 55 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useEmployeeManagement.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 403 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 430 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 456 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 481 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 512 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 557 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 609 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 640 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 681 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 875 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 906 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 942 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 972 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useEmployees.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 90 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useGrades.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 39 — `enabled: !!gradeCode,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useLogs.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 38 — `enabled: !!category,`
  - **Enabled guard present (review for correctness)**: line 49 — `enabled: !!category,`
  - **Enabled guard present (review for correctness)**: line 60 — `enabled: !!query && query.length > 2,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/usePayrollManagement.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 379 — `.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 416 — `.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 447 — `.refetchQueries({`
  - **Enabled guard present (review for correctness)**: line 73 — `enabled: !!id,`
  - **Enabled guard present (review for correctness)**: line 141 — `enabled: !!selectedPayrollId,`
  - **Console logging (prod noise / potential perf)**: line 367 — `console.log("Creating payroll with data:", data);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useRoles.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 28 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useSMS.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 75 — `enabled: !!id,`
  - **Enabled guard present (review for correctness)**: line 193 — `enabled: !!requestId,`
  - **Enabled guard present (review for correctness)**: line 207 — `enabled: !!params.from_date && !!params.to_date,`
  - **Enabled guard present (review for correctness)**: line 221 — `enabled: !!params.from_date && !!params.to_date,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useTransport.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 67 — `queryClient.refetchQueries({ queryKey: transportKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 81 — `queryClient.refetchQueries({ queryKey: transportKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 94 — `queryClient.refetchQueries({ queryKey: transportKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 110 — `queryClient.refetchQueries({ queryKey: transportKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 131 — `queryClient.refetchQueries({ queryKey: transportKeys.all, type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 32 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/hooks/useUsers.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 69 — `void qc.refetchQueries({ queryKey: userKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 70 — `void qc.refetchQueries({ queryKey: userKeys.rolesAndBranches(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 85 — `void qc.refetchQueries({ queryKey: userKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 86 — `void qc.refetchQueries({ queryKey: userKeys.rolesAndBranches(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 100 — `void qc.refetchQueries({ queryKey: userKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 101 — `void qc.refetchQueries({ queryKey: userKeys.rolesAndBranches(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 116 — `void qc.refetchQueries({ queryKey: userKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 117 — `void qc.refetchQueries({ queryKey: userKeys.rolesAndBranches(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 132 — `void qc.refetchQueries({ queryKey: userKeys.all, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 133 — `void qc.refetchQueries({ queryKey: userKeys.rolesAndBranches(), type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 35 — `enabled: !!id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/pages/AuditLog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 1042 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/pages/components/settings/DataManagementTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 59 — `window.location.reload();`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/pages/components/settings/SecurityTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 11 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 95 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 133 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/pages/Login.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 3 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 178 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 190 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 203 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 218 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 249 — `<motion.form`
  - **Framer-motion usage (perf review)**: line 302 — `<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">`
  - **Framer-motion usage (perf review)**: line 312 — `<motion.form`
  - **Framer-motion usage (perf review)**: line 346 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 374 — `<motion.form`
  - **Framer-motion usage (perf review)**: line 412 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/pages/ProfilePage.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 176 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 224 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/pages/SettingsPage.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { AnimatePresence, motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 107 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 116 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 149 — `<motion.aside`
  - **Framer-motion usage (perf review)**: line 161 — `<motion.button`
  - **Framer-motion usage (perf review)**: line 205 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/general/services/payment-receipts.service.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **responseType passed (may be wrong for fetch-based client)**: line 50 — `responseType: 'blob'`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/academic/AcademicCard.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 29 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/academic/AcademicManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 62 — `enabled: true, // Always enabled for cards (minimal data)`
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 391 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/academic/AcademicOverviewCards.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 74 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/admissions/ConfirmedReservationsTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 1034 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 1042 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 1133 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 1141 — `queryClient.refetchQueries({`
  - **JSON.stringify usage (perf + key stability review)**: line 899 — `formData.append("siblings", JSON.stringify(editForm.siblings));`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/attendance/AttendanceManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 112 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 143 — `<motion.div`
  - **Console logging (prod noise / potential perf)**: line 129 — `console.log("Export attendance data");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/fees/collect-fee/CollectFee.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion, AnimatePresence } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 304 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/fees/collect-fee/CollectFeeSearch.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 487 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/fees/FeesManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 48 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/fees/transport-fee-balance/TransportFeeBalancesPanel.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 72 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/fees/tution-fee-balance/StudentFeeBalancesTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 190 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/fees/tution-fee-balance/TuitionFeeBalancesPanel.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 207 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/AddMarksByClassDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 117 — `const { data: examsData } = useSchoolExams({ enabled: true });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/AddTestMarksByClassDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 117 — `const { data: testsData } = useSchoolTests({ enabled: true });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/CompleteMarksEntry.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 101 — `const { data: examsData } = useSchoolExams({ enabled: true });`
  - **JSON.stringify usage (perf + key stability review)**: line 82 — `sessionStorage.setItem(storageKey, JSON.stringify(marksData));`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/CompleteMarksTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 101 — `const { data: examsData } = useSchoolExams({ enabled: true });`
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 287 — `<motion.div`
  - **JSON.stringify usage (perf + key stability review)**: line 82 — `sessionStorage.setItem(storageKey, JSON.stringify(marksData));`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/components/ExamMarksReport.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 175 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 264 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 334 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/components/StudentPerformanceView.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 208 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 260 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 279 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 298 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 336 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/components/TestMarksReport.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 171 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 260 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 329 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/ExamMarksManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 770 — `void queryClient.refetchQueries({`
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 479 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/MarksManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 278 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 303 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/marks/TestMarksManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 1505 — `void queryClient.refetchQueries({`
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 639 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 1203 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/ExpenditureTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 282 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/FinanceReportDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from 'framer-motion';`
  - **Framer-motion usage (perf review)**: line 173 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/IncomeSummaryTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 136 — `enabled: !!viewIncomeId,`
  - **Framer-motion usage (perf review)**: line 3 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 300 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/SchoolFinanceReportButtons.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 117 — `aria-label="Generate daily finance report"`
  - **ARIA label present (spot-check)**: line 133 — `aria-label="Generate custom date range finance report"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/SchoolFinancialAnalytics.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 134 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 161 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 188 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 219 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 255 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 291 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 318 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 358 — `<motion.div`
  - **Framer-motion usage (perf review)**: line 387 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/ViewExpenditureDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 104 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/components/ViewIncomeDialog.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 104 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reports/SchoolReportsTemplate.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 2 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 79 — `<motion.div`
  - **Console logging (prod noise / potential perf)**: line 71 — `console.log("Exporting report...");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reservations/ReservationManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 11 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 133 — `<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reservations/ReservationsTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 349 — `<SelectTrigger aria-label="Filter by status">`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/reservations/StatusUpdateTable.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 94 — `<SelectTrigger aria-label="Select status" disabled={isConfirmed}>`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/students/PromotionDropoutTab.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **ARIA label present (spot-check)**: line 135 — `aria-label="Select all students"`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/components/students/StudentManagement.tsx`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Framer-motion usage (perf review)**: line 1 — `import { motion } from "framer-motion";`
  - **Framer-motion usage (perf review)**: line 107 — `<motion.div`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-admissions.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 29 — `enabled: !!student_id,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-attendance.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 37 — `void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 48 — `void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 60 — `void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 71 — `void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 104 — `void qc.refetchQueries({ queryKey: schoolKeys.attendance.root(), type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 89 — `enabled: !!params && typeof params.class_id === 'number' && params.class_id > 0 && typeof params.month === 'number' && typeof params.year === 'number',`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-class-subjects.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 28 — `qc.refetchQueries({ queryKey: schoolKeys.classSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 29 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-class.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 17 — `enabled: !!classId,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-classes.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 29 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 47 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 95 — `qc.refetchQueries({ queryKey: schoolKeys.classSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 96 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-enrollments.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 54 — `void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 93 — `void qc.refetchQueries({ queryKey: schoolKeys.enrollments.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 95 — `void qc.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-exam-marks.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 36 — `void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 48 — `void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 59 — `void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 70 — `void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 81 — `void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 92 — `void qc.refetchQueries({ queryKey: schoolKeys.examMarks.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-exams-tests.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 74 — `qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 87 — `qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 99 — `qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 126 — `qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 139 — `qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 152 — `qc.refetchQueries({ queryKey: schoolKeys.exams.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 165 — `qc.refetchQueries({ queryKey: schoolKeys.tests.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 178 — `qc.refetchQueries({ queryKey: schoolKeys.tests.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 190 — `qc.refetchQueries({ queryKey: schoolKeys.tests.root(), type: 'active' }).catch(console.error);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-fee-balances.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 15 — `enabled: !!params?.class_id && params.class_id > 0,`
  - **Enabled guard present (review for correctness)**: line 165 — `enabled: !!params?.class_id && params.class_id > 0,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-income-expenditure.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Query key contains object literal (stability risk)**: line 40 — `queryKey: [...schoolKeys.income.root(), "recent", { limit }],`
  - **Query key contains object literal (stability risk)**: line 58 — `queryKey: [...schoolKeys.expenditure.root(), "recent", { limit }],`
  - **Manual refetchQueries() (storm risk)**: line 70 — `void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 81 — `void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 93 — `void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 104 — `void qc.refetchQueries({ queryKey: schoolKeys.income.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 136 — `void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 148 — `void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 159 — `void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 172 — `void qc.refetchQueries({ queryKey: schoolKeys.expenditure.root(), type: 'active' });`
  - **Enabled guard present (review for correctness)**: line 181 — `enabled: !!params && !!params.start_date && !!params.end_date,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-sections.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 26 — `qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 40 — `qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 53 — `qc.refetchQueries({ queryKey: schoolKeys.sections.listByClass(classId), type: 'active' }).catch(console.error);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-student-transport.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 27 — `void qc.refetchQueries({ queryKey: keys.root, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 47 — `void qc.refetchQueries({ queryKey: keys.root, type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 59 — `void qc.refetchQueries({ queryKey: keys.root, type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-subjects.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 32 — `qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 54 — `qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 55 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 71 — `qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 72 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 73 — `qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 106 — `qc.refetchQueries({ queryKey: schoolKeys.subjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 107 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-school-test-marks.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 35 — `void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 47 — `void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 58 — `void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 69 — `void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 80 — `void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 91 — `void qc.refetchQueries({ queryKey: schoolKeys.testMarks.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/features/school/hooks/use-teacher-class-subjects.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 42 — `qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 43 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 61 — `qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 62 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 74 — `qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 75 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 87 — `qc.refetchQueries({ queryKey: schoolKeys.teacherClassSubjects.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 88 — `qc.refetchQueries({ queryKey: schoolKeys.classes.root(), type: 'active' }).catch(console.error);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `client/src/store/cacheStore.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 166 — `state.stats.totalSize = entries.reduce((total: number, entry: CacheEntry) => total + JSON.stringify(entry.data).length, 0);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/API_CALLS_TAB_NAVIGATION_SUMMARY.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 185 — `enabled: true, // Always enabled for cards`
  - **Enabled guard present (review for correctness)**: line 189 — `enabled: true, // Always enabled for cards`
  - **Enabled guard present (review for correctness)**: line 342 — `enabled: true, // Always enabled`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/ARCHITECTURE_FIXES_IMPLEMENTED.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Custom token refresh implementation**: line 109 — `- ✅ Enhanced `tryRefreshToken()` with minimum interval check`
  - **Global invalidateQueries() (over-invalidation risk)**: line 142 — `- ✅ Changed `queryClient.clear()` to `queryClient.invalidateQueries()` on login`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/AUTHENTICATION_ARCHITECTURE.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Token persisted to storage (security)**: line 345 — `localStorage.setItem("access_token", token); // SECURITY RISK!`
  - **Token persisted to storage (security)**: line 873 — `localStorage.setItem("access_token", token);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/AUTHENTICATION_AUDIT_REPORT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Token persisted to storage (security)**: line 169 — `- [x] No `localStorage.setItem("access_token")` found`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/AUTHENTICATION_HARDENING_REPORT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 248 — `window.location.href = "/login";`
  - **Axios interceptor present (refresh/cancel complexity)**: line 127 — `apiClient.interceptors.response.use(`
  - **Axios interceptor present (refresh/cancel complexity)**: line 167 — `apiClient.interceptors.request.use(`
  - **Custom token refresh implementation**: line 154 — `- `client/src/lib/api/api.ts` - `refreshAccessToken()` function`
  - **Custom token refresh implementation**: line 252 — `// Remove duplicate redirect from refreshAccessToken`
  - **Custom token refresh implementation**: line 259 — `- `client/src/lib/api/api.ts` - Removed duplicate redirect from refreshAccessToken`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/CACHING_EXPLANATION.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 50 — `│    queryClient.refetchQueries({ key: students })                │`
  - **Manual refetchQueries() (storm risk)**: line 111 — `│    queryClient.refetchQueries({ queryKey, type: 'active' })    │`
  - **Manual refetchQueries() (storm risk)**: line 162 — `.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 242 — `queryClient.refetchQueries({ queryKey });`
  - **Manual refetchQueries() (storm risk)**: line 245 — `queryClient.refetchQueries({ queryKey, type: "active" });`
  - **Manual refetchQueries() (storm risk)**: line 272 — `await queryClient.refetchQueries({ queryKey: ["students"] });`
  - **Manual refetchQueries() (storm risk)**: line 273 — `await queryClient.refetchQueries({ queryKey: ["fees"] });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/COMPLETE_FIXES_APPLIED.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 117 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/COMPREHENSIVE_PROJECT_AUDIT_REPORT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 249 — `console.log("🔐 Login API response:", { /* user data */ });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/CRITICAL_ISSUES_REPORT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 30 — `queryClient.refetchQueries({ queryKey: schoolKeys.students.root() });`
  - **Manual refetchQueries() (storm risk)**: line 31 — `queryClient.refetchQueries({ queryKey: schoolKeys.enrollments.root() });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/DEEP_ARCHITECTURE_AUDIT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Custom token refresh implementation**: line 265 — `async function tryRefreshToken(`
  - **Custom token refresh implementation**: line 294 — `async function tryRefreshToken(`
  - **Manual refetchQueries() (storm risk)**: line 407 — `queryClient.refetchQueries({ type: "active" });`
  - **Manual refetchQueries() (storm risk)**: line 455 — `queryClient.refetchQueries({`
  - **Enabled guard present (review for correctness)**: line 232 — `enabled: !!id,`
  - **JSON.stringify usage (perf + key stability review)**: line 380 — `return JSON.stringify(parsed);`
  - **JSON.stringify usage (perf + key stability review)**: line 390 — `localStorage.setItem(name, JSON.stringify(parsed));`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/EMPLOYEE_MODULE_DEEP_AUDIT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 37 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 146 — `queryClient.refetchQueries({...});`
  - **Manual refetchQueries() (storm risk)**: line 157 — `queryClient.refetchQueries({...});`
  - **Manual refetchQueries() (storm risk)**: line 164 — `queryClient.refetchQueries({...});`
  - **Manual refetchQueries() (storm risk)**: line 218 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 229 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/EMPLOYEE_MODULE_FIXES_VERIFICATION.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 36 — `queryClient.refetchQueries({...});`
  - **Manual refetchQueries() (storm risk)**: line 43 — `queryClient.refetchQueries({...});`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/ENV_VARIABLES_FLOW.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 172 — `console.log("Logo path:", import.meta.env.VITE_LOGO_SCHOOL);`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/FINAL_VALIDATION_REPORT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Global invalidateQueries() (over-invalidation risk)**: line 124 — `- ✅ `client/src/lib/hooks/general/useAuth.ts` - Uses `invalidateQueries()` on login ✅`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/LEAVE_APPROVAL_COMPLETE_REDESIGN.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 73 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/LOADING_AND_PERFORMANCE_ISSUES.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Query key contains object literal (stability risk)**: line 375 — `queryKey: ['students', { page: 1, pageSize: 50 }]`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/LOGOUT_REQUEST_ANALYSIS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Hard navigation/remount risk**: line 38 — `T9: Redirect happens (window.location.href = "/login")`
  - **Hard navigation/remount risk**: line 112 — `window.location.href = "/login"; // 1500ms delay`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/main_ui_updated.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Custom token refresh implementation**: line 435 — `await tryRefreshToken(token);`
  - **Custom token refresh implementation**: line 451 — `const refreshed = await tryRefreshToken(token);`
  - **JSON.stringify usage (perf + key stability review)**: line 399 — `body: options.body ? JSON.stringify(options.body) : undefined,`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/MODULE_WISE_ANALYSIS_AND_SOLUTIONS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 138 — `queryClient.refetchQueries({ queryKey: schoolKeys.reservations.root() });`
  - **Manual refetchQueries() (storm risk)**: line 198 — `await queryClient.refetchQueries({ queryKey: schoolKeys.enrollments.root() });`
  - **JSON.stringify usage (perf + key stability review)**: line 836 — `pendingInvalidations.add(JSON.stringify(key));`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/PRODUCTION_GUIDE.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Console logging (prod noise / potential perf)**: line 220 — `console.log(stats); // { totalEntries: 10, hitRate: 0.8, ... }`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/PROJECT_COMPREHENSIVE_ANALYSIS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Global invalidateQueries() (over-invalidation risk)**: line 317 — `**Pattern:** Direct `invalidateQueries()` call`
  - **Global invalidateQueries() (over-invalidation risk)**: line 416 — `- **Cache invalidation**: Simple `invalidateQueries()` call`
  - **Global invalidateQueries() (over-invalidation risk)**: line 599 — `- On success, `invalidateQueries()` marks cache as stale`
  - **Global invalidateQueries() (over-invalidation risk)**: line 624 — `- Simple `invalidateQueries()` call - no debouncing needed`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/STUDENT_UPDATE_TABLE_REFRESH_ISSUE_ANALYSIS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 19 — `- The mutation uses `refetchQueries({ queryKey: schoolKeys.students.root(), type: 'active' })` which might not match the list query key`
  - **Manual refetchQueries() (storm risk)**: line 29 — `void qc.refetchQueries({ queryKey: schoolKeys.students.root(), type: 'active' });`
  - **Manual refetchQueries() (storm risk)**: line 149 — `void qc.refetchQueries({ queryKey: schoolKeys.students.root(), type: 'active' });`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/TAB_ON_DEMAND_OPTIMIZATION_SUMMARY.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Enabled guard present (review for correctness)**: line 172 — `enabled: !!attendanceParams && isTabActive, // ✅ Gate by tab active state`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/TABLE_REFRESH_ISSUES_ANALYSIS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Global invalidateQueries() (over-invalidation risk)**: line 39 — `- `invalidateQueries()` is called without explicitly setting `exact: false``
  - **Manual refetchQueries() (storm risk)**: line 25 — `void queryClient.refetchQueries({ queryKey, type: "active" });`
  - **Manual refetchQueries() (storm risk)**: line 70 — `- `refetchQueries()` only refetches queries with `type: 'active'``
  - **Manual refetchQueries() (storm risk)**: line 79 — `void queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 176 — `void queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 205 — `void queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 224 — `void queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 234 — `void queryClient.refetchQueries({`
  - **JSON.stringify usage (perf + key stability review)**: line 266 — `JSON.stringify(data[0] || {})`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/UI_FREEZE_ACTIONABLE_AUDIT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 153 — `222|        queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 180 — `queryClient.refetchQueries({`
  - **Manual refetchQueries() (storm risk)**: line 719 — `queryClient.refetchQueries({`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/UI_FREEZE_COMPREHENSIVE_AUDIT.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 543 — `queryClient.refetchQueries({...});`
  - **Manual refetchQueries() (storm risk)**: line 560 — `queryClient.refetchQueries({...});`
  - **Console logging (prod noise / potential perf)**: line 892 — `console.log("🔍 UI Freeze Analysis - Static Checks\n");`
  - **Console logging (prod noise / potential perf)**: line 893 — `console.log("======================================\n");`
  - **Console logging (prod noise / potential perf)**: line 906 — `console.log(`${name}: ${count} matches`);`
  - **Console logging (prod noise / potential perf)**: line 908 — `console.log(`${name}: 0 matches (or error)`);`
  - **Console logging (prod noise / potential perf)**: line 912 — `console.log("\n✅ Analysis complete!");`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/UI_FREEZE_DIAGNOSIS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 163 — `qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);`
  - **Manual refetchQueries() (storm risk)**: line 338 — `qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);`
  - **JSON.stringify usage (perf + key stability review)**: line 114 — `return JSON.stringify(`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/UI_FREEZE_FIX_PRIORITY.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 66 — `listener.subscribe("test", JSON.stringify(["test", i]));`
  - **Console logging (prod noise / potential perf)**: line 73 — `console.log(`Time: ${end - start}ms`); // Should be < 50ms`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/UI_FREEZE_FIXES_APPLIED.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Manual refetchQueries() (storm risk)**: line 91 — `queryClient.refetchQueries({...});`
  - **Manual refetchQueries() (storm risk)**: line 106 — `queryClient.refetchQueries({...});`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `docs/UI_FREEZING_ISSUES_ANALYSIS.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Global invalidateQueries() (over-invalidation risk)**: line 93 — `// 1. queryClient.invalidateQueries() - Synchronous`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `SMS_INTEGRATION_GUIDE.md`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Select without aria-label (a11y risk)**: line 930 — `<select name="template_key" id="template-select">`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `tools/final-audit.mjs`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **Logout restore-prevention flag usage**: line 94 — `...matchRegex(lines, /__logout_initiated__/i, "Logout restore-prevention flag usage")`
  - **Global invalidateQueries() (over-invalidation risk)**: line 111 — `...matchRegex(lines, /\binvalidateQueries\(\s*\)/, "Global invalidateQueries() (over-invalidation risk)")`
  - **Manual refetchQueries() (storm risk)**: line 114 — `...matchRegex(lines, /\brefetchQueries\(/, "Manual refetchQueries() (storm risk)")`
  - **JSON.stringify usage (perf + key stability review)**: line 333 — `JSON.stringify(`
  - **Select without aria-label (a11y risk)**: line 144 — `...matchRegex(lines, /<select\b(?![^>]*aria-label)/, "Select without aria-label (a11y risk)")`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `vite.config.ts`

- **Verdict**: **PROBLEMATIC**
- **Evidence**:
  - **JSON.stringify usage (perf + key stability review)**: line 22 — `__BUILD_DATE__: JSON.stringify(buildDate),`

- **Safest fix direction**:
  - Address the matched pattern; prefer single-source-of-truth abstractions and deterministic behavior.

### `.env.development`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `.gitignore`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `.prettierignore`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `.prettierrc`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/.env.development`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/.env.production`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/docs/API_ENDPOINTS_FOR_BACKEND_PERMISSIONS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/docs/COLLEGE_API.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/docs/dashboard-api-requirements.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/docs/PUBLIC_API.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/docs/SCHOOL_API.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/index.html`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/app/App.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/app/index.css`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/app/main.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/layout/Footer.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/layout/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/layout/ThemeProvider.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/layout/ThemeToggle.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/BundleMonitor.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/ConcessionUpdateDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/ConcessionUpdateModal.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/ConfirmDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardChart.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardCharts.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardContainer.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardError.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardFilters.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardGrid.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardHeader.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardQuickActions.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/DashboardRecentActivity.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/dashboard/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/BaseDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/ClassDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/CourseDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/ExamDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/GroupDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/SubjectDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/College/TestDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/README.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/ClassDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/ExamDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/SectionDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/SubjectDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/TeacherDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/School/TestDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/Shared/BusRouteDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/Shared/DistanceSlabDropdown.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/Dropdowns/Shared/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/ExportProgressDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/IdleTimeoutWarningDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/IndianRupeeIcon.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/LazyLoadingWrapper.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/MonthYearFilter.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/OptimizedComponent.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/config/PaymentConfig.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/hooks/useMultiplePayment.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/multiple-payment/components/BookFeeComponent.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/multiple-payment/components/TransportFeeComponent.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/multiple-payment/components/TuitionFeeComponent.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/multiple-payment/PurposeSelectionModal.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/types/PaymentTypes.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/utils/paymentUtils.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/payment/validation/PaymentValidation.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/ProductionApp.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/reservations/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/reservations/ReservationDeleteDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/SEOHead.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/shared/TabSwitcher.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/accordion.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/alert-dialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/alert.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/aspect-ratio.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/avatar.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/button.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/card.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/carousel.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/chart.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/checkbox.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/collapsible.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/command.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/context-menu.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/drawer.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/dropdown-menu.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/employee-select.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/form.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/hover-card.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/input-otp.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/label.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/loading-indicator.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/loading.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/menubar.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/navigation-menu.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/popover.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/progress.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/radio-group.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/resizable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/scroll-area.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/select.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/separator.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/sheet.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/slider.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/switch.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/table.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/tabs.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/textarea.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/TOAST_USAGE_EXAMPLES.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/toast.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/toaster.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/toggle-group.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/toggle.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/components/ui/tooltip.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/api/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/api/query-keys.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/auth/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/auth/roles.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/ui/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/constants/ui/ui.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/branch-dependent-keys.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/invalidation-maps.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/use-tab-navigation.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/use-toast.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useAuthHydration.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useCRUD.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useDebounce.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useDocumentTitle.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useFavicon.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useFormState.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useGlobalSearch.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useLoading.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useNetworkStatus.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useOptimizedState.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useSearchFilters.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useTableFilters.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useTablePagination.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useTableState.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/hooks/useTokenManagement.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/react-utils.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/types/api.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/accessibility/accessibility-enhancements.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/accessibility/accessibility.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/accessibility/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/auth/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/auth/jwt.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/export/advance-voucher-pdf.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/export/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/export/teacher-assignments-export.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/export/useExcelExport.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/factory/columnFactories.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/factory/dashboardFactory.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/factory/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/factory/statsHelpers.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/favicon.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/formatting/currency.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/formatting/date.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/formatting/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/formatting/numbers.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/navigation/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/navigation/urlMapping.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/payment/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/payment/paymentHelpers.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/performance/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/performance/preloader.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/query/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/query/refetchListener.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/roles.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/security/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/common/utils/security/sanitization.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/contexts/LoadingContext.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/api/request-cancellation.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/auth/authState.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/auth/permissions.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/auth/types.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/config`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/permissions/config.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/permissions/hooks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/permissions/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/permissions/README.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/permissions/types.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/core/permissions/utils.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/academic-years/AcademicYearManagement.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/classes/ClassesTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/courses/AddCoursesDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/courses/CoursesTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/exams/ExamsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/groups/GroupsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/subjects/SubjectsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/teachers/TeacherCourseSubjectAssignmentsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/teachers/TeachersTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/academic/tests/TestTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/admissions/AdmissionsList.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/attendance/AttendanceCreate.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/config/MonthlyFeeConfigTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/expenditure/CollegeExpenditureStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/fees/multiple-payment/CollegeMultiplePaymentForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/income/CollegeIncomeStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/marks/components/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/marks/components/StudentMarksSearchView.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/marks/components/StudentPerformanceSearchView.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/reports/components/AddExpenditureDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/reservations/AllReservationsComponent.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/reservations/CollegeReservationEdit.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/reservations/CollegeReservationStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/reservations/ReservationForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/enrollments/EnrollmentCreateDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/enrollments/EnrollmentEditDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/enrollments/EnrollmentSearchForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/enrollments/EnrollmentViewDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/enrollments/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/EnrollmentsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/StudentsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/transport/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/transport/TransportCreateDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/transport/TransportEditDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/transport/TransportSearchForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/transport/TransportViewDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/students/TransportTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/components/tuition-fee-balances/CollegeTuitionFeeBalanceStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/query-keys.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-college-dropdowns.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-college-fees-management.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-college-marks-statistics.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-college-promotion.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-college-reservations.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-college-students.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/hooks/use-student-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeAcademicPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeAdmissionsPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeAttendancePage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeClassesPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeFeesPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeMarksPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeReportsPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeReservationPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/pages/CollegeStudentsPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/admissions.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/attendance.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/classes.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/courses.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/dropdowns.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/enrollments.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/exam-marks.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/exams.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/expenditure.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/groups.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/monthly-fee-config.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/reservations.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/student-marks.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/student-transport-assignments.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/students.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/subjects.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/teacher-course-subjects.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/teacher-group-subjects.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/test-marks.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/tests.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/transport-fee-balances.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/services/tuition-fee-balances.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/academic-year.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/admissions.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/attendance.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/class-groups.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/classes.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/college.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/courses.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/dropdowns.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/enrollments.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/exam-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/exams.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/expenditure.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/full-student-view.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/group-subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/groups.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/income.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/monthly-fee-config.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/promotion.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/reservations.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/student-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/students.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/teacher-course-subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/teacher-group-subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/test-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/tests.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/transport-assignments.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/transport-fee-balances.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/tuition-fee-balances.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/college/types/tuition-fee-structures.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/Announcemnts/AnnouncementDetailsDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/Announcemnts/AnnouncementFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/Announcemnts/SMS/SMSBulkAnnouncement.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/Announcemnts/SMS/SMSConfig.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/configurations/LogoManagementTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/dashboard/AcademicSummary.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/dashboard/AuditLogSummary.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/dashboard/DashboardOverview.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/dashboard/EnrollmentStats.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/dashboard/FinancialSummary.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/dashboard/IncomeChart.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvanceAmountDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvanceDeleteDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvanceFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvancesTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvanceStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvanceStatusDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Advance/AdvanceViewDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Attendance/AttendanceBulkCreateDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Attendance/AttendanceDeleteDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Attendance/AttendanceFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Attendance/AttendanceStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Attendance/AttendanceViewDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/components/AttendanceTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/components/EmployeeManagementDialogs.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/components/EmployeeManagementTabs.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/components/EmployeeTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/components/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/components/LeavesTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeAdvancesList.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeAttendanceList.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeDeleteDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeDetailDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeLeavesList.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeesTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeesTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/EmployeeStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/employee/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Leave/LeaveApproveDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Leave/LeaveFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Leave/LeaveRejectDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/Leave/LeaveStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/templates/EmployeeManagementTemplate.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/employee-management/templates/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/financial-management/components/EditPayrollForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/financial-management/components/EmployeePayrollTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/financial-management/PayrollStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/grades/GradeFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/grades/GradesTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/system-management/BranchesManagement.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/system-management/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/transport/AssignDriverDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/transport/DistanceSlabFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/transport/DistanceSlabsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/transport/RouteDetailsDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/transport/RouteFormDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/components/user-management/UserStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useAcademicDashboard.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useAccountantDashboard.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useAdminDashboard.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useAdminDashboardData.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useAuditLogs.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useAuthActions.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useDropdowns.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/hooks/useHealth.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/AcademicDashboard.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/AccountantDashboard.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/AdminDashboard.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/AnnouncementPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/components/settings/AboutTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/components/settings/ConfigurationTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/components/settings/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/components/settings/ProfileSettingsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/EmployeeManagementPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/not-found.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/PayrollManagementPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/TransportManagementPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/pages/UserManagementPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/academic-year.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/advances.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/announcements.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/attendance.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/audit-logs.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/auth.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/branches.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/dashboard.service.example.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/dashboard.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/distance-slabs.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/dropdowns.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/employee-attendance.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/employee-leave.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/employees.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/global-search.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/grades.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/health.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/logos.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/logs.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/payrolls.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/roles.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/sms.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/transport.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/unified-api.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/userBranchAccess.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/services/users.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/academic-year.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/advances.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/attendance.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/audit-logs.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/branches.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/dashboards.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/distance-slabs.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/dropdowns.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/employee-attendance.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/employee-leave.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/employees.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/grades.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/health.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/logos.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/logs.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/payrolls.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/roles.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/transport.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/userBranchAccess.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/general/types/users.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/academic-years/AcademicYearManagement.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/classes/AddClassDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/classes/ClassesTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/exams/AddExamDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/exams/ExamScheduleDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/exams/ExamsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/sections/AddSectionDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/sections/SectionsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/subjects/AddSubjectDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/subjects/SubjectsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/teachers/ClassTeacherTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/teachers/TeacherAssignmentsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/teachers/TeachersTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/academic/tests/TestTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/admissions/AdmissionsList.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/attendance/AttendanceCreate.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/attendance/AttendanceView.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/expenditure/SchoolExpenditureStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/fees/multiple-payment/SchoolMultiplePaymentForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/fees/transport-fee-balance/SchoolTransportFeeBalanceStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/fees/tution-fee-balance/SchoolTuitionFeeBalanceStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/income/SchoolIncomeStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/marks/AddExamMarkForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/marks/components/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/marks/components/StudentMarksSearchView.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/marks/components/StudentMarksView.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/marks/components/StudentPerformanceSearchView.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/reports/components/AddExpenditureDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/reservations/AllReservationsTable.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/reservations/ReservationForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/reservations/SchoolReservationEdit.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/reservations/SchoolReservationStatsCards.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/enrollments/EnrollmentCreateDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/enrollments/EnrollmentEditDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/enrollments/EnrollmentSearchForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/enrollments/EnrollmentViewDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/enrollments/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/EnrollmentsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/SectionMappingTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/StudentsTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/transport/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/transport/TransportCreateDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/transport/TransportEditDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/transport/TransportSearchForm.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/transport/TransportViewDialog.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/components/students/TransportTab.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/query-keys.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-marks-statistics.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-school-dropdowns.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-school-fees-management.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-school-promotion.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-school-reservations.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-school-students.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/hooks/use-student-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolAcademicPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolAdmissionsPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolAttendancePage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolFeesPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolMarksPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolReportsPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolReservationPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/pages/SchoolStudentsPage.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/admissions.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/class-subjects.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/classes.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/dropdowns.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/enrollments.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/exam-marks.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/exams.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/expenditure.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/income.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/reservations.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/sections.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/student-attendance.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/student-marks.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/student-transport.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/students.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/subjects.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/teacher-class-subjects.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/test-marks.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/tests.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/transport-fee-balances.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/transport.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/tuition-fee-balances.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/services/tuition-fee-structures.service.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/admissions.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/attendance.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/class-subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/classes.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/dropdowns.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/enrollments.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/exam-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/exams.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/expenditure.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/full-student-view.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/income.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/promotion.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/reservations.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/school.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/sections.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/student-transport-assignments.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/students.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/teacher-class-subjects.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/test-marks.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/tests.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/transport-fee-balances.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/transport.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/tuition-fee-balances.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/features/school/types/tuition-fee-structure.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/lib/config/assets.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/lib/config/brand.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/lib/config/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/AppRouter.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/AuthenticatedLayout.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/DashboardRouter.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/NotAuthorized.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/ProtectedRoute.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/RedirectToDashboard.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/routes/route-config.tsx`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/store/index.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/store/navigationStore.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/store/uiStore.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `client/src/vite-env.d.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `components.json`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ACTION_ITEMS_CHECKLIST.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/advance_and_payroll.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/AKSHARA_DEPLOYMENT_STEPS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/AKSHARA_ENV_CONFIG.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ALL_ISSUES_FIX_PLAN.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ALL_ISSUES_FIXED_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ALL_ISSUES_STATUS_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ALL_MODULES_FIX_COMPLETE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/API.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ASSET_CONFIGURATION_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ASSET_CONFIGURATION.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/attendance.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/AUDIT_SUMMARY_QUICK_REFERENCE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/AUTH_IMPLEMENTATION.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/BACKEND_REQUIREMENTS_AUDIT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/CLIENT_REQUIREMENTS_ANALYSIS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/college_academic.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/COMPONENTS_OVERVIEW.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/COMPREHENSIVE_DEEP_AUDIT_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/COMPREHENSIVE_PROJECT_ANALYSIS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/DEAD_CODE_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/DEPLOYMENT_GUIDE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/dropdowns.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/EMPLOYEE_DASHBOARD_LAZY_LOADING_FIX.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/employee_mangement.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/enrollments.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ENV_FILES_GUIDE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ERR_NETWORK_CHANGED_EXPLANATION.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/EXCEL_EXPORT_ENHANCEMENTS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/EXCEL_EXPORT_USAGE_LOCATIONS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/fees.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FINAL_STATUS_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/finance.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FIX_ENV_LOADING.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FIXES_APPLIED_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FIXES_COMPLETED_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FIXES_IMPLEMENTATION_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FIXES_PROGRESS_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FRONTEND_IMPLEMENTATION_STATUS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/FRONTEND_RATING.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/GENERAL_MODULES_DEEP_AUDIT_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/GENERAL_MODULES_FIX_COMPLETE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/GENERAL_MODULES_FIXES_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/IMPORT_FIXES_COMPLETE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/IMPROVEMENTS_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/LEAVE_APPROVAL_PERMANENT_SOLUTION.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/LEAVE_APPROVAL_UI_FREEZE_DEEP_AUDIT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/LEAVE_APPROVAL_UI_FREEZE_FIX.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/marks.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/MODAL_UI_FREEZING_AUDIT_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/MULTI_BRAND_DEPLOYMENT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/PERFORMANCE_ANALYSIS_COMPREHENSIVE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/PHASE_3_IMPLEMENTATION_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/PROJECT_AUDIT_REPORT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/PROJECT_ISSUES_COMPREHENSIVE_ANALYSIS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/QUERY_OPTIMIZATION_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/QUICK_START.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/REMAINING_ISSUES_AND_STATUS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/RESERVATION_PAYMENT_FREEZE_FIX_SUMMARY.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/RESERVATION_PAYMENT_UI_FREEZE_AUDIT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/RESERVATIONS_ADMISSIONS_ANALYSIS.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/reservations.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ROLE_ACADEMIC.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ROLE_ACCOUNTANT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/ROLE_ADMIN.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/school_academic.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/students.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/studenttransport.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/transports.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/UI_FREEZE_QUICK_REFERENCE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/UI_FREEZING_FIXES_APPLIED.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/user_and_branch.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/USER_GUIDE_01_OVERVIEW.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/USER_GUIDE_02_SCHOOL.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/USER_GUIDE_03_COLLEGE.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/USER_GUIDE_04_GENERAL.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `docs/WHAT_NEXT.md`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `env.akshara.development`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `env.akshara.production`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `env.template`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `env.velonex.development`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `env.velonex.production`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `eslint.config.js`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `package-lock.json`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `package.json`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `postcss.config.js`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `tailwind.config.ts`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `tsconfig.json`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.

### `vercel.json`

- **Verdict**: **CLEAN**
- **Evidence**: No matches for the configured zero-tolerance checks.
