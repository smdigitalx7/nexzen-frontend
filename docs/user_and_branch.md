# User & Branch Management Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Implement a single sidebar module for managing Users, Branches, Roles, and User-Branch-Access with list → detail modal → update/delete → create flows, using Zustand and Axios with robust error handling. This module is visible/usable only for roles INSTITUTE_ADMIN and ADMIN.

## Access control (frontend)

- Allowed roles: INSTITUTE_ADMIN, ADMIN (for the current branch)
- Sidebar gating: hide the menu if user lacks allowed roles
- Route guard: wrap the page, show a friendly 403 state if unauthorized
- Role source: use existing global auth store; if unavailable, GET `/api/v1/public/auth/me` on mount to derive roles
- Fallback: on first 403 from any API in this module, show 403 state and disable actions

## Backend endpoints mapping and contracts

Base URL prefix: `/api/v1/public`

### Branches

- GET `/branches/`
  - 200: `BranchRead[]` → `{ branch_id, institute_id, branch_name, branch_type, branch_address?, contact_phone?, contact_email?, is_active, created_at, updated_at? }`
  - Errors: 401 Invalid Credentials, 403 Not authorized, 422 Validation error
  - **UI Flow**: Loads branch cards on page mount. Each card shows branch_name, branch_type, is_active status badge. Cards have "View Details" button that opens BranchDetailModal. Loading skeleton cards during fetch. Empty state with "Create Branch" CTA if no branches exist.
- GET `/branches/{id}`
  - 200: `BranchRead`
  - Errors: 400 Branch ID is required, 401, 403, 422
  - **UI Flow**: Opens BranchDetailModal with full branch information. Modal has "Edit" and "Delete" buttons in header. Edit button opens BranchEditModal with pre-filled form. Delete button shows confirmation dialog. Modal shows loading spinner during fetch, error state with retry button on failure.
- POST `/branches/`
  - Body: `BranchCreate` → `{ branch_name, branch_type, branch_address?, contact_phone?, contact_email?, is_active? }`
  - 200: Created entity (route is typed as BranchCreate; refetch list/detail after save)
  - Errors: 400 Branch is required/unauthorized, 401, 403, 422
  - **UI Flow**: "Create Branch" button opens BranchCreateModal. Form has required fields (branch_name, branch_type) and optional fields (address, phone, email). is_active defaults to true. Form validation shows inline errors. Submit button shows loading spinner. Success toast + modal close + list refresh. Error handling shows field-level validation errors.
- PUT `/branches/{id}`
  - Body: `BranchUpdate` → `{ branch_name, branch_type, branch_address, contact_phone, contact_email, is_active }`
  - 200: Updated entity (route model is BranchUpdate; refetch after save)
  - Errors: 400 unauthorized/invalid, 401, 403, 422
  - **UI Flow**: BranchEditModal opens with current values pre-filled. All fields editable including is_active toggle. Form validation and submit flow same as create. Success updates the detail modal and refreshes card list. Optimistic update shows new values immediately.
- DELETE `/branches/{id}`
  - 200: `boolean`
  - Errors: 400 Branch ID required/unauthorized, 401, 403, 422
  - **UI Flow**: Delete confirmation dialog with branch name and warning message. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes card from list, shows success toast. Error shows error message in dialog.

### Users

- GET `/users/`
  - 200: `UserRead[]` → `{ user_id, institute_id, email, mobile_no?, full_name, is_institute_admin, is_active, created_at, updated_at?, created_by?, updated_by? }`
  - Errors: 401, 403 Not authorized, 422
  - **UI Flow**: Loads users table on Users tab. Table columns: full_name, email, mobile_no, is_institute_admin badge, is_active badge, created_at. Each row has "View", "Edit", "Delete" action buttons. Loading skeleton rows during fetch. Empty state with "Create User" CTA. Search bar filters by name/email.
- GET `/users/{id}`
  - 200: `UserRead`
  - Errors: 401, 403, 422
  - **UI Flow**: Opens UserDetailModal with full user information. Modal shows user details in read-only format with "Edit" and "Delete" buttons. Edit opens UserEditModal. Delete shows confirmation dialog. Loading spinner during fetch, error state with retry.
- POST `/users/`
  - Body: `UserCreate` → `{ email, mobile_no?, full_name, is_institute_admin?, is_active?, password, confirm_password }`
  - 200: `UserRead` (contains `user_id`)
  - Errors: 400 business (e.g., conflicts), 401, 403, 422 (validation like password mismatch)
  - **UI Flow**: "Create User" button opens UserCreateModal. Form has required fields (email, full_name, password, confirm_password) and optional fields (mobile_no, is_institute_admin toggle, is_active toggle). Password confirmation validation. Submit shows loading spinner. Success toast + modal close + table refresh. After creation, automatically opens UserBranchAccessModal for branch assignment.
- PUT `/users/{id}`
  - Body: `UserUpdate` (no password)
  - 200: `UserRead`
  - Errors: 400 business, 401, 403, 422
  - **UI Flow**: UserEditModal opens with current values pre-filled. All fields editable except password (separate change password flow). Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- DELETE `/users/{id}`
  - 200: `UserRead`
  - Errors: 400 business, 401, 403, 422
  - **UI Flow**: Delete confirmation dialog with user name and warning about data loss. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.

### Roles

- GET `/roles/`
  - 200: `RoleRead[]` → `{ role_id, institute_id, role_name, display_name, is_active, created_at, updated_at? }`
  - Errors: 401, 404 Roles not found
  - **UI Flow**: Loads roles list on Roles tab. Simple table with columns: role_name, display_name, is_active badge, created_at. Read-only view with no action buttons. Loading skeleton rows during fetch. Empty state message if no roles found.
- GET `/roles/{id}`
  - 200: `RoleRead`
  - Errors: 401, 404, 422
  - **UI Flow**: Opens RoleDetailModal with full role information. Modal shows role details in read-only format. No edit/delete actions available. Loading spinner during fetch, error state with retry.
- PUT `/roles/{id}`
  - Body: `{ display_name }`
  - 200: `{ message: "Role updated successfully" }`
  - Errors: 401, 404, 422
  - **UI Flow**: RoleEditModal opens with current display_name pre-filled. Only display_name field is editable. Form validation and submit flow. Success updates the detail modal and refreshes table. Optimistic update shows new values immediately.

### User-Branch-Accesses

- GET `/user-branch-accesses/`
  - 200: `UserBranchAccessList` → `{ list: [{ branch_id, branch_name, users: UserBranchAccessRead[] }] }`
  - `UserBranchAccessRead`: `{ access_id, user_id, user_name, full_name, role_id, role_name, is_default, access_notes?, is_active, granted_at?, granted_by?, revoked_at?, revoked_by?, created_at, updated_at? }`
  - Errors: 401, 404 not found
  - **UI Flow**: Loads grouped access list on User-Branch-Access tab. Each branch shows as expandable section with users list. Each user row shows: full_name, role_name, is_default badge, is_active badge, granted_at. Row actions: "View Details", "Revoke Access". Loading skeleton during fetch. Empty state with "Add Access" CTA.
- GET `/user-branch-accesses/{id}/`
  - 200: `UserBranchAccessRead`
  - Errors: 401, 404, 422
  - **UI Flow**: Opens UserBranchAccessDetailModal with full access information. Modal shows access details, user info, branch info, role info, and access history. "Revoke Access" button in header. Loading spinner during fetch, error state with retry.
- POST `/user-branch-accesses/`
  - Body: `{ user_id, branch_id, role_id, is_default?, access_notes?, is_active? }`
  - 200: `UserBranchAccessRead`
  - Errors: 401, 404 related not found, 422
  - **UI Flow**: "Add Access" button opens UserBranchAccessCreateModal. Form has dropdowns for user_id (UserDropdown), branch_id (BranchDropdown), role_id (RoleDropdown), and optional fields (is_default toggle, access_notes textarea, is_active toggle). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + list refresh.
- PUT `/user-branch-accesses/revoke/{id}`
  - Body: `{ user_id, access_notes? }`
  - 200: `UserBranchAccessRead` (revoked fields populated)
  - Errors: 401, 404, 422
  - **UI Flow**: "Revoke Access" button shows confirmation dialog with access details and optional access_notes field. "Cancel" and "Revoke" buttons. Revoke button shows loading spinner. Success updates the access status, refreshes list, shows success toast. Error shows error message in dialog.

### Admission Number Config (@admission_number_config_router.py)

- GET `/admission-number-config/`
  - 200: `AdmissionNumberConfigRead[]`
  - **UI Flow**: Loads admission config list on Admission Number Config tab. Table with columns: branch_name, branch_type, prefix, current_number, number_length, use_academic_year badge, is_active badge. Each row has "View", "Edit" action buttons. Loading skeleton rows during fetch. Empty state with "Create Config" CTA.
- GET `/admission-number-config/{branch_id}/{branch_type}`
  - 200: `AdmissionNumberConfigRead`
  - **UI Flow**: Opens AdmissionConfigDetailModal with full config information. Modal shows config details, branch info, and current number status. "Edit" button in header opens edit modal. Loading spinner during fetch, error state with retry.
- POST `/admission-number-config/`
  - Body: `AdmissionNumberConfigCreate` → `{ branch_id, branch_type, prefix?, number_length?, use_academic_year?, academic_year_sequence?, is_active? }`
  - 200: `AdmissionNumberConfigRead`
  - **UI Flow**: "Create Config" button opens AdmissionConfigCreateModal. Form has dropdowns for branch_id (BranchDropdown), branch_type (School/College), and optional fields (prefix, number_length, use_academic_year toggle, academic_year_sequence, is_active toggle). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- PUT `/admission-number-config/{branch_id}/{branch_type}`
  - Body: `AdmissionNumberConfigUpdate` → `{ prefix?, number_length?, use_academic_year?, academic_year_sequence?, is_active? }`
  - 200: `AdmissionNumberConfigRead`
  - **UI Flow**: AdmissionConfigEditModal opens with current values pre-filled. All fields editable except branch_id and branch_type. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.

AdmissionNumberConfigRead fields:

- `{ config_id, branch_id, branch_type, prefix, current_number, number_length, use_academic_year, academic_year_sequence?, is_active, created_at, updated_at? }`

### Common backend error notes

- 401 Unauthorized: "Invalid Credentials" when token missing/invalid
- 403 Forbidden: Lacks required roles / unauthorized to resource
- 404 Not Found: Resource doesn’t exist
- 400 Bad Request: Business rules/missing param
- 422 Validation Error: Pydantic validation failures
- 500 Internal Server Error: Unhandled exceptions

## Frontend structure

### Navigation & layout

- Sidebar: single item "User & Branch Management" under General
  - Route: `/general/user-branch`
- Page: `ManagementUserBranchPage.tsx`
  - Header with title and right-aligned actions (Create User on Users tab)
  - Sub-tabs (top): Branches | Users | Access | Roles
  - Content swaps per active tab
  - Global UI: toaster area, confirm dialog portal

### Project tree

- src/
  - api/
    - axios.ts (base instance + error normalization)
    - public/
      - branches.ts, users.ts, roles.ts, userBranchAccesses.ts
  - types/
    - branches.ts, users.ts, roles.ts, userBranchAccesses.ts
  - store/
    - branchesStore.ts, usersStore.ts, rolesStore.ts, accessStore.ts, uiStore.ts
  - components/common/
    - Modal.tsx, ConfirmDialog.tsx, DataTable.tsx, Dropdown.tsx
  - components/management/
    - BranchCard.tsx, BranchesTab.tsx
    - UsersTab.tsx, UserForm.tsx, UserDetailModal.tsx
    - AccessTab.tsx, AccessDetailModal.tsx, AccessForm.tsx
    - RolesTab.tsx
  - pages/
    - ManagementUserBranchPage.tsx
  - guard/
    - RoleGuard.tsx (checks roles → shows children or 403 state)

## Axios + error handling

- Base URL from `import.meta.env.VITE_API_BASE_URL`
- Response interceptor maps to `{ message, status, data }`
- `handleApiError(e)`: toast appropriate message and return normalized error
- No auth header wiring in this module (per requirement)

## Reusable dropdowns

- Generic `Dropdown<T>` with `{value:number,label:string}[]`, `loading`, `error`, `disabled`
- Hooks: `useRoleOptions()` → GET roles → map to options; `useBranchOptions()` → GET branches → map to options
- Sort options alphabetically; keep previously selected if still present

## Zustand stores

- usersStore: `{ list, loading, error, fetchList, fetchById, create, update, remove }`
- branchesStore: `{ list, loading, fetchList, fetchById, update, remove }`
- rolesStore: `{ list, loading, fetchList }`
- accessStore: `{ grouped, loading, fetchGrouped, fetchById, create, revoke }`
- uiStore: `{ activeTab, modals: { userDetail, userCreate, accessAssign, branchDetail, accessDetail } }`

## Smooth UI/UX details

- Styling: Tailwind neutral theme, consistent spacing, rounded-md, shadows
- Toaster (top-right): success/green, error/red, info/blue
- Dates: dayjs `DD MMM YYYY, HH:mm`
- A11y: modal focus trap, Esc to close, aria labels
- Loading: skeletons for cards/tables, button spinners on submit
- Empty states with CTAs (Users: Create User; Access: explain granting after creating users)
- Errors: map 401/403/404/400/422 to friendly toasts; 422 show field-level errors in forms

## UI flows

- Branches tab
  - Grid cards; card actions: Full View (modal), Delete
  - Modal shows summary; Edit toggle reveals form (branch_name, branch_type, address, phone, email, is_active)
  - Save → PUT and refetch; Delete → confirm → DELETE → refetch
- Users tab
  - Table: Full Name, Email, Mobile, Admin, Active, Created, Actions
  - View/Edit: modal with fields (email, mobile_no, full_name, is_institute_admin, is_active) → PUT; Delete → DELETE
  - Create: open UserForm; validate password/confirm; on success open AccessForm with `user_id`
  - AccessForm: role dropdown + branch dropdown, is_default, access_notes → POST access; allow "Grant another" UX
- Access tab
  - Accordion by branch; each shows users table with role/default/status/timestamps
  - Item View: detail modal; Revoke: confirm → PUT revoke with `{ user_id, access_notes? }` → refetch
- Roles tab
  - Read-only table with filter; no edit UI

## Minimal example snippets

```ts
// src/api/axios.ts
import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.detail || err.message || "Request failed";
    return Promise.reject({
      message: msg,
      status: err.response?.status,
      data: err.response?.data,
    });
  }
);
```

```ts
// src/api/public/users.ts

import { api } from "../axios";

export const UsersApi = {
  list: () => api.get("/api/v1/public/users").then((r) => r.data),

  get: (id: number) =>
    api.get(`/api/v1/public/users/${id}`).then((r) => r.data),

  create: (p: any) => api.post("/api/v1/public/users", p).then((r) => r.data),

  update: (id: number, p: any) =>
    api.put(`/api/v1/public/users/${id}`, p).then((r) => r.data),

  remove: (id: number) =>
    api.delete(`/api/v1/public/users/${id}`).then((r) => r.data),
};
```

## Environment

- `.env`: `VITE_API_BASE_URL=http://localhost:8000`

## Deliverables

- Page `ManagementUserBranchPage.tsx` with tabs: Branches, Users, Access, Roles
- Fully wired flows: list → detail modal → update/delete → create
- Reusable dropdowns backed by APIs
- Zustand stores; Axios with robust error handling; 403 guard
