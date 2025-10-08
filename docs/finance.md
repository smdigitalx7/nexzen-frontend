# Finance Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Finance" → `/school/finance` and "College / Finance" → `/college/finance`. Tabs in each section: Income and Expenditure. Role-gated actions, robust Axios error handling, and consistent UI patterns.

## Tab-level Access Control

- School Finance: Visible to authenticated users (uses get_current_user)
  - Income: Create/Update/Delete
  - Expenditure: Create/Update/Delete
- College Finance: Visible to authenticated users (uses get_current_user)
  - Income: Create/Update/Delete
  - Expenditure: Create/Update/Delete

## API Endpoints and Responses (Base: `/api/v1`)

### School • Income (@school/income_router.py)

- GET `/school/income` (filters: admission_no?, purpose?, start_date?, end_date?) → 200: IncomeRead[]
  - UI Flow: Filters bar: AdmissionNoInput, PurposeInput (typeahead), DateRangePicker. Table columns: date, admission_no, purpose, amount, notes, actions. Row actions: View, Edit, Delete. Skeletons on load. Empty state with "Add Income" CTA.
- GET `/school/income/{income_id}` → 200: IncomeRead
  - UI Flow: IncomeDetailModal shows full record. Buttons: Edit, Delete.
- POST `/school/income/by-admission/{admission_no}` → 200: IncomeRead
  - Body (IncomeCreate)
  - UI Flow: "Add Income" opens IncomeCreateModal. AdmissionNo prefilled or selected via StudentSearchDropdown. Fields: date, purpose, amount, notes. Validation: amount > 0, required date/purpose. Submit → toast → refresh.
- PUT `/school/income/{income_id}` → 200: IncomeRead
  - Body (IncomeUpdate)
  - UI Flow: Edit modal pre-filled. Optimistic update, toast on success.
- POST `/school/income/by-reservation` → 200: IncomeRead
  - Body (IncomeCreateReservation)
  - UI Flow: From Reservations detail, "Create Income" pre-fills admission_no, purpose, amount. Submit and return to list.

### School • Expenditure (@school/expenditure_router.py)

- GET `/school/expenditure` (filters: start_date?, end_date?) → 200: ExpenditureRead[]
  - UI Flow: Filters bar: DateRangePicker. Table columns: date, category/purpose, amount, notes, actions. Row actions: View, Edit, Delete. Empty state with "Add Expenditure" CTA.
- GET `/school/expenditure/{expenditure_id}` → 200: ExpenditureRead
  - UI Flow: ExpenditureDetailModal shows full record. Buttons: Edit, Delete.
- POST `/school/expenditure` → 201: ExpenditureRead
  - Body (ExpenditureCreate)
  - UI Flow: "Add Expenditure" opens ExpenditureCreateModal. Fields: date, category/purpose, amount, notes. Validation: amount > 0, required fields. Submit → toast → refresh.
- PUT `/school/expenditure/{expenditure_id}` → 200: ExpenditureRead
  - Body (ExpenditureUpdate)
  - UI Flow: Edit modal pre-filled. Optimistic update, toast on success.
- DELETE `/school/expenditure/{expenditure_id}` → 204
  - UI Flow: Confirm dialog. On success: remove row, toast.

### College • Income (@college/income_router.py)

- GET `/college/income` (filters: admission_no?, purpose?, start_date?, end_date?) → 200: CollegeIncomeRead[]
  - UI Flow: Same as school; uses CollegeIncomeRead fields.
- GET `/college/income/{income_id}` → 200: CollegeIncomeRead
- POST `/college/income/by-admission/{admission_no}` → 200: CollegeIncomeRead
  - Body (CollegeIncomeCreate)
- PUT `/college/income/{income_id}` → 200: CollegeIncomeRead
  - Body (CollegeIncomeUpdate)
- POST `/college/income/by-reservation` → 200: CollegeIncomeRead
  - Body (CollegeIncomeCreateReservation)

### College • Expenditure (@college/expenditure_router.py)

- GET `/college/expenditure` (filters: start_date?, end_date?) → 200: CollegeExpenditureRead[]
  - UI Flow: Same as school; uses CollegeExpenditureRead fields.
- GET `/college/expenditure/{expenditure_id}` → 200: CollegeExpenditureRead
- POST `/college/expenditure` → 201: CollegeExpenditureRead
  - Body (CollegeExpenditureCreate)
- PUT `/college/expenditure/{expenditure_id}` → 200: CollegeExpenditureRead
  - Body (CollegeExpenditureUpdate)
- DELETE `/college/expenditure/{expenditure_id}` → 204

### Error payloads (typical)

- Errors return `{ detail: string }` with 400/401/403/404/422/500; map 422 to field errors and 401/403 to an in-tab not-authorized state.

## Frontend Structure

### Navigation

- Sidebar: "School / Finance" and "College / Finance"
- Tabs: Income | Expenditure

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Finance/
│   │       ├── Income/
│   │       │   ├── SchoolIncomeList.tsx
│   │       │   ├── SchoolIncomeModal.tsx
│   │       │   ├── SchoolIncomeForm.tsx
│   │       │   └── SchoolIncomeView.tsx
│   │       └── Expenditure/
│   │           ├── SchoolExpenditureList.tsx
│   │           ├── SchoolExpenditureModal.tsx
│   │           ├── SchoolExpenditureForm.tsx
│   │           └── SchoolExpenditureView.tsx
│   ├── college/
│   │   └── Finance/
│   │       ├── Income/
│   │       │   ├── CollegeIncomeList.tsx
│   │       │   ├── CollegeIncomeModal.tsx
│   │       │   ├── CollegeIncomeForm.tsx
│   │       │   └── CollegeIncomeView.tsx
│   │       └── Expenditure/
│   │           ├── CollegeExpenditureList.tsx
│   │           ├── CollegeExpenditureModal.tsx
│   │           ├── CollegeExpenditureForm.tsx
│   │           └── CollegeExpenditureView.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── StudentSearchDropdown.tsx
│       │   └── PurposeDropdown.tsx
│       ├── DateRangePicker.tsx
│       ├── DataTable.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       ├── ConfirmDialog.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   ├── incomeStore.ts
│   │   └── expenditureStore.ts
│   └── college/
│       ├── incomeStore.ts
│       └── expenditureStore.ts
├── api/
│   ├── school/
│   │   ├── income.ts
│   │   └── expenditure.ts
│   └── college/
│       ├── income.ts
│       └── expenditure.ts
└── pages/
    ├── SchoolFinance.tsx
    └── CollegeFinance.tsx
```

## Axios Setup

- Shared axios instance with auth headers, 401/403 handling, 422 normalization to field errors, and date serialization (YYYY-MM-DD).

## Zustand Stores

- School incomeStore
  - state: list, currentItem, filters {admissionNo?, purpose?, startDate?, endDate?}, loading, error
  - actions: fetchList(params), fetchById(id), createByAdmission(admissionNo, payload), createByReservation(payload), update(id, payload), remove(id)
- School expenditureStore
  - state: list, currentItem, filters {startDate?, endDate?}, loading, error
  - actions: fetchList(params), fetchById(id), create(payload), update(id, payload), remove(id)
- College incomeStore/expenditureStore
  - same shapes as school variants

## UI/UX Details

- Filters & Dropdowns
  - AdmissionNo input with StudentSearchDropdown (debounced search)
  - PurposeDropdown with popular purposes and free text
  - DateRangePicker with quick ranges (This Month, Last Month, YTD)
- Tables
  - Sortable columns by date/amount; sticky header; pagination controls
- Forms
  - Required fields marked; inline validation; numeric inputs for amounts; notes textarea
- Loading/Empty/Error
  - Skeleton tables on load; empty states with CTAs; error banners with retry
- Role Gating
  - Show/hide action buttons based on role; disable when not permitted
- Accessibility
  - ARIA-labelled modals; keyboard navigation; focus trap in dialogs

## Example UI Flows

- Create Income by Admission

  1. Click "Add Income" → IncomeModal
  2. Search/select Admission No → fill purpose/amount/date/notes
  3. Submit → toast → list refresh

- Create Expenditure
  1. Click "Add Expenditure" → ExpenditureModal
  2. Fill date/category/amount/notes → submit
  3. Success toast → refresh
