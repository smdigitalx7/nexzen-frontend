# Advances & Payroll Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

General sidebar entry “Advances & Payroll” → `/general/finance` with tabs: Advances, Payroll. Tab-level access control, robust Axios error handling, Zustand stores, and smooth modals. Data and role rules mirror backend routers.

## Tab-level Access Control

- Advances tab
  - Visible: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
  - Actions:
    - Create/Update/Amount-Paid/Status: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
    - Approve/Reject (via status update): INSTITUTE_ADMIN, ADMIN
- Payroll tab
  - Visible: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
  - Actions:
    - Create/Update/Delete: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT (Delete: INSTITUTE_ADMIN, ADMIN)
    - Bulk Create: INSTITUTE_ADMIN, ADMIN
    - Status Update: INSTITUTE_ADMIN, ADMIN

## API Endpoints and Responses (Base: `/api/v1/public`)

### Advances (@advance_router.py)

- GET `/advances`
  - Query: `page` (default 1), `pageSize` (default 10), `month? (1-12)`, `year? (1900-2100)`, `status?`
  - 200: `AdvanceListResponse`
    - `{ data: AdvancesRead[], total: number, pages: number, current_page: number, PageSize?: number }`
  - Errors: 401 Unauthorized, 404 Not Found, 422 Validation Error
  - **UI Flow**: Loads advances table on Advances tab for admin roles. Table columns: employee_name, advance_date, advance_amount, amount_paid, balance_amount, status badge, request_reason. Each row has "View", "Edit", "Pay Amount", "Approve", "Reject" action buttons (role-gated). Filters: month/year dropdowns, status dropdown, pagination controls. Loading skeleton rows during fetch. Empty state with "Create Advance" CTA.
- GET `/advances/branch`
  - Query: same as above (branch-scoped)
  - 200: `AdvanceListResponse`
  - Errors: 401, 404, 422
  - **UI Flow**: Same as above but filtered to current branch employees only. Used for non-admin roles to show only their branch advance records.
- GET `/advances/{id}`
  - 200: `AdvancesRead`
  - Errors: 401, 404
  - **UI Flow**: Opens AdvanceDetailModal with full advance information. Modal shows advance details, employee info, payment history, and approval status. "Edit", "Pay Amount", "Approve", "Reject" buttons in header (role-gated). Loading spinner during fetch, error state with retry.
- POST `/advances`
  - Body: `AdvancesCreate`
    - `{ employee_id: number, advance_date: YYYY-MM-DD, advance_amount: number, request_reason: string }`
  - 200: `AdvancesRead` (with `status: "PENDING"`)
  - Errors: 401, 422
  - **UI Flow**: "Create Advance" button opens AdvanceCreateModal. Form has dropdown for employee_id (EmployeeDropdown), required fields (advance_date, advance_amount, request_reason). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- PUT `/advances/{id}`
  - Body: `AdvancesUpdate`
    - `{ advance_amount?: number, request_reason?: string }`
  - 200: `AdvancesRead`
  - Errors: 401, 404
  - **UI Flow**: AdvanceEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- PUT `/advances/{id}/amount-paid`
  - Body: `AdvancesAmountPaid` → `{ amount_paid: number }`
  - 200: `AdvancesRead` (updated balances/paid)
  - Errors: 401, 404
  - **UI Flow**: "Pay Amount" button opens AdvancePaymentModal. Form has amount_paid field with validation (cannot exceed balance_amount). Submit shows loading spinner. Success updates advance status, refreshes table, shows success toast. Error shows error message in modal.
- PUT `/advances/{id}/status`
  - Body: `AdvancesStatusUpdate` → `{ status: string, reason?: string }`
  - 200: `AdvancesRead` (updated status and reason/approved_at/by)
  - Errors: 401, 404
  - **UI Flow**: "Approve" or "Reject" buttons show confirmation dialog with advance details and optional reason field. "Cancel" and "Approve/Reject" buttons. Action button shows loading spinner. Success updates advance status, refreshes table, shows success toast. Error shows error message in dialog.

AdvancesRead fields:

- `{ advance_id, employee_id, advance_date, advance_amount, total_repayment_amount?, remaining_balance?, request_reason?, status?, created_at, updated_at?, created_by?, approved_by?, approved_at?, reason?, updated_by? }`

### Payroll (@payroll_router.py)

- GET `/payrolls`
  - Query: `page (>=1)`, `pageSize (1-1000)`, `month? (1-12)`, `year? (2000-2100)`, `status?`
  - 200: `PayrollListResponse`
    - `{ data: PayrollRead[], total: number, pages: number, current_page: number, pageSize?: number }`
  - Errors: 401, 422
  - **UI Flow**: Loads payroll table on Payroll tab for admin roles. Table columns: employee_name, payroll_month, gross_pay, lop, advance_deduction, other_deductions, net_pay, status badge. Each row has "View", "Edit", "Delete", "Update Status" action buttons (role-gated). Filters: month/year dropdowns, status dropdown, pagination controls. Loading skeleton rows during fetch. Empty state with "Create Payroll" and "Bulk Create" CTAs.
- GET `/payrolls/branch`
  - Query: same as above (branch-scoped)
  - 200: `PayrollListResponse`
  - Errors: 401, 422
  - **UI Flow**: Same as above but filtered to current branch employees only. Used for non-admin roles to show only their branch payroll records.
- GET `/payrolls/{payroll_id}`
  - 200: `PayrollRead`
  - Errors: 401, 404
  - **UI Flow**: Opens PayrollDetailModal with full payroll information. Modal shows payroll details, employee info, payment breakdown, and status. "Edit", "Delete", "Update Status" buttons in header (role-gated). Loading spinner during fetch, error state with retry.
- POST `/payrolls`
  - Body: `PayrollCreate`
    - `{ employee_id, payroll_month: YYYY-MM-DD, previous_balance?, gross_pay, lop?, advance_deduction?, other_deductions? }`
  - 201: `PayrollRead`
  - Errors: 401, 422
  - **UI Flow**: "Create Payroll" button opens PayrollCreateModal. Form has dropdown for employee_id (EmployeeDropdown), required fields (payroll_month, gross_pay) and optional fields (previous_balance, lop, advance_deduction, other_deductions). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- POST `/payrolls/bulk`
  - Body: `BulkPayrollCreate`
    - `{ month, year, branch_id? | employee_ids?, default_lop, default_advance_deduction, default_other_deductions }`
  - 201: `BulkPayrollResponse`
    - `{ success_count, error_count, total_processed, errors: {employee_id,message}[], created_payroll_ids: number[], skipped_employees: {employee_id,reason}[] }`
  - Errors: 400 (future month/negative defaults), 401, 500
  - **UI Flow**: "Bulk Create" button opens BulkPayrollCreateModal. Form has month/year dropdowns, branch_id dropdown (optional), default values for lop/advance_deduction/other_deductions. Submit shows loading spinner. Success shows detailed results with success/error counts, refreshes table. Error shows error message in modal.
- PUT `/payrolls/{payroll_id}`
  - Body: `PayrollUpdate`
    - `{ previous_balance?, gross_pay?, lop?, advance_deduction?, other_deductions?, paid_amount?, payment_method?, payment_notes?, status? }`
  - 200: `PayrollRead`
  - Errors: 401, 404, 422
  - **UI Flow**: PayrollEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- PUT `/payrolls/{payroll_id}/status`
  - Body: `string` (status) (service accepts uppercase)
  - 200: `PayrollRead`
  - Errors: 401, 404
  - **UI Flow**: "Update Status" button opens PayrollStatusModal. Form has status dropdown with available status options. Submit shows loading spinner. Success updates payroll status, refreshes table, shows success toast. Error shows error message in modal.
- DELETE `/payrolls/{payroll_id}`
  - 200: `boolean`
  - Errors: 401, 404
  - **UI Flow**: Delete confirmation dialog with employee name and payroll month. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.
- GET `/payrolls/employee/{employee_id}/summary`
  - Query: `year`
  - 200: `PayrollSummaryResponse`
    - `{ employee_id, employee_name?, employee_type?, year, total_gross_pay, total_net_pay, total_deductions, total_paid_amount, pending_amount }`
  - Errors: 401, 404
  - **UI Flow**: Used in EmployeePayrollSummaryModal to show yearly payroll summary for an employee. Modal displays summary cards with totals and breakdown. Year dropdown for selection. Loading spinner during fetch, error state with retry.
- GET `/payrolls/pending/count`
  - Query: `branch_id?`
  - 200: `number`
  - Errors: 401
  - **UI Flow**: Used to display pending payroll count badge in the Payroll tab header. Shows count of pending payrolls for current branch or all branches (admin). Updates automatically after payroll operations.
- GET `/payrolls/date-range`
  - Query: `start_date`, `end_date`, `branch_id?`
  - 200: `PayrollRead[]`
  - Errors: 401
  - **UI Flow**: Used in PayrollReportsModal to show payroll data within a date range. Form has start_date and end_date fields, optional branch_id dropdown. Results displayed in table format with export options. Loading spinner during fetch, error state with retry.
- GET `/payrolls/employee/{employee_id}/payrolls`
  - Query: `page?`, `pageSize?`
  - 200: `PayrollRead[]`
  - Errors: 401
  - **UI Flow**: Used in EmployeePayrollHistoryModal to show all payroll records for a specific employee. Table with pagination controls. Loading skeleton rows during fetch, empty state if no records found.

PayrollRead fields:

- `{ payroll_id, employee_id, employee_name?, employee_type?, payroll_month, previous_balance, gross_pay, lop, advance_deduction, other_deductions, total_deductions, net_pay, paid_amount, carryover_balance, payment_method?, payment_notes?, status, generated_at, updated_at?, generated_by?, updated_by? }`

### Error payloads (typical)

- Most errors return `{ detail: string }` with status 400/401/403/404/422/500. Map to toasts and inline field errors (422).

## UI/UX Structure

- Route: `/general/finance`
- Page: `ManagementFinancePage.tsx` with tabs: Advances | Payroll
- Common UX: Tailwind skeletons, button spinners, success/error toasts; a11y modals; consistent date formatting (e.g., `DD MMM YYYY`).

### Advances tab

- Table columns: Employee, Date, Amount, Remaining, Status, Reason, Created, Actions
- Filters: Month, Year, Status; pagination from `AdvanceListResponse`
- Actions:
  - View detail (modal): GET by id → show full record
  - Create (modal): POST `/advances` → success toast → refetch list
  - Edit (modal): PUT `/advances/{id}` → success toast → refetch row
  - Amount Paid (inline/modal): PUT `/advances/{id}/amount-paid` → updates balances
  - Status Update (modal): PUT `/advances/{id}/status` (Admins can approve/reject with reason)
- Dropdowns: Employee (role-scoped employees endpoint), Status (static options)
- Empty/Loading/Error states: clear messaging and retry

### Payroll tab

- Table columns: Employee, Month, Gross, Deductions, Net, Paid, Carryover, Status, Actions
- Filters: Month/Year, Status; pagination from `PayrollListResponse`
- Actions:
  - View detail (modal): GET by id
  - Create payroll (modal): POST `/payrolls`
  - Update payroll (modal): PUT `/payrolls/{id}`
  - Update status (inline/modal): PUT `/payrolls/{id}/status`
  - Delete payroll (confirm): DELETE `/payrolls/{id}` (Admins)
  - Bulk create (wizard modal): POST `/payrolls/bulk` with branch or selected employees and default deductions; show summary of created/skipped/errors from `BulkPayrollResponse`
  - Quick stats: show pending count (GET `/payrolls/pending/count`), and optional employee-year summary drawer
- Dropdowns: Employee (role-scoped), Branch, Status, Payment Method

## State & API Clients

- API clients:
  - `advances.ts`: list, listByBranch, get, create, update, updateAmountPaid, updateStatus
  - `payroll.ts`: list, listByBranch, get, create, update, updateStatus, delete, bulkCreate, getSummaryByEmployee, getPendingCount, getInDateRange, listByEmployee
- Stores (Zustand):
  - `advancesStore.ts`: `{ list, loading, error, params: { page, pageSize, month?, year?, status? }, scope: 'institute'|'branch', fetchList, fetchById, create, update, updateAmountPaid, updateStatus }`
  - `payrollStore.ts`: `{ list, loading, error, params: { page, pageSize, month?, year?, status? }, scope: 'institute'|'branch', fetchList, fetchById, create, update, updateStatus, remove, bulkCreate, getSummaryByEmployee, getPendingCount, getInDateRange, listByEmployee }`
  - `uiStore.ts`: `{ activeTab, modals: { advanceDetail, advanceCreate, advanceAmountPaid, advanceStatus, payrollDetail, payrollCreate, payrollUpdateStatus, payrollBulk }, open(), close() }`

### Minimal API examples

```ts
// src/api/public/advances.ts
import { api } from "../axios";
export const AdvancesApi = {
  list: (q: {
    page?: number;
    pageSize?: number;
    month?: number;
    year?: number;
    status?: string;
  }) => api.get("/api/v1/public/advances", { params: q }).then((r) => r.data),
  listByBranch: (q: {
    page?: number;
    pageSize?: number;
    month?: number;
    year?: number;
    status?: string;
  }) =>
    api
      .get("/api/v1/public/advances/branch", { params: q })
      .then((r) => r.data),
  get: (id: number) =>
    api.get(`/api/v1/public/advances/${id}`).then((r) => r.data),
  create: (p: any) =>
    api.post("/api/v1/public/advances", p).then((r) => r.data),
  update: (id: number, p: any) =>
    api.put(`/api/v1/public/advances/${id}`, p).then((r) => r.data),
  updateAmountPaid: (id: number, payload: { amount_paid: number }) =>
    api
      .put(`/api/v1/public/advances/${id}/amount-paid`, payload)
      .then((r) => r.data),
  updateStatus: (id: number, payload: { status: string; reason?: string }) =>
    api
      .put(`/api/v1/public/advances/${id}/status`, payload)
      .then((r) => r.data),
};
```

```ts
// src/api/public/payroll.ts
import { api } from "../axios";
export const PayrollApi = {
  list: (q: {
    page?: number;
    pageSize?: number;
    month?: number;
    year?: number;
    status?: string;
  }) => api.get("/api/v1/public/payrolls", { params: q }).then((r) => r.data),
  listByBranch: (q: {
    page?: number;
    pageSize?: number;
    month?: number;
    year?: number;
    status?: string;
  }) =>
    api
      .get("/api/v1/public/payrolls/branch", { params: q })
      .then((r) => r.data),
  get: (id: number) =>
    api.get(`/api/v1/public/payrolls/${id}`).then((r) => r.data),
  create: (p: any) =>
    api.post("/api/v1/public/payrolls", p).then((r) => r.data),
  update: (id: number, p: any) =>
    api.put(`/api/v1/public/payrolls/${id}`, p).then((r) => r.data),
  updateStatus: (id: number, status: string) =>
    api.put(`/api/v1/public/payrolls/${id}/status`, status).then((r) => r.data),
  remove: (id: number) =>
    api.delete(`/api/v1/public/payrolls/${id}`).then((r) => r.data),
  bulkCreate: (p: any) =>
    api.post("/api/v1/public/payrolls/bulk", p).then((r) => r.data),
  getSummaryByEmployee: (employee_id: number, year: number) =>
    api
      .get(`/api/v1/public/payrolls/employee/${employee_id}/summary`, {
        params: { year },
      })
      .then((r) => r.data),
  getPendingCount: (branch_id?: number) =>
    api
      .get(`/api/v1/public/payrolls/pending/count`, { params: { branch_id } })
      .then((r) => r.data),
  getInDateRange: (start_date: string, end_date: string, branch_id?: number) =>
    api
      .get(`/api/v1/public/payrolls/date-range`, {
        params: { start_date, end_date, branch_id },
      })
      .then((r) => r.data),
  listByEmployee: (
    employee_id: number,
    q: { page?: number; pageSize?: number }
  ) =>
    api
      .get(`/api/v1/public/payrolls/employee/${employee_id}/payrolls`, {
        params: q,
      })
      .then((r) => r.data),
};
```

## Role Gating Behavior (UI)

- Disable/hide actions not permitted for the user’s role with explanatory tooltips.
- If a list response returns 403/401, show a friendly not-authorized view inside the tab.
- Bulk and destructive actions (status changes, delete) require confirm dialogs.

## Success & Error Handling

- Success: toasts with concise messages; for create/update/delete, refetch affected list and detail if modal open.
- Validation (422): map field errors to form inputs (amounts, dates, required fields).
- Business errors (400): show inline message at form top.
