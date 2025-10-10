# Transports Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Transports" → `/school/transports` and "College / Transports" → `/college/transports`. Each manages student transport assignments with different data structures and UI components while sharing common patterns.

## Tab-level Access Control

### School Transports

- **Visible**: All authenticated users (uses get_current_user)
- **Actions**:
  - Create/Update/Delete: All authenticated users
  - View Details: All authenticated users

### College Transports

- **Visible**: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
- **Actions**:
  - Create/Update/Delete: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
  - View Details: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN

## API Endpoints and Responses (Base: /api/v1)

### School Transports (@school/student_transport_router.py)

#### GET `/school/student-transport` → 200: List[StudentTransportRouteWiseResponse]

**Success Response:**

```json
[
  {
    "bus_route_id": 1,
    "route_name": "Route A",
    "classes": [
      {
        "class_id": 1,
        "class_name": "Class 1",
        "students": [
          {
            "transport_assignment_id": 1,
            "enrollment_id": 1,
            "admission_no": "SCH2024001",
            "student_name": "John Doe",
            "roll_number": "001",
            "section_name": "A",
            "slab_name": "0-5 km",
            "pickup_point": "Main Gate",
            "is_active": true
          }
        ]
      }
    ]
  }
]
```

#### GET `/school/student-transport/{transport_assignment_id}` → 200: StudentTransportAssignmentRead

**Success Response:**

```json
{
  "transport_assignment_id": 1,
  "enrollment_id": 1,
  "bus_route_id": 1,
  "route_name": "Route A",
  "slab_id": 1,
  "slab_name": "0-5 km",
  "admission_no": "SCH2024001",
  "student_name": "John Doe",
  "roll_number": "001",
  "class_name": "Class 1",
  "section_name": "A",
  "pickup_point": "Main Gate",
  "start_date": "2024-04-01",
  "end_date": null,
  "is_active": true,
  "created_at": "2024-04-01T10:00:00Z",
  "updated_at": null,
  "created_by": 1,
  "updated_by": null
}
```

#### POST `/school/student-transport` → 200: StudentTransportAssignmentRead

**Request Body (StudentTransportAssignmentCreate):**

```json
{
  "enrollment_id": 1,
  "bus_route_id": 1,
  "slab_id": 1,
  "pickup_point": "Main Gate",
  "start_date": "2024-04-01",
  "end_date": null,
  "is_active": true
}
```

#### PUT `/school/student-transport/{transport_assignment_id}` → 200: StudentTransportAssignmentRead

**Request Body (StudentTransportAssignmentUpdate):**

```json
{
  "pickup_point": "New Gate",
  "is_active": false
}
```

#### GET `/school/student-transport/by-admission/{admission_no}` → 200: StudentTransportAssignmentRead

**Success Response:** Same as individual transport assignment

### College Transports (@college/student_transport_assignments_router.py)

#### GET `/college/student-transport-assignments` → 200: List[StudentTransportAssignmentWithRoute]

**Success Response:**

```json
[
  {
    "bus_route_id": 1,
    "route_name": "Route A",
    "groups": [
      {
        "class_id": 1,
        "class_name": "First Year",
        "group_id": 1,
        "group_name": "Science",
        "students": [
          {
            "transport_assignment_id": 1,
            "enrollment_id": 1,
            "slab_id": 1,
            "slab_name": "0-5 km",
            "admission_no": "COL2024001",
            "student_name": "John Doe",
            "roll_number": "CS001",
            "pickup_point": "Main Gate",
            "start_date": "2024-04-01",
            "end_date": null,
            "is_active": true
          }
        ]
      }
    ]
  }
]
```

#### GET `/college/student-transport-assignments/{transport_assignment_id}` → 200: StudentTransportFullResponse

**Success Response:**

```json
{
  "transport_assignment_id": 1,
  "enrollment_id": 1,
  "bus_route_id": 1,
  "route_name": "Route A",
  "slab_id": 1,
  "slab_name": "0-5 km",
  "class_name": "First Year",
  "section_name": "A",
  "group_id": 1,
  "group_name": "Science",
  "admission_no": "COL2024001",
  "student_name": "John Doe",
  "roll_number": "CS001",
  "pickup_point": "Main Gate",
  "start_date": "2024-04-01",
  "end_date": null,
  "is_active": true,
  "created_at": "2024-04-01T10:00:00Z",
  "updated_at": null,
  "created_by": 1
}
```

#### POST `/college/student-transport-assignments` → 200: StudentTransportFullResponse

**Request Body (StudentTransportAssignmentCreate):**

```json
{
  "enrollment_id": 1,
  "bus_route_id": 1,
  "slab_id": 1,
  "pickup_point": "Main Gate",
  "start_date": "2024-04-01",
  "end_date": null,
  "is_active": true
}
```

#### PUT `/college/student-transport-assignments/{transport_assignment_id}` → 200: StudentTransportFullResponse

**Request Body (StudentTransportAssignmentUpdate):**

```json
{
  "pickup_point": "New Gate",
  "is_active": false
}
```

#### DELETE `/college/student-transport-assignments/{transport_assignment_id}` → 200: {success: boolean, message: string}

**Success Response:**

```json
{
  "success": true,
  "message": "Transport assignment deleted successfully"
}
```

### Common Errors

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Transport assignment not found
- **422 Unprocessable Entity**: Validation errors with field details
- **500 Internal Server Error**: Server-side error

**Error Response Format:**

```json
{
  "detail": "Error message description"
}
```

**422 Validation Error Format:**

```json
{
  "detail": [
    {
      "loc": ["body", "enrollment_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Frontend Structure

### Navigation

- Sidebar: "School / Transports" and "College / Transports" sections
- Breadcrumb: School/College > Transports

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Transports/
│   │       ├── SchoolTransportsList.tsx
│   │       ├── SchoolTransportModal.tsx
│   │       ├── SchoolTransportForm.tsx
│   │       ├── SchoolTransportView.tsx
│   │       └── SchoolTransportCard.tsx
│   ├── college/
│   │   └── Transports/
│   │       ├── CollegeTransportsList.tsx
│   │       ├── CollegeTransportModal.tsx
│   │       ├── CollegeTransportForm.tsx
│   │       ├── CollegeTransportView.tsx
│   │       └── CollegeTransportCard.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── GroupDropdown.tsx
│       │   ├── BusRouteDropdown.tsx
│       │   ├── DistanceSlabDropdown.tsx
│       │   ├── SectionDropdown.tsx
│       │   └── StudentDropdown.tsx
│       ├── Forms/
│       │   ├── TransportAssignmentForm.tsx
│       │   ├── TransportFiltersForm.tsx
│       │   └── TransportStatusForm.tsx
│       ├── DataTable.tsx
│       ├── CardGrid.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   └── transportsStore.ts
│   ├── college/
│   │   └── transportsStore.ts
│   └── uiStore.ts
├── api/
│   ├── school/
│   │   └── transports.ts
│   └── college/
│       └── transports.ts
└── pages/
    ├── SchoolTransports.tsx
    └── CollegeTransports.tsx
```

## Axios Setup

- Base axios instance with interceptors for auth tokens and error handling
- Response interceptor normalizes errors to consistent format
- Request interceptor adds auth headers from Zustand auth store
- Error handling utility for field-level validation and user-friendly messages

## Reusable Dropdowns

- **ClassDropdown**: Fetches school classes list, searchable, with loading states
- **GroupDropdown**: Fetches college groups list, searchable, with loading states
- **BusRouteDropdown**: Fetches bus routes list, searchable, with loading states
- **DistanceSlabDropdown**: Fetches distance slabs list, searchable, with loading states
- **SectionDropdown**: Fetches sections by class, searchable, with loading states
- **StudentDropdown**: Fetches students list for transport assignment selection
- All dropdowns support controlled/uncontrolled modes and custom styling

## Zustand Store Architecture

### School Transports Store

- State: list, loading, error, current item, filters
- Actions: fetchList, fetchById, fetchByAdmissionNo, create, update
- Optimistic updates for better UX

### College Transports Store

- State: list, loading, error, current item, filters
- Actions: fetchList, fetchById, create, update, delete
- Optimistic updates for better UX

### UI Store

- State: active tab, modal states, form states, selected filters
- Actions: setActiveTab, openModal, closeModal, setFormData, setFilters
- Centralized UI state management

## UI/UX Design Specifications

### Layout Structure

- **Header**: Page title with breadcrumb navigation
- **Content Area**: Transport assignments list with search and filters
- **Action Bar**: Top-right positioned create button and filters
- **Data Display**: Route-based card grid or table view with pagination

### School Transports Page

#### Transports List Section

- **Route-based Card Grid**: Transport assignments grouped by bus routes
- **Route Cards**: Each route shows as a card with:
  - Route name as header
  - Student count badge
  - Class breakdown
  - Action buttons (view all, add student)
- **Class Cards**: Within each route card:
  - Class name
  - Student count
  - Student list (admission no, name, roll number, section, slab, pickup point)
  - Individual student actions (view, edit, remove)
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter, section filter, bus route filter, distance slab filter
- **Create Button**: Floating action button in top-right corner

#### View Modal

- **Full Details**: All transport assignment information in organized sections:
  1. **Student Information**: Name, admission no, roll number, class, section
  2. **Transport Information**: Bus route, distance slab, pickup point
  3. **Assignment Information**: Start date, end date, active status
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Close

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Create Modal

- **Form Layout**: Multi-step form with sections:
  1. **Student Selection**: Student dropdown (existing enrolled students)
  2. **Transport Information**: Bus route, distance slab, pickup point
  3. **Assignment Information**: Start date, end date, active status
- **Form Validation**:
  - Required field validation
  - Date validation (start date, end date)
  - Unique assignment validation

### College Transports Page

#### Transports List Section

- **Route-based Card Grid**: Transport assignments grouped by bus routes
- **Route Cards**: Each route shows as a card with:
  - Route name as header
  - Student count badge
  - Group breakdown
  - Action buttons (view all, add student)
- **Group Cards**: Within each route card:
  - Class and group name
  - Student count
  - Student list (admission no, name, roll number, slab, pickup point)
  - Individual student actions (view, edit, delete)
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter, group filter, bus route filter, distance slab filter
- **Create Button**: Floating action button in top-right corner

#### View Modal

- **Full Details**: All transport assignment information in organized sections:
  1. **Student Information**: Name, admission no, roll number, class, group
  2. **Transport Information**: Bus route, distance slab, pickup point
  3. **Assignment Information**: Start date, end date, active status
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Delete, Close

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Create Modal

- **Form Layout**: Multi-step form with sections:
  1. **Student Selection**: Student dropdown (existing enrolled students)
  2. **Transport Information**: Bus route, distance slab, pickup point
  3. **Assignment Information**: Start date, end date, active status
- **Form Validation**:
  - Required field validation
  - Date validation (start date, end date)
  - Unique assignment validation

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

- **Skeleton Loaders**: For table rows and card grids
- **Spinner Overlays**: For modal forms during submission
- **Progressive Loading**: Load data in chunks for large lists
- **Optimistic Updates**: Update UI immediately, rollback on error

### Empty States

- **No Data**: Friendly illustration with "No transport assignments found" message
- **No Filters**: Show all assignments when no filters applied
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

### Key Differences Between School & College

- **School Transports**:
  - Class-Section based structure
  - Route → Class → Students hierarchy
  - No delete functionality
  - All authenticated users can access
- **College Transports**:
  - Class-Group based structure
  - Route → Group → Students hierarchy
  - Delete functionality available
  - Role-based access (ADMIN, ACCOUNTANT, INSTITUTE_ADMIN)

### Reusable Component Strategy

- **Shared Forms**: TransportAssignmentForm, TransportFiltersForm, TransportStatusForm
- **Shared UI**: DataTable, CardGrid, Modal, FormField, LoadingSpinner
- **Shared Dropdowns**: ClassDropdown, GroupDropdown, BusRouteDropdown, DistanceSlabDropdown, SectionDropdown, StudentDropdown
- **Shared Validation**: Common validation rules for transport assignment data
- **Shared Styling**: Consistent form and table styling across modules

### Data Display Strategies

- **School**: Route-based card layout showing route → class → students hierarchy
- **College**: Route-based card layout showing route → group → students hierarchy
- **Responsive**: Both adapt to mobile with stacked layouts
- **Filtering**: Both support class/group and route filtering with different options
- **Search**: Both support global search across student information

### Filter Implementation

- **Class Filter**: Dropdown to filter by class (school) or class (college)
- **Group Filter**: Dropdown to filter by group (college only)
- **Section Filter**: Dropdown to filter by section (school only)
- **Route Filter**: Dropdown to filter by bus route
- **Slab Filter**: Dropdown to filter by distance slab
- **Active Filter**: Toggle to show only active assignments
- **Date Range Filter**: Date picker for start/end date filtering

This comprehensive UI specification ensures a consistent, accessible, and user-friendly experience for both School and College Transports while maintaining proper role-based access control and smooth data management workflows with reusable components and appropriate data display strategies for each system's complexity.

## References

- Reusable dropdown components (Class, Section, Bus Route, Slab): see [Reusable Dropdowns](./dropdowns.md).
