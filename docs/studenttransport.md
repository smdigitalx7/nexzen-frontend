# Transport Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

General sidebar entry “Transport” → `/general/transport` with tabs: Bus Routes, Distance Slabs. Tab-level access, robust Axios error handling, Zustand stores, and modals.

## Tab-level Access Control

- Bus Routes
  - Visible: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
  - Actions: INSTITUTE_ADMIN, ADMIN → Create/Update/Delete; ACCOUNTANT → Read-only
- Distance Slabs
  - Visible: INSTITUTE_ADMIN, ADMIN, ACCOUNTANT
  - Actions: INSTITUTE_ADMIN, ADMIN → Create/Update/Delete; ACCOUNTANT → Read-only

## API Endpoints and Responses (Base: `/api/v1/public`)

### Bus Routes (@bus_route_router.py)

- GET `/bus-routes`
  - 200: `BusRoutesRead[]`
  - Errors: 401, 403, 422
  - **UI Flow**: Loads bus routes table on Bus Routes tab. Table columns: route_no, route_name, vehicle_number, vehicle_capacity, start_location, total_distance, estimated_duration, is_active badge. Each row has "View", "Edit", "Delete" action buttons (role-gated). Loading skeleton rows during fetch. Empty state with "Create Route" CTA. Search bar filters by route name/number.
- GET `/bus-routes/names`
  - 200: `{ bus_route_id:number, route_name:string, route_no?:string }[]`
  - Errors: 401, 403
  - **UI Flow**: Used by BusRouteDropdown component to populate route options. Fetches simplified route list for dropdown selection in other forms (reservations, transport assignments).
- GET `/bus-routes/{bus_route_id}`
  - 200: `BusRoutesRead`
  - Errors: 401, 403, 404
  - **UI Flow**: Opens BusRouteDetailModal with full route information. Modal shows route details, vehicle info, driver info, and route specifications. "Edit" and "Delete" buttons in header (role-gated). Loading spinner during fetch, error state with retry.
- POST `/bus-routes` (Admins)
  - Body: `BusRoutesCreate` → `{ vehicle_number, vehicle_capacity, registration_number, driver_employee_id, route_no, route_name, start_location, total_distance, estimated_duration, is_active? }`
  - 200: `BusRoutesRead`
  - Errors: 401, 403, 422
  - **UI Flow**: "Create Route" button opens BusRouteCreateModal. Form has required fields (vehicle_number, vehicle_capacity, route_no, route_name, start_location, total_distance, estimated_duration) and optional fields (registration_number, driver_employee_id dropdown, is_active toggle). Form validation shows inline errors. Submit shows loading spinner. Success toast + modal close + table refresh.
- PUT `/bus-routes/{bus_route_id}` (Admins)
  - Body: `BusRoutesUpdate` (all optional fields)
  - 200: `BusRoutesRead`
  - Errors: 401, 403, 404, 422
  - **UI Flow**: BusRouteEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.
- DELETE `/bus-routes/{bus_route_id}` (Admins)
  - 200: `BusRoutesRead`
  - Errors: 401, 403, 404
  - **UI Flow**: Delete confirmation dialog with route name and warning about data loss. "Cancel" and "Delete" buttons. Delete button shows loading spinner. Success closes modal, removes row from table, shows success toast. Error shows error message in dialog.

BusRoutesRead fields:

- `{ bus_route_id, vehicle_number?, vehicle_capacity, registration_number?, driver_employee_id?, route_no?, route_name?, start_location?, total_distance?, estimated_duration?, is_active?, created_at, updated_at?, created_by?, updated_by? }`

### Distance Slabs (@distance_slab_router.py)

- GET `/transport-fee-structures`
  - 200: `DistanceSlabRead[]`
  - Errors: 401, 403
  - **UI Flow**: Loads distance slabs table on Distance Slabs tab. Table columns: slab_name, min_distance, max_distance, fee_amount. Each row has "View", "Edit" action buttons (role-gated). Loading skeleton rows during fetch. Empty state with "Create Slab" CTA. Search bar filters by slab name.
- GET `/transport-fee-structures/{slab_id}`
  - 200: `DistanceSlabRead`
  - Errors: 401, 403, 404
  - **UI Flow**: Opens DistanceSlabDetailModal with full slab information. Modal shows slab details, distance range, and fee amount. "Edit" button in header (role-gated). Loading spinner during fetch, error state with retry.
- POST `/transport-fee-structures` (Admins)
  - Body: `DistanceSlabCreate` → `{ slab_name, min_distance, max_distance?, fee_amount }`
  - 200: `DistanceSlabRead`
  - Errors: 401, 403, 422
  - **UI Flow**: "Create Slab" button opens DistanceSlabCreateModal. Form has required fields (slab_name, min_distance, fee_amount) and optional max_distance field. Form validation shows inline errors (min_distance <= max_distance if provided, non-negative values). Submit shows loading spinner. Success toast + modal close + table refresh.
- PUT `/transport-fee-structures/{slab_id}` (Admins)
  - Body: `DistanceSlabUpdate`
  - 200: `DistanceSlabRead`
  - Errors: 401, 403, 404, 422
  - **UI Flow**: DistanceSlabEditModal opens with current values pre-filled. All fields editable. Form validation and submit flow same as create. Success updates detail modal and refreshes table. Optimistic update shows new values immediately.

DistanceSlabRead fields:

- `{ slab_id, slab_name, min_distance, max_distance?, fee_amount }`

### Error payloads (typical)

- Errors return `{ detail: string }` with 400/401/403/404/422/500

## UI/UX Structure

- Route: `/general/transport`
- Page: `ManagementTransportPage.tsx` with tabs: Bus Routes | Distance Slabs
- Common UX: Tailwind skeletons, button spinners, success/error toasts; a11y modals; consistent date formatting.

### Bus Routes tab

- Table: Route No, Route Name, Vehicle Number, Capacity, Start Location, Distance, Duration, Active, Actions
- Actions:
  - View (modal): GET by id
  - Create (modal): POST `/bus-routes` with driver dropdown (TeacherDropdown from `/employees/teacher-by-branch`), numeric validations
  - Edit (modal): PUT `/bus-routes/{id}`
  - Delete (confirm): DELETE `/bus-routes/{id}`
- Dropdowns: Driver (TeacherDropdown), Active (boolean)
- Loading/Empty/Error: clear states with retries

### Distance Slabs tab

- Table: Slab Name, Min Distance, Max Distance, Fee Amount, Actions
- Actions:
  - View (modal): GET by id
  - Create (modal): POST `/transport-fee-structures`
  - Edit (modal): PUT `/transport-fee-structures/{slab_id}`
- Validations: non-negative distances/fees; `min_distance <= max_distance` if provided

## State & API Clients

- API clients:
  - `busRoutes.ts`: list, listNames, get, create, update, remove
  - `distanceSlabs.ts`: list, get, create, update
- Stores:
  - `busRoutesStore.ts`: list/get/create/update/remove
  - `distanceSlabsStore.ts`: list/get/create/update
  - `uiStore.ts`: modals and tab state

## Role Gating Behavior (UI)

- Disable/hide actions not permitted for the role with tooltips.
- 401/403 in a tab shows an in-tab not-authorized state.

## Success & Error Handling

- Success toasts; refetch lists and open detail when needed.
- 422 field errors mapped to inputs (numbers/required fields) with helper text.
