# Employment Management Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Single General sidebar entry “Employment Management” → `/general/employment`. Tabs: Employees, Attendance, Leaves. Tab-level access, robust error handling, reusable dropdowns, and smooth modals. Branch assignment is internal (no tab) via Branch-Employee after employee creation.

## Tab-level Access Control

- Employees
- Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
- Actions: INSTITUTE_ADMIN/ADMIN → Create/Update/Delete; ACADEMIC/ACCOUNTANT → Read-only
- Attendance
- Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
- Actions: All four roles → Create/Update/Delete
- Data source: Admins → GET `/employee-attendances`; Others → GET `/employee-attendances/branch`
- Leaves
- Visible: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
- Actions: INSTITUTE_ADMIN/ADMIN/ACCOUNTANT → Create/Update/Delete; Approve/Reject → INSTITUTE_ADMIN/ADMIN only

## API Endpoints and Responses (Base: `/api/v1/public`)

### Employees (@employee_router.py)

- GET `/employees` → 200: EmployeeRead[]; 401/403/422
  - **UI Flow**: Loads employees table on Employees tab. Table columns: employee_name, employee_code, employee_type, designation, status badge, date_of_joining, salary. Each row has "View", "Edit", "Delete" action buttons (role-gated). Loading skeleton rows during fetch. Empty state with "Create Employee" CTA. Search bar filters by name/code/designation.
- GET `/employees/branch` → 200: EmployeeRead[] (current branch); 401/403/422
  - **UI Flow**: Same as above but filtered to current branch only. Used for non-admin roles to show only their branch employees.
- GET `/employees/with-branches` → 200: EmployeeWithBranches[]; 401/403/500/422
  - **UI Flow**: Loads employees with their branch assignments. Used in EmployeeDetailModal to show all branches where employee is assigned. Displays branch list with assignment dates and status.
- GET `/employees/teacher-by-branch` → 200: TeacherByBranch[]; 401/403/500
  - **UI Flow**: Used by TeacherDropdown component to populate teacher options. Fetches teachers filtered by branch for dropdown selection in other forms.
- GET `/employees/{id}` → 200: EmployeeRead; 400/401/404/422
  - **UI Flow**: Opens EmployeeDetailModal with full employee information. Modal shows employee details, personal info, job details, and branch assignments. "Edit" and "Delete" buttons in header (role-gated). Loading spinner during fetch, error state with retry.
- POST `/employees` (Admins) → 200: EmployeeRead; 400/401/403/422
  - **UI Flow**: "Create Employee" button opens EmployeeCreateModal. Form has required fields (employee_name, employee_type, employee_code, date_of_joining, designation, status, salary) and optional fields (aadhar_no, mobile_no, email, address, qualification, experience_years). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh. After creation, automatically opens BranchAssignmentModal for branch assignment.
- PUT `/employees/{id}` (Admins) → 200: EmployeeRead; 400/401/404/422
  - **UI Flow**: EmployeeEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- DELETE `/employees/{id}` (Admins) → 200: { success:boolean, message:string }; 400/401/404/422
  - **UI Flow**: Delete confirmation dialog with employee name and warning about data loss. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.
- EmployeeRead: { employee_id, institute_id, employee_name, employee_type, employee_code, aadhar_no?, mobile_no?, email?, address?, date_of_joining, designation, qualification?, experience_years?, status, salary, created_at, updated_at?, created_by?, updated_by? }

### Branch-Employee (internal, @branch_employe_router.py)

- POST `/branch-employees` (Admins) → 200: BranchEmployeeRead; 401/403/422
  - **UI Flow**: Opens BranchAssignmentModal after employee creation. Form has dropdown for branch_id (BranchDropdown) and required assignment_date field. Optional end_date field. Submit shows loading spinner. Success toast + modal close + refresh employee detail view.
- DELETE `/branch-employees/{id}` (Admins) → 200: boolean; 400/401
  - **UI Flow**: "Remove from Branch" button in employee detail view shows confirmation dialog. "Cancel" and "Remove" buttons. Remove button shows loading spinner. Success updates employee detail view, shows success toast.
- GET list/byId (all roles) → 200: BranchEmployeeRead[]/BranchEmployeeRead; 404
  - **UI Flow**: Used internally to load branch assignments in EmployeeDetailModal. Shows branch list with assignment dates, status, and remove buttons (role-gated).
- BranchEmployeeRead: { branch_employee_id, employee_id, branch_id, assignment_date, end_date?, is_active, created_at, updated_at?, created_by?, updated_by? }

### Attendance (@employee_attendance_router.py)

- GET `/employee-attendances` (Admins) with query: page_size, page, month?, year? → 200: AttendanceListResponse; 401/403/422
  - **UI Flow**: Loads attendance table on Attendance tab for admin roles. Table columns: employee_name, attendance_month, total_working_days, days_present, days_absent, paid_leaves, unpaid_leaves, late_arrivals, early_departures. Each row has "View", "Edit", "Delete" action buttons. Filters: month/year dropdowns, pagination controls. Loading skeleton rows during fetch. Empty state with "Create Attendance" CTA.
- GET `/employee-attendances/branch` (Others) with query: page_size, page, month?, year? → 200: AttendanceListResponse; 401/403/422
  - **UI Flow**: Same as above but filtered to current branch employees only. Used for non-admin roles to show only their branch attendance records.
- GET `/employee-attendances/{id}` → 200: EmployeeAttendanceRead; 401/404/422
  - **UI Flow**: Opens AttendanceDetailModal with full attendance information. Modal shows attendance details, employee info, and attendance breakdown. "Edit" and "Delete" buttons in header. Loading spinner during fetch, error state with retry.
- POST `/employee-attendances` → 200: EmployeeAttendanceRead; 401/403/422
  - **UI Flow**: "Create Attendance" button opens AttendanceCreateModal. Form has dropdown for employee_id (EmployeeDropdown), required fields (attendance_month, total_working_days, days_present, days_absent) and optional fields (paid_leaves, unpaid_leaves, late_arrivals, early_departures). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- PUT `/employee-attendances/{id}` → 200: EmployeeAttendanceRead; 401/404/422
  - **UI Flow**: AttendanceEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- DELETE `/employee-attendances/{id}` → 200: boolean; 401/404/422
  - **UI Flow**: Delete confirmation dialog with employee name and attendance month. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.
- EmployeeAttendanceRead: { attendance_id, institute_id, employee_id, attendance_month, total_working_days, days_present, days_absent, paid_leaves, unpaid_leaves, late_arrivals, early_departures, created_at, updated_at?, created_by?, updated_by? }
- AttendanceListResponse: { data: EmployeeAttendanceRead[], total, pages, current_page, pageSize? }

### Leaves (@employee_leave_router.py)

- GET `/employee-leave` with query: pageSize, page, leave_status?, month?, year? → 200: EmployeeLeaveListResponse; 401/404/422
  - **UI Flow**: Loads leaves table on Leaves tab for admin roles. Table columns: employee_name, leave_type, from_date, to_date, total_days, leave_status badge, applied_date, approved_by, approved_date. Each row has "View", "Edit", "Approve", "Reject", "Delete" action buttons (role-gated). Filters: leave_status dropdown, month/year dropdowns, pagination controls. Loading skeleton rows during fetch. Empty state with "Create Leave" CTA.
- GET `/employee-leave/branch` (branch scoped) → 200: EmployeeLeaveListResponse; 401/404/422
  - **UI Flow**: Same as above but filtered to current branch employees only. Used for non-admin roles to show only their branch leave records.
- GET `/employee-leave/{leave_id}` → 200: EmployeeLeaveRead; 401/404
  - **UI Flow**: Opens LeaveDetailModal with full leave information. Modal shows leave details, employee info, leave dates, reason, and approval history. "Edit", "Approve", "Reject", "Delete" buttons in header (role-gated). Loading spinner during fetch, error state with retry.
- POST `/employee-leave` → 200: EmployeeLeaveRead; 400 (date/total_days), 401/403
  - **UI Flow**: "Create Leave" button opens LeaveCreateModal. Form has dropdown for employee_id (EmployeeDropdown), required fields (leave_type, from_date, to_date, reason) and calculated total_days field. Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- PUT `/employee-leave/{leave_id}` → 200: EmployeeLeaveRead; 401/400/403
  - **UI Flow**: LeaveEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- PUT `/employee-leave/{leave_id}/approve` (Admins) → 200: EmployeeLeaveRead; 401/400
  - **UI Flow**: "Approve" button shows confirmation dialog with leave details. "Cancel" and "Approve" buttons. Approve button shows loading spinner. Success updates leave status, refreshes table, shows success toast. Error shows error message in dialog.
- PUT `/employee-leave/{leave_id}/reject` (Admins) → 200: EmployeeLeaveRead; 401/400
  - **UI Flow**: "Reject" button shows confirmation dialog with leave details and required rejection_reason field. "Cancel" and "Reject" buttons. Reject button shows loading spinner. Success updates leave status, refreshes table, shows success toast. Error shows error message in dialog.
- DELETE `/employee-leave/{leave_id}` (Admins) → 200: boolean; 401/400
  - **UI Flow**: Delete confirmation dialog with employee name and leave dates. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.
- EmployeeLeaveRead: { leave_id, employee_id, leave_type, from_date, to_date, reason, leave_status?, total_days, applied_date?, approved_by?, approved_date?, rejection_reason?, created_at?, updated_at?, created_by?, updated_by? }
- EmployeeLeaveListResponse: { data: EmployeeLeaveRead[], total, pages, current_page, pageSize }

### Error payloads (typical)

- Errors return `{ detail: string }` with HTTP status 400/401/403/404/422/500

## UI/UX Structure and Flows

- Page: `ManagementEmploymentPage.tsx` with tabs: Employees | Attendance | Leaves
- Common UX: Tailwind skeletons, button spinners, toasts; 422 field-level errors; a11y modals

- Employees
- Table: Name, Code, Type, Mobile, Email, Designation, Status, Salary, Joined, Actions
- Toggle “With Branches” read view (GET `/employees/with-branches`)
- View/Edit modal (GET by id); Admin-only Save (PUT) and Delete (confirm)
- Create modal (POST); after success, open BranchAssignForm
- BranchAssignForm: POST `/branch-employees` with Branch dropdown (GET `/branches`), default assignment_date = now; optional “Assign another”

- Attendance
- Source by role (Admins institute-level vs Others branch-level)
- Table: Employee, Month, Working, Present, Absent, Paid, Unpaid, Late, Early, Actions
- Filters: month/year; optional employee filter
- Pagination controls from `AttendanceListResponse`
- View/Edit modal; Create modal (derived Absent validated server-side); Delete confirm

- Leaves
- Table: Employee, Type, From, To, Total Days, Status, Applied, Actions
- Filters: status, month/year
- View/Edit modal; Create modal with date/total_days validation
- Approve/Reject (Admins) with confirm/textarea; Delete confirm

## Axios + error handling

- Base URL from `import.meta.env.VITE_API_BASE_URL`
- Response interceptor maps to `{ message, status, data }`
- `handleApiError(e)`: toast appropriate message and return normalized error

## Reusable dropdowns

- EmployeeDropdown: Admins → GET `/employees`; Others → GET `/employees/branch`
- TeacherDropdown: GET `/employees/teacher-by-branch`
- BranchDropdown: GET `/branches`

## Reusable Dropdowns

- EmployeeDropdown: Admins → GET `/employees`; Others → GET `/employees/branch`
- TeacherDropdown: GET `/employees/teacher-by-branch`
- BranchDropdown: GET `/branches`

## State & API Clients

- API clients:
  - `employees.ts`: list, listByBranch, withBranches, teacherByBranch, get, create, update, remove
  - `branchEmployees.ts`: list, get, create, remove
  - `employeeAttendance.ts`: listInstitute, listBranch, get, create, update, remove
  - `employeeLeaves.ts`: listInstitute, listBranch, get, create, update, approve, reject, remove
  - Base `axios.ts` with error normalization
- Stores (Zustand):
  - `employeesStore.ts`: `{ list, withBranches, loading, error, mode: 'list'|'withBranches', fetchList, fetchWithBranches, fetchById, create, update, remove }`
  - `attendanceStore.ts`: `{ list, loading, error, params: { page, pageSize, month?, year? }, scope: 'institute'|'branch', fetchList, fetchById, create, update, remove }`
  - `leavesStore.ts`: `{ list, loading, error, params: { page, pageSize, leave_status?, month?, year? }, scope: 'institute'|'branch', fetchList, fetchById, create, update, approve, reject, remove }`
  - `teacherOptionsStore.ts` (or hook): `{ options, loading, error, fetch }`
  - `uiStore.ts`: `{ activeTab, modals: { employeeDetail, employeeCreate, branchAssign, attendanceDetail, attendanceCreate, leaveDetail, leaveCreate, approveReject }, open(), close() }`

### Minimal API examples

```ts
// src/api/public/employees.ts
import { api } from "../axios";
export const EmployeesApi = {
  list: () => api.get("/api/v1/public/employees").then((r) => r.data),
  listByBranch: () =>
    api.get("/api/v1/public/employees/branch").then((r) => r.data),
  withBranches: () =>
    api.get("/api/v1/public/employees/with-branches").then((r) => r.data),
  teacherByBranch: () =>
    api.get("/api/v1/public/employees/teacher-by-branch").then((r) => r.data),
  get: (id: number) =>
    api.get(`/api/v1/public/employees/${id}`).then((r) => r.data),
  create: (p: any) =>
    api.post("/api/v1/public/employees", p).then((r) => r.data),
  update: (id: number, p: any) =>
    api.put(`/api/v1/public/employees/${id}`, p).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/api/v1/public/employees/${id}`).then((r) => r.data),
};
```

```ts
// src/api/public/branchEmployees.ts
import { api } from "../axios";
export const BranchEmployeesApi = {
  list: () => api.get("/api/v1/public/branch-employees").then((r) => r.data),
  get: (id: number) =>
    api.get(`/api/v1/public/branch-employees/${id}`).then((r) => r.data),
  create: (p: any) =>
    api.post("/api/v1/public/branch-employees", p).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/api/v1/public/branch-employees/${id}`).then((r) => r.data),
};
```

```ts
// src/api/public/employeeAttendance.ts
import { api } from "../axios";
export const EmployeeAttendanceApi = {
  listInstitute: (q: {
    page?: number;
    page_size?: number;
    month?: number;
    year?: number;
  }) =>
    api
      .get("/api/v1/public/employee-attendances", { params: q })
      .then((r) => r.data),
  listBranch: (q: {
    page?: number;
    page_size?: number;
    month?: number;
    year?: number;
  }) =>
    api
      .get("/api/v1/public/employee-attendances/branch", { params: q })
      .then((r) => r.data),
  get: (id: number) =>
    api.get(`/api/v1/public/employee-attendances/${id}`).then((r) => r.data),
  create: (p: any) =>
    api.post("/api/v1/public/employee-attendances", p).then((r) => r.data),
  update: (id: number, p: any) =>
    api.put(`/api/v1/public/employee-attendances/${id}`, p).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/api/v1/public/employee-attendances/${id}`).then((r) => r.data),
};
```

```ts
// src/api/public/employeeLeaves.ts
import { api } from "../axios";
export const EmployeeLeavesApi = {
  listInstitute: (q: {
    page?: number;
    pageSize?: number;
    leave_status?: string;
    month?: number;
    year?: number;
  }) =>
    api.get("/api/v1/public/employee-leave", { params: q }).then((r) => r.data),
  listBranch: (q: {
    page?: number;
    pageSize?: number;
    leave_status?: string;
    month?: number;
    year?: number;
  }) =>
    api
      .get("/api/v1/public/employee-leave/branch", { params: q })
      .then((r) => r.data),
  get: (leave_id: number) =>
    api.get(`/api/v1/public/employee-leave/${leave_id}`).then((r) => r.data),
  create: (p: any) =>
    api.post("/api/v1/public/employee-leave", p).then((r) => r.data),
  update: (leave_id: number, p: any) =>
    api.put(`/api/v1/public/employee-leave/${leave_id}`, p).then((r) => r.data),
  approve: (leave_id: number) =>
    api
      .put(`/api/v1/public/employee-leave/${leave_id}/approve`)
      .then((r) => r.data),
  reject: (leave_id: number, payload: { rejection_reason: string }) =>
    api
      .put(`/api/v1/public/employee-leave/${leave_id}/reject`, payload)
      .then((r) => r.data),
  remove: (leave_id: number) =>
    api.delete(`/api/v1/public/employee-leave/${leave_id}`).then((r) => r.data),
};
```

## Todos

- [ ] Create API clients and TS types (employees, branch-employees, attendance, leaves)
- [ ] Implement Zustand stores with pagination/filters where needed
- [ ] Build tabs: Employees (with-branches + branch assign), Attendance (filters/pagination), Leaves (approve/reject)
- [ ] Add tab-level access and per-action gating
- [ ] Implement dropdowns and smooth loading/error/empty states
