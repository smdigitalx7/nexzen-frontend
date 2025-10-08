# Reservations Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Reservations" → `/school/reservations` and "College / Reservations" → `/college/reservations`. Each has a reservations form and reservations list with role-based actions for concessions and status updates.

## Tab-level Access Control

### School Reservations

- **Visible**: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
- **Actions**:
  - Create/Update/Delete: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
  - Concession Updates: ADMIN, INSTITUTE_ADMIN
  - Status Updates: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT

### College Reservations

- **Visible**: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
- **Actions**:
  - Create/Update/Delete: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT
  - Concession Updates: ADMIN, INSTITUTE_ADMIN
  - Status Updates: ADMIN, INSTITUTE_ADMIN, ACCOUNTANT

## API Endpoints and Responses (Base: /api/v1)

### School Reservations (@school/reservations_router.py)

- GET `/school/reservations` → 200: ReservationListResponse; 401/403/500
- GET `/school/reservations/{reservation_id}` → 200: ReservationRead; 401/403/500
- POST `/school/reservations` → 200: ReservationRead; 401/403/500
- PUT `/school/reservations/{reservation_id}` → 200: ReservationRead; 401/403/500
- PUT `/school/reservations/{reservation_id}/consession` → 200: ReservationRead; 401/403/500
- PUT `/school/reservations/{reservation_id}/status` → 200: ReservationRead; 401/403/500
- DELETE `/school/reservations/{reservation_id}` → 200: ReservationRead; 401/403/500

### College Reservations (@college/reservations_router.py)

- GET `/college/reservations` → 200: PaginatedReservationRead; 401/403/500
- GET `/college/reservations/{reservation_id}` → 200: ReservationRead; 401/403/500
- POST `/college/reservations` → 200: ReservationRead; 401/403/500
- PUT `/college/reservations/{reservation_id}` → 200: ReservationRead; 401/403/500
- PUT `/college/reservations/{reservation_id}/concessions` → 200: ReservationRead; 401/403/500
- PUT `/college/reservations/{reservation_id}/status` → 200: ReservationRead; 401/403/500
- DELETE `/college/reservations/{reservation_id}` → 200: {success: boolean}; 401/403/500

### Common Errors

- Errors return { detail: string } with 400/401/403/404/422/500; map 422 to field errors and 401/403 to an in-tab not-authorized state.

## Frontend Structure

### Navigation

- Sidebar: "School / Reservations" and "College / Reservations" sections
- Breadcrumb: School/College > Reservations

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Reservations/
│   │       ├── SchoolReservationForm.tsx
│   │       ├── SchoolReservationsList.tsx
│   │       ├── SchoolReservationModal.tsx
│   │       ├── SchoolReservationView.tsx
│   │       ├── SchoolConcessionModal.tsx
│   │       └── SchoolStatusModal.tsx
│   ├── college/
│   │   └── Reservations/
│   │       ├── CollegeReservationForm.tsx
│   │       ├── CollegeReservationsList.tsx
│   │       ├── CollegeReservationModal.tsx
│   │       ├── CollegeReservationView.tsx
│   │       ├── CollegeConcessionModal.tsx
│   │       └── CollegeStatusModal.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── GroupDropdown.tsx
│       │   ├── CourseDropdown.tsx
│       │   ├── BusRouteDropdown.tsx
│       │   ├── DistanceSlabDropdown.tsx
│       │   └── ReferredByDropdown.tsx
│       ├── Forms/
│       │   ├── StudentInfoForm.tsx
│       │   ├── ParentInfoForm.tsx
│       │   ├── SiblingsForm.tsx
│       │   ├── AcademicInfoForm.tsx
│       │   ├── FeeInfoForm.tsx
│       │   └── TransportInfoForm.tsx
│       ├── DataTable.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   └── reservationsStore.ts
│   ├── college/
│   │   └── reservationsStore.ts
│   └── uiStore.ts
├── api/
│   ├── school/
│   │   └── reservations.ts
│   └── college/
│       └── reservations.ts
└── pages/
    ├── SchoolReservations.tsx
    └── CollegeReservations.tsx
```

## Axios Setup

- Base axios instance with interceptors for auth tokens and error handling
- Response interceptor normalizes errors to consistent format
- Request interceptor adds auth headers from Zustand auth store
- Error handling utility for field-level validation and user-friendly messages

## Reusable Dropdowns

- **ClassDropdown**: Fetches school classes list, searchable, with loading states
- **GroupDropdown**: Fetches college groups list, searchable, with loading states
- **CourseDropdown**: Fetches college courses list, searchable, with loading states
- **BusRouteDropdown**: Fetches bus routes list, searchable, with loading states
- **DistanceSlabDropdown**: Fetches distance slabs list, searchable, with loading states
- **ReferredByDropdown**: Fetches users list for referral selection
- All dropdowns support controlled/uncontrolled modes and custom styling

## Zustand Store Architecture

### School Reservations Store

- State: list, loading, error, current item, pagination
- Actions: fetchList, fetchById, create, update, delete, updateConcession, updateStatus
- Optimistic updates for better UX

### College Reservations Store

- State: list, loading, error, current item, pagination
- Actions: fetchList, fetchById, create, update, delete, updateConcessions, updateStatus
- Optimistic updates for better UX

### UI Store

- State: active tab, modal states, form states, selected filters
- Actions: setActiveTab, openModal, closeModal, setFormData, setFilters
- Centralized UI state management

## UI/UX Design Specifications

### Layout Structure

- **Header**: Page title with breadcrumb navigation
- **Content Area**: Two main sections - Form and List
- **Form Section**: Top section with reservation creation form
- **List Section**: Bottom section with reservations table
- **Action Bar**: Top-right positioned filters and export buttons

### School Reservations Page

#### Reservation Form Section

- **Form Layout**: Multi-step form with sections:

  1. **Student Information**: Name, Aadhar, Gender, DOB
  2. **Parent Information**: Father and Mother details with Aadhar and mobile
  3. **Siblings Information**: Dynamic list of siblings with add/remove
  4. **Academic Information**: Previous class, school details, admit into, admission group
  5. **Address Information**: Present and permanent address
  6. **Fee Information**: Reservation fee, preferred class, tuition fee, book fee, concessions
  7. **Transport Information**: Bus route, distance slab, transport fee, concessions
  8. **Additional Information**: Status, referred by, reservation date

- **Dynamic Fee Calculation**:

  - Class dropdown triggers fee amount fetch
  - Bus route + distance slab dropdown triggers transport fee calculation
  - Real-time total calculation display

- **Form Validation**:
  - Required field validation
  - Aadhar number format validation
  - Mobile number format validation
  - Date validation (DOB, reservation date)
  - Fee amount validation (positive numbers)

#### Reservations List Section

- **Table View**: Columns for student name, class, status, reservation date, actions
- **Status Badge**: Color-coded status indicators
- **Actions Column**: View, Edit, Concession, Status buttons (role-based visibility)
- **Filters**: Class filter, status filter, date range filter
- **Pagination**: Standard pagination controls

#### View Modal

- **Full Details**: All reservation information in organized sections
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Concession, Status, Delete (role-based)

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Concession Modal

- **Transport Concession**: Input field for transport concession amount
- **Tuition Concession**: Input field for tuition concession amount
- **Remarks**: Text area for concession remarks
- **Role Restriction**: Only ADMIN, INSTITUTE_ADMIN can access

#### Status Modal

- **Status Dropdown**: Available status options
- **Remarks**: Text area for status change remarks
- **Confirmation**: Confirm status change action

### College Reservations Page

#### Reservation Form Section

- **Form Layout**: Similar to school but with college-specific fields:

  1. **Student Information**: Same as school
  2. **Parent Information**: Same as school
  3. **Siblings Information**: Same as school
  4. **Academic Information**: Previous class, school details
  5. **Address Information**: Present and permanent address
  6. **Fee Information**: Reservation fee, preferred group, preferred course, group fee, course fee, book fee, total tuition fee
  7. **Transport Information**: Bus route, distance slab, pickup point, transport fee
  8. **Additional Information**: Status, referred by, remarks

- **Dynamic Fee Calculation**:
  - Group dropdown triggers group fee fetch
  - Course dropdown triggers course fee fetch
  - Bus route + distance slab dropdown triggers transport fee calculation
  - Real-time total calculation display

#### Reservations List Section

- **Table View**: Columns for student name, group, course, status, reservation date, actions
- **Status Badge**: Color-coded status indicators
- **Actions Column**: View, Edit, Concessions, Status buttons (role-based visibility)
- **Filters**: Group filter, course filter, status filter, date range filter
- **Pagination**: Standard pagination controls

#### View Modal

- **Full Details**: All reservation information in organized sections
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Concessions, Status, Delete (role-based)

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Concessions Modal

- **Transport Concession**: Input field for transport concession amount
- **Tuition Concession**: Input field for tuition concession amount
- **Remarks**: Text area for concession remarks
- **Role Restriction**: Only ADMIN, INSTITUTE_ADMIN can access

#### Status Modal

- **Status Dropdown**: Available status options
- **Remarks**: Text area for status change remarks
- **Confirmation**: Confirm status change action

### Modal Design System

- **Overlay**: Semi-transparent dark background
- **Modal Container**: Centered, max-width responsive design
- **Header**: Title with close button (X)
- **Body**: Scrollable content area
- **Footer**: Action buttons (Cancel, Save/Submit)
- **Animation**: Smooth fade-in/out transitions
- **Accessibility**: Focus trap, escape key to close, ARIA labels

### Form Design Patterns

- **Multi-step Layout**: Tabbed or accordion-style form sections
- **Field Layout**: Vertical stacking with consistent spacing
- **Label Design**: Bold labels above input fields
- **Input Styling**: Rounded corners, focus states, error states
- **Validation**: Real-time validation with inline error messages
- **Button Styling**: Primary buttons for main actions, secondary for cancel
- **Loading States**: Disabled form during submission with spinner

### Loading States

- **Skeleton Loaders**: For table rows and form sections
- **Spinner Overlays**: For modal forms during submission
- **Progressive Loading**: Load data in chunks for large lists
- **Optimistic Updates**: Update UI immediately, rollback on error

### Empty States

- **No Data**: Friendly illustration with "No reservations found" message
- **No Filters**: Show all reservations when no filters applied
- **Error States**: Clear error messages with retry buttons
- **Success States**: Toast notifications for successful operations

### Responsive Design

- **Mobile**: Stacked layout, full-width modals, touch-friendly buttons
- **Tablet**: Adjusted column widths, optimized modal sizes
- **Desktop**: Full table view, side-by-side panels in modals
- **Breakpoints**: Tailwind CSS responsive utilities

### Accessibility Features

- **Keyboard Navigation**: Tab order, enter to submit, escape to close
- **Screen Reader**: ARIA labels, role attributes, live regions for updates
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Visible focus indicators, focus trap in modals
- **Alternative Text**: Descriptive alt text for icons and images

### Error Handling UI

- **Field Errors**: Red border, error message below field
- **Form Errors**: Error banner at top of form
- **Network Errors**: Toast notification with retry option
- **Permission Errors**: Inline message explaining insufficient permissions
- **Validation Errors**: Real-time feedback as user types

### Success Feedback

- **Toast Notifications**: Success messages for all operations
- **Visual Confirmation**: Check marks, success animations
- **Data Refresh**: Automatic list refresh after successful operations
- **Progress Indicators**: Loading states during async operations

### Performance Optimizations

- **Lazy Loading**: Load form sections only when needed
- **Debounced Search**: Delay API calls for search inputs
- **Caching**: Store API responses in Zustand for faster subsequent loads
- **Pagination**: Load data in pages for large datasets
- **Memoization**: Prevent unnecessary re-renders with React.memo

### Fee Calculation Logic

- **Real-time Updates**: Fee amounts update as dropdowns change
- **Validation**: Ensure calculated amounts are positive
- **Display**: Show breakdown of all fees with total
- **Concessions**: Apply concessions to relevant fee types
- **Error Handling**: Handle cases where fee data is unavailable

### Role-based UI Elements

- **Action Buttons**: Show/hide based on user role
- **Form Fields**: Enable/disable based on permissions
- **Modal Access**: Restrict access to concession and status modals
- **Delete Actions**: Only show for users with delete permissions
- **Visual Indicators**: Clear indication of user's permission level

## References

- Reusable dropdown components (Class, Group, Course, Section, Bus Route, Slab): see [Reusable Dropdowns](./dropdowns.md).

This comprehensive UI specification ensures a consistent, accessible, and user-friendly experience for both School and College Reservations while maintaining proper role-based access control and smooth data management workflows with dynamic fee calculations and relationship management.
