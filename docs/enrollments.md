# Enrollments Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Enrollments" → `/school/enrollments` and "College / Enrollments" → `/college/enrollments`. Each manages student enrollments with different data structures and UI components while sharing common patterns.

## Tab-level Access Control

### School Enrollments

- **Visible**: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
- **Actions**:
  - Create/Update/Delete: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
  - View Details: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT

### College Enrollments

- **Visible**: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
- **Actions**:
  - Create/Update/Delete: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
  - View Details: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN

## API Endpoints and Responses (Base: /api/v1)

### School Enrollments (@school/enrollments_router.py)

#### GET `/school/enrollments` → 200: EnrollmentsPaginatedResponse

**Success Response:**

```json
{
  "enrollments": [
    {
      "class_id": 1,
      "class_name": "Class 1",
      "students": [
        {
          "enrollment_id": 1,
          "enrollment_date": "2024-04-01",
          "student_id": 1,
          "admission_no": "SCH2024001",
          "student_name": "John Doe",
          "roll_number": "001",
          "class_id": 1,
          "section_id": 1,
          "section_name": "A"
        }
      ]
    }
  ],
  "total_count": 25,
  "current_page": 1,
  "page_size": 10,
  "total_pages": 3
}
```

#### GET `/school/enrollments/{enrollment_id}` → 200: EnrollmentWithStudentDetails

**Success Response:**

```json
{
  "enrollment_id": 1,
  "student_id": 1,
  "admission_no": "SCH2024001",
  "student_name": "John Doe",
  "class_id": 1,
  "section_id": 1,
  "roll_number": "001",
  "enrollment_date": "2024-04-01",
  "promoted": false,
  "is_active": true,
  "created_at": "2024-04-01T10:00:00Z",
  "updated_at": null,
  "created_by": 1,
  "updated_by": null
}
```

#### POST `/school/enrollments` → 200: EnrollmentWithStudentDetails

**Request Body (EnrollmentCreate):**

```json
{
  "student_id": 1,
  "class_id": 1,
  "section_id": 1,
  "roll_number": "001",
  "enrollment_date": "2024-04-01",
  "is_active": true
}
```

#### PUT `/school/enrollments/{enrollment_id}` → 200: EnrollmentWithStudentDetails

**Request Body (EnrollmentUpdate):**

```json
{
  "roll_number": "002",
  "is_active": false
}
```

#### DELETE `/school/enrollments/{enrollment_id}` → 200: {success: boolean}

**Success Response:**

```json
{
  "success": true
}
```

### College Enrollments (@college/student_enrollments_router.py)

#### GET `/college/student-enrollments` → 200: EnrollmentsPaginatedResponse

**Success Response:**

```json
{
  "enrollments": [
    {
      "class_id": 1,
      "class_name": "First Year",
      "group_id": 1,
      "group_name": "Science",
      "course_id": 1,
      "course_name": "Computer Science",
      "students": [
        {
          "enrollment_id": 1,
          "enrollment_date": "2024-04-01T10:00:00Z",
          "student_id": 1,
          "admission_no": "COL2024001",
          "student_name": "John Doe",
          "roll_number": "CS001",
          "is_active": true,
          "promoted": false
        }
      ]
    }
  ],
  "total_count": 50,
  "current_page": 1,
  "page_size": 10,
  "total_pages": 5
}
```

#### GET `/college/student-enrollments/{enrollment_id}` → 200: EnrollmentWithStudentDetails

**Success Response:**

```json
{
  "enrollment_id": 1,
  "student_id": 1,
  "admission_no": "COL2024001",
  "student_name": "John Doe",
  "class_id": 1,
  "class_name": "First Year",
  "group_id": 1,
  "group_name": "Science",
  "course_id": 1,
  "course_name": "Computer Science",
  "roll_number": "CS001",
  "enrollment_date": "2024-04-01T10:00:00Z",
  "is_active": true,
  "promoted": false,
  "created_at": "2024-04-01T10:00:00Z",
  "updated_at": null,
  "created_by": 1,
  "created_by_name": "Admin User",
  "updated_by": null,
  "updated_by_name": null
}
```

#### POST `/college/student-enrollments` → 200: EnrollmentWithStudentDetails

**Request Body (EnrollmentCreate):**

```json
{
  "student_id": 1,
  "class_id": 1,
  "group_id": 1,
  "course_id": 1,
  "roll_number": "CS001",
  "enrollment_date": "2024-04-01T10:00:00Z",
  "is_active": true
}
```

#### PUT `/college/student-enrollments/{enrollment_id}` → 200: EnrollmentWithStudentDetails

**Request Body (EnrollmentUpdate):**

```json
{
  "roll_number": "CS002",
  "is_active": false
}
```

#### DELETE `/college/student-enrollments/{enrollment_id}` → 200: {success: boolean}

**Success Response:**

```json
{
  "success": true
}
```

### Common Errors

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Enrollment not found
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
      "loc": ["body", "roll_number"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Frontend Structure

### Navigation

- Sidebar: "School / Enrollments" and "College / Enrollments" sections
- Breadcrumb: School/College > Enrollments

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Enrollments/
│   │       ├── SchoolEnrollmentsList.tsx
│   │       ├── SchoolEnrollmentModal.tsx
│   │       ├── SchoolEnrollmentForm.tsx
│   │       ├── SchoolEnrollmentView.tsx
│   │       └── SchoolEnrollmentCard.tsx
│   ├── college/
│   │   └── Enrollments/
│   │       ├── CollegeEnrollmentsList.tsx
│   │       ├── CollegeEnrollmentModal.tsx
│   │       ├── CollegeEnrollmentForm.tsx
│   │       ├── CollegeEnrollmentView.tsx
│   │       └── CollegeEnrollmentCard.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── GroupDropdown.tsx
│       │   ├── CourseDropdown.tsx
│       │   ├── SectionDropdown.tsx
│       │   └── StudentDropdown.tsx
│       ├── Forms/
│       │   ├── EnrollmentBasicInfoForm.tsx
│       │   ├── EnrollmentAcademicInfoForm.tsx
│       │   └── EnrollmentStatusForm.tsx
│       ├── DataTable.tsx
│       ├── CardGrid.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   └── enrollmentsStore.ts
│   ├── college/
│   │   └── enrollmentsStore.ts
│   └── uiStore.ts
├── api/
│   ├── school/
│   │   └── enrollments.ts
│   └── college/
│       └── enrollments.ts
└── pages/
    ├── SchoolEnrollments.tsx
    └── CollegeEnrollments.tsx
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
- **SectionDropdown**: Fetches sections by class, searchable, with loading states
- **StudentDropdown**: Fetches students list for enrollment selection
- All dropdowns support controlled/uncontrolled modes and custom styling

## Zustand Store Architecture

### School Enrollments Store

- State: list, loading, error, current item, pagination, filters
- Actions: fetchList, fetchById, fetchByAdmissionNo, create, update, delete
- Optimistic updates for better UX

### College Enrollments Store

- State: list, loading, error, current item, pagination, filters
- Actions: fetchList, fetchById, fetchByAdmissionNo, create, update, delete
- Optimistic updates for better UX

### UI Store

- State: active tab, modal states, form states, selected filters
- Actions: setActiveTab, openModal, closeModal, setFormData, setFilters
- Centralized UI state management

## UI/UX Design Specifications

### Layout Structure

- **Header**: Page title with breadcrumb navigation
- **Content Area**: Enrollments list with search and filters
- **Action Bar**: Top-right positioned create button and filters
- **Data Display**: Card grid or table view with pagination

### School Enrollments Page

#### Enrollments List Section

- **Card Grid View**: Enrollments grouped by class with section cards
- **Class Cards**: Each class shows as a card with:
  - Class name as header
  - Student count badge
  - Section breakdown
  - Action buttons (view all, add student)
- **Section Cards**: Within each class card:
  - Section name
  - Student count
  - Student list (admission no, name, roll number)
  - Individual student actions (view, edit, remove)
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter, section filter, enrollment date range filter
- **Pagination**: Standard pagination controls

#### View Modal

- **Full Details**: All enrollment information in organized sections:
  1. **Student Information**: Name, admission no, roll number
  2. **Academic Information**: Class, section, enrollment date
  3. **Status Information**: Active status, promotion status
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Delete, Close

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Create Modal

- **Form Layout**: Multi-step form with sections:
  1. **Student Selection**: Student dropdown (existing students)
  2. **Academic Information**: Class, section selection
  3. **Enrollment Information**: Roll number, enrollment date, active status
- **Form Validation**:
  - Required field validation
  - Roll number uniqueness validation
  - Date validation (enrollment date)

### College Enrollments Page

#### Enrollments List Section

- **Table View**: Columns for admission no, student name, class, group, course, roll number, enrollment date, status, actions
- **Status Badge**: Color-coded status indicators
- **Actions Column**: View, Edit, Delete buttons
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter, group filter, course filter, status filter, enrollment date range filter
- **Pagination**: Standard pagination controls

#### View Modal

- **Full Details**: All enrollment information in organized sections:
  1. **Student Information**: Name, admission no, roll number
  2. **Academic Information**: Class, group, course, enrollment date
  3. **Status Information**: Active status, promotion status
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Delete, Close

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Create Modal

- **Form Layout**: Multi-step form with sections:
  1. **Student Selection**: Student dropdown (existing students)
  2. **Academic Information**: Class, group, course selection
  3. **Enrollment Information**: Roll number, enrollment date, active status
- **Form Validation**:
  - Required field validation
  - Roll number uniqueness validation
  - Date validation (enrollment date)

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

- **No Data**: Friendly illustration with "No enrollments found" message
- **No Filters**: Show all enrollments when no filters applied
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

- **School Enrollments**:
  - Class-Section based structure
  - Card grid view with class grouping
  - Section-level student management
  - Simpler academic structure
- **College Enrollments**:
  - Class-Group-Course based structure
  - Table view for complex relationships
  - Course-level student management
  - More complex academic structure

### Reusable Component Strategy

- **Shared Forms**: EnrollmentBasicInfoForm, EnrollmentAcademicInfoForm, EnrollmentStatusForm
- **Shared UI**: DataTable, CardGrid, Modal, FormField, LoadingSpinner
- **Shared Dropdowns**: ClassDropdown, GroupDropdown, CourseDropdown, SectionDropdown, StudentDropdown
- **Shared Validation**: Common validation rules for enrollment data
- **Shared Styling**: Consistent form and table styling across modules

### Data Display Strategies

- **School**: Card-based layout showing class → section → students hierarchy
- **College**: Table-based layout showing all enrollment details in columns
- **Responsive**: Both adapt to mobile with stacked layouts
- **Filtering**: Both support class/group filtering with different options
- **Search**: Both support global search across student information

This comprehensive UI specification ensures a consistent, accessible, and user-friendly experience for both School and College Enrollments while maintaining proper role-based access control and smooth data management workflows with reusable components and appropriate data display strategies for each system's complexity.

## References

- Reusable dropdown components (Class, Section, Group, Course, Subject): see [Reusable Dropdowns](./dropdowns.md).
