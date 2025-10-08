# Students Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Students" → `/school/students` and "College / Students" → `/college/students`. Each manages student records with different data structures and UI components while sharing common patterns.

## Tab-level Access Control

### School Students

- **Visible**: ADMIN, ACADEMIC, ACCOUNTANT
- **Actions**:
  - Create/Update/Delete: ADMIN, ACADEMIC, ACCOUNTANT
  - View Details: ADMIN, ACADEMIC, ACCOUNTANT

### College Students

- **Visible**: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
- **Actions**:
  - Create/Update/Delete: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
  - View Details: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN

## API Endpoints and Responses (Base: /api/v1)

### School Students (@school/students_router.py)

#### GET `/school/students` → 200: StudentsPaginatedResponse

**Success Response:**

```json
{
  "data": [
    {
      "student_id": 1,
      "admission_no": "SCH2024001",
      "student_name": "John Doe",
      "aadhar_no": "123456789012",
      "gender": "Male",
      "dob": "2010-05-15",
      "present_address": "123 Main St, City",
      "admission_date": "2024-04-01",
      "father_mobile": "9876543210",
      "mother_mobile": "9876543211",
      "status": "Active",
      "created_at": "2024-04-01T10:00:00Z",
      "updated_at": null,
      "created_by": 1,
      "updated_by": null
    }
  ],
  "total_pages": 5,
  "current_page": 1,
  "page_size": 10
}
```

#### GET `/school/students/{student_id}` → 200: StudentFullDetails

**Success Response:**

```json
{
  "student_id": 1,
  "admission_no": "SCH2024001",
  "student_name": "John Doe",
  "aadhar_no": "123456789012",
  "gender": "Male",
  "dob": "2010-05-15",
  "present_address": "123 Main St, City",
  "permanent_address": "123 Main St, City",
  "admission_date": "2024-04-01",
  "status": "Active",
  "father_name": "Robert Doe",
  "father_aadhar_no": "123456789013",
  "father_mobile": "9876543210",
  "father_occupation": "Engineer",
  "mother_name": "Jane Doe",
  "mother_aadhar_no": "123456789014",
  "mother_mobile": "9876543211",
  "mother_occupation": "Teacher",
  "created_at": "2024-04-01T10:00:00Z",
  "updated_at": null,
  "created_by": 1,
  "updated_by": null
}
```

#### POST `/school/students` → 200: StudentRead

**Request Body (StudentCreate):**

```json
{
  "student_name": "John Doe",
  "aadhar_no": "123456789012",
  "gender": "Male",
  "dob": "2010-05-15",
  "father_name": "Robert Doe",
  "father_aadhar_no": "123456789013",
  "father_mobile": "9876543210",
  "father_occupation": "Engineer",
  "mother_name": "Jane Doe",
  "mother_aadhar_no": "123456789014",
  "mother_mobile": "9876543211",
  "mother_occupation": "Teacher",
  "present_address": "123 Main St, City",
  "permanent_address": "123 Main St, City",
  "admission_date": "2024-04-01",
  "status": "Active"
}
```

#### PUT `/school/students/{student_id}` → 200: StudentRead

**Request Body (StudentUpdate):**

```json
{
  "student_name": "John Doe Updated",
  "father_mobile": "9876543212",
  "status": "Inactive"
}
```

### College Students (@college/student_enrollments_router.py)

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
- **404 Not Found**: Student/enrollment not found
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
      "loc": ["body", "student_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Frontend Structure

### Navigation

- Sidebar: "School / Students" and "College / Students" sections
- Breadcrumb: School/College > Students

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Students/
│   │       ├── SchoolStudentsList.tsx
│   │       ├── SchoolStudentModal.tsx
│   │       ├── SchoolStudentForm.tsx
│   │       └── SchoolStudentView.tsx
│   ├── college/
│   │   └── Students/
│   │       ├── CollegeStudentsList.tsx
│   │       ├── CollegeStudentModal.tsx
│   │       ├── CollegeStudentForm.tsx
│   │       └── CollegeStudentView.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── GroupDropdown.tsx
│       │   ├── CourseDropdown.tsx
│       │   ├── SectionDropdown.tsx
│       │   └── StudentDropdown.tsx
│       ├── Forms/
│       │   ├── StudentBasicInfoForm.tsx
│       │   ├── StudentParentInfoForm.tsx
│       │   ├── StudentAddressForm.tsx
│       │   ├── StudentAcademicInfoForm.tsx
│       │   └── StudentStatusForm.tsx
│       ├── DataTable.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   └── studentsStore.ts
│   ├── college/
│   │   └── studentsStore.ts
│   └── uiStore.ts
├── api/
│   ├── school/
│   │   └── students.ts
│   └── college/
│       └── students.ts
└── pages/
    ├── SchoolStudents.tsx
    └── CollegeStudents.tsx
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

### School Students Store

- State: list, loading, error, current item, pagination
- Actions: fetchList, fetchById, fetchByAdmissionNo, create, update
- Optimistic updates for better UX

### College Students Store

- State: list, loading, error, current item, pagination
- Actions: fetchList, fetchById, fetchByAdmissionNo, create, update, delete
- Optimistic updates for better UX

### UI Store

- State: active tab, modal states, form states, selected filters
- Actions: setActiveTab, openModal, closeModal, setFormData, setFilters
- Centralized UI state management

## UI/UX Design Specifications

### Layout Structure

- **Header**: Page title with breadcrumb navigation
- **Content Area**: Students list with search and filters
- **Action Bar**: Top-right positioned create button and filters
- **Data Display**: Table view with pagination

### School Students Page

#### Students List Section

- **Table View**: Columns for admission no, student name, gender, DOB, father mobile, mother mobile, status, admission date, actions
- **Status Badge**: Color-coded status indicators
- **Actions Column**: View, Edit buttons
- **Search**: Global search across student name, admission no, father mobile
- **Filters**: Status filter, admission date range filter
- **Pagination**: Standard pagination controls

#### View Modal

- **Full Details**: All student information in organized sections:
  1. **Basic Information**: Name, admission no, Aadhar, gender, DOB
  2. **Parent Information**: Father and Mother details
  3. **Address Information**: Present and permanent address
  4. **Academic Information**: Admission date, status
- **Read-only Display**: Formatted display of all fields
- **Action Buttons**: Edit, Close

#### Edit Modal

- **Pre-filled Form**: Same form structure as creation with existing data
- **Update Actions**: Save changes, cancel
- **Validation**: Same validation rules as creation form

#### Create Modal

- **Form Layout**: Multi-step form with sections:
  1. **Student Information**: Name, Aadhar, gender, DOB
  2. **Parent Information**: Father and Mother details with Aadhar and mobile
  3. **Address Information**: Present and permanent address
  4. **Academic Information**: Admission date, status
- **Form Validation**:
  - Required field validation
  - Aadhar number format validation
  - Mobile number format validation
  - Date validation (DOB, admission date)

### College Students Page

#### Students List Section

- **Table View**: Columns for admission no, student name, class, group, course, roll number, enrollment date, status, actions
- **Status Badge**: Color-coded status indicators
- **Actions Column**: View, Edit, Delete buttons
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter, group filter, course filter, status filter, enrollment date range filter
- **Pagination**: Standard pagination controls

#### View Modal

- **Full Details**: All student enrollment information in organized sections:
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

- **Skeleton Loaders**: For table rows and form sections
- **Spinner Overlays**: For modal forms during submission
- **Progressive Loading**: Load data in chunks for large lists
- **Optimistic Updates**: Update UI immediately, rollback on error

### Empty States

- **No Data**: Friendly illustration with "No students found" message
- **No Filters**: Show all students when no filters applied
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

- **School Students**:
  - Simple student records with basic info
  - No enrollment relationship
  - Status management only
- **College Students**:
  - Student enrollment records with academic details
  - Class, group, course relationships
  - Roll number and enrollment date management
  - Delete functionality available

### Reusable Component Strategy

- **Shared Forms**: StudentBasicInfoForm, StudentParentInfoForm, StudentAddressForm
- **Shared UI**: DataTable, Modal, FormField, LoadingSpinner
- **Shared Dropdowns**: ClassDropdown, GroupDropdown, CourseDropdown, SectionDropdown
- **Shared Validation**: Common validation rules for student data
- **Shared Styling**: Consistent form and table styling across modules

This comprehensive UI specification ensures a consistent, accessible, and user-friendly experience for both School and College Students while maintaining proper role-based access control and smooth data management workflows with reusable components.
