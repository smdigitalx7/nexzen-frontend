# Attendance Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

General sidebar entries “School / Attendance” → `/school/attendance` and “College / Attendance” → `/college/attendance`. Tab-level access, robust Axios error handling, Zustand stores, grouped/monthly views (school) and paginated views (college), plus single and bulk operations.

## Tab-level Access Control

- School Attendance
  - Visible: All authenticated users
  - Actions: Create/Update/Delete/Bulk Create/Bulk Update
- College Attendance
  - Visible: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
  - Actions: Create/Update/Delete/Bulk Create

## API Endpoints and Responses (Base: `/api/v1`)

### School Attendance (@student_attendance_router.py)

- GET `/school/student-attendance/students`
  - Query: `class_id` (required), `section_id?`, `month?`, `year?`, `page?`, `page_size?` (month/year must be provided together)
  - 200: `StudentAttendanceMonthlyGroupedResponse`
  - **UI Flow**: Loads grouped attendance data on School Attendance page. Filters bar has ClassDropdown (required), SectionDropdown (optional), Month/Year dropdowns (must be paired), pagination controls. Data displayed as collapsible month groups with student rows. Each student row shows: admission_no, roll_number, student_name, section_name, total_working_days, present_days, absent_days, remarks. Row actions: "View", "Edit", "Delete". Loading skeleton during fetch, empty state with "Bulk Create" CTA.
- GET `/school/student-attendance/{attendance_id}`
  - 200: `StudentAttendanceRead`
  - **UI Flow**: Opens AttendanceDetailModal with full attendance information. Modal shows attendance details, student info, and attendance breakdown. "Edit" and "Delete" buttons in header. Loading spinner during fetch, error state with retry.
- POST `/school/student-attendance`
  - Body: `StudentAttendanceCreate` → `{ enrollment_id, attendance_month(YYYY-MM-01), total_working_days, present_days, absent_days, remarks? }`
  - 200: `StudentAttendanceRead`
  - **UI Flow**: "Create Attendance" button opens AttendanceCreateModal. Form has dropdown for enrollment_id (StudentDropdown), required fields (attendance_month, total_working_days, present_days, absent_days) and optional remarks field. Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + list refresh.
- POST `/school/student-attendance/bulk-create`
  - Body: `BulkStudentAttendanceCreate` → `{ attendance_month, total_working_days, class_id, section_id?, academic_year_id? }`
  - 200: `BulkCreateResult`
  - **UI Flow**: "Bulk Create" button opens BulkCreateModal. Form has ClassDropdown (required), SectionDropdown (optional), Month/Year dropdowns, total_working_days field. Submit shows loading spinner. Success shows created_count and skipped_enrollment_ids, refreshes current view. Error shows error message in modal.
- PUT `/school/student-attendance/bulk-update`
  - Body: `{ class_id, attendance_month, attendance_data: ClassAttendanceUpdateItem[] }`
  - 200: `{ message, updated_count, class_id, attendance_month }`
  - **UI Flow**: "Bulk Update" button opens BulkUpdateModal after selecting class and month. Loads students with current attendance values in editable table. Each row has present_days, absent_days, remarks fields. Submit shows loading spinner. Success shows updated_count and confirmation message, refreshes view.
- PUT `/school/student-attendance/{attendance_id}`
  - Body: `StudentAttendanceUpdate` (optional fields)
  - 200: `StudentAttendanceRead`
  - **UI Flow**: AttendanceEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes grouped list. Optimistic update shows new values immediately.
- DELETE `/school/student-attendance/{attendance_id}`
  - 200: `{ message, deleted }`
  - **UI Flow**: Delete confirmation dialog with student name and attendance month. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from grouped list, shows success toast. Error shows error message in dialog.

Response models (School):

- `StudentAttendanceRead`:
  - `{ attendance_id, enrollment_id, attendance_month?, admission_no, roll_number, student_name, section_name, total_working_days?, present_days?, absent_days?, remarks? }`
- `StudentAttendanceMonthlyGroupedResponse`:
  - `{ groups: [{ month_name, data: StudentAttendanceRead[] }], total_pages?, current_page?, page_size?, total_count? }`
- `BulkCreateResult`:
  - `{ created_count, skipped_enrollment_ids: number[], total_requested }`

### College Attendance (@student_attendance_router.py)

- GET `/college/student-attendance`
  - Query: `class_id` (required), `group_id` (required), `page?`, `pageSize?`, `year?`, `month?` (month/year pair required if provided)
  - 200: `StudentAttendancePaginatedResponse`
  - **UI Flow**: Loads paginated attendance data on College Attendance page. Filters bar has ClassDropdown (required), GroupDropdown (required), Month/Year dropdowns (must be paired), pagination controls. Data displayed as table with student rows. Each student row shows: admission_no, roll_number, student_name, attendance_month, total_working_days, present_days, absent_days, remarks. Row actions: "View", "Edit", "Delete" (role-gated). Loading skeleton during fetch, empty state with "Bulk Create" CTA.
- GET `/college/student-attendance/{attendance_id}`
  - 200: `StudentAttendanceRead`
  - **UI Flow**: Opens AttendanceDetailModal with full attendance information. Modal shows attendance details, student info, and attendance breakdown. "Edit" and "Delete" buttons in header (role-gated). Loading spinner during fetch, error state with retry.
- GET `/college/student-attendance/by-admission/{admission_no}`
  - 200: `StudentAttendanceRead[]`
  - **UI Flow**: Used in StudentAttendanceHistoryModal to show all attendance records for a specific student by admission number. Table with pagination controls. Loading skeleton rows during fetch, empty state if no records found.
- POST `/college/student-attendance`
  - Body: `StudentAttendanceCreate` → `{ enrollment_id, attendance_month, total_working_days, present_days, absent_days, remarks? }`
  - 200: `StudentAttendanceRead`
  - **UI Flow**: "Create Attendance" button opens AttendanceCreateModal. Form has dropdown for enrollment_id (StudentDropdown), required fields (attendance_month, total_working_days, present_days, absent_days) and optional remarks field. Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- POST `/college/student-attendance/bulk-create`
  - Body: `StudentAttendanceBulkCreate` → `{ attendance_month, total_working_days, class_id, group_id }`
  - 200: `StudentAttendanceBulkCreateResult`
  - **UI Flow**: "Bulk Create" button opens BulkCreateModal. Form has ClassDropdown (required), GroupDropdown (required), Month/Year dropdowns, total_working_days field. Submit shows loading spinner. Success shows created_count and skipped_enrollment_ids, refreshes current view. Error shows error message in modal.
- PUT `/college/student-attendance/{attendance_id}`
  - Body: `StudentAttendanceUpdate`
  - 200: `StudentAttendanceRead`
  - **UI Flow**: AttendanceEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- DELETE `/college/student-attendance/{attendance_id}`
  - 200: `{ success: true }`
  - **UI Flow**: Delete confirmation dialog with student name and attendance month. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.

Response models (College):

- `StudentAttendanceRead`:
  - `{ attendance_id, enrollment_id, admission_no, roll_number, student_name, attendance_month, total_working_days, present_days, absent_days, remarks? }`
- `StudentAttendancePaginatedResponse`:
  - `{ students: [{ class_id, class_name, group_id, group_name, attendance: [{ month_name, students: StudentAttendanceRead[] }] }], total_count, current_page, page_size?, total_pages }`
- `StudentAttendanceBulkCreateResult`:
  - `{ created_count, skipped_enrollment_ids: number[], total_requested }`

### Error payloads (typical)

- Errors return `{ detail: string }` with 400/401/403/404/422/500.
- Month/Year validation errors return:
  - School: `{ message: string, month: number|null, year: number|null }` with 422
  - College: `{ message: string, month: number|null, year: number|null }` with 422

## UI/UX Structure

- School route: `/school/attendance`
- College route: `/college/attendance`
- Pages: `SchoolAttendancePage.tsx`, `CollegeAttendancePage.tsx`
- Common UX: Tailwind skeletons, button spinners, success/error toasts; a11y modals; consistent date formatting (month granularity).

### School Attendance

- Filters bar: `ClassDropdown` (required), `SectionDropdown` (optional), Month, Year, Pagination
- Grouped table by month: sections expand to show student rows
- Actions per row: View (modal), Edit (modal), Delete (confirm)
- Bulk actions:
  - Bulk Create (modal): POST `/bulk-create`
  - Bulk Update (modal): PUT `/bulk-update`
- Validation in UI: present_days + absent_days ≤ total_working_days; non-negative integers

### College Attendance

- Filters bar: `ClassDropdown` (required), `GroupDropdown` (required), Month, Year, Pagination
- Table/List view of attendance rows
- Actions per row (role-gated): View (modal), Edit (modal), Delete (confirm)
- Bulk Create (modal): POST `/bulk-create`
- Validation: same as School

## State & API Clients

- API clients:
  - School `studentAttendance.ts`: listStudents, get, create, bulkCreate, bulkUpdate, update, remove
  - College `studentAttendance.ts`: list, get, getByAdmission, create, bulkCreate, update, remove
- Stores:
  - School `attendanceStore.ts`: listGrouped, get, create, bulkCreate, bulkUpdate, update, remove
  - College `attendanceStore.ts`: list, get, getByAdmission, create, bulkCreate, update, remove
  - `uiStore.ts`: modals, filters, active tab state

## Role Gating Behavior (UI)

- Hide/disable actions not permitted for the role with tooltips.
- 401/403 in a tab shows an in-tab not-authorized state.
- College actions only visible for INSTITUTE_ADMIN, ADMIN, ACCOUNTANT.

## Success & Error Handling

- Success toasts; refetch lists/grouped data and open detail when needed.
- 422 field errors mapped to inputs (numbers/required fields) with helper text.
- Enforce month/year pairing at form level; inline errors before request.
