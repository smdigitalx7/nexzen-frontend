# Fees Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Fees" → `/school/fees` and "College / Fees" → `/college/fees`. Each has two tabs: Tuition Fees and Transport Fees, with different data structures and UI components while sharing common patterns.

## Tab-level Access Control

### School Fees

- **Visible**: All authenticated users (uses get_current_user)
- **Actions**:
  - Tuition Fees: View, Pay Term, Pay Book Fee, Bulk Create, Reports
  - Transport Fees: View, Pay Term, Bulk Create

### College Fees

- **Visible**: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
- **Actions**:
  - Tuition Fees: Create, Update, Delete, Pay Term, Pay Book Fee, Bulk Create, Reports
  - Transport Fees: Create, Update, Delete, Pay Term, Bulk Create

## API Endpoints and Responses (Base: /api/v1)

### School Tuition Fees (@school/tuition_fee_balances_router.py)

#### GET `/school/tuition-fee-balances` → 200: TutitionPaginatedResponse

**Success Response:**

```json
{
  "data": [
    {
      "balance_id": 1,
      "admission_no": "SCH2024001",
      "roll_number": "001",
      "student_name": "John Doe",
      "section_name": "A",
      "book_fee": 1000.0,
      "book_paid": 500.0,
      "book_paid_status": "PARTIAL",
      "actual_fee": 5000.0,
      "concession_amount": 500.0,
      "total_fee": 4500.0,
      "term1_amount": 1500.0,
      "term1_paid": 1500.0,
      "term1_balance": 0.0,
      "term2_amount": 1500.0,
      "term2_paid": 1000.0,
      "term2_balance": 500.0,
      "term3_amount": 1500.0,
      "term3_paid": 0.0,
      "term3_balance": 1500.0,
      "term1_status": "PAID",
      "term2_status": "PARTIAL",
      "term3_status": "PENDING",
      "overall_balance_fee": 2000.0
    }
  ],
  "total_pages": 5,
  "current_page": 1,
  "page_size": 10,
  "total_count": 50
}
```

#### GET `/school/tuition-fee-balances/{balance_id}` → 200: TuitionFeeBalanceFullRead

**Success Response:**

```json
{
  "balance_id": 1,
  "enrollment_id": 1,
  "student_id": 1,
  "admission_no": "SCH2024001",
  "roll_number": "001",
  "student_name": "John Doe",
  "class_name": "Class 1",
  "section_name": "A",
  "father_name": "Robert Doe",
  "phone_number": "9876543210",
  "book_fee": 1000.0,
  "book_paid": 500.0,
  "book_paid_status": "PARTIAL",
  "actual_fee": 5000.0,
  "concession_amount": 500.0,
  "total_fee": 4500.0,
  "term1_amount": 1500.0,
  "term1_paid": 1500.0,
  "term1_balance": 0.0,
  "term2_amount": 1500.0,
  "term2_paid": 1000.0,
  "term2_balance": 500.0,
  "term3_amount": 1500.0,
  "term3_paid": 0.0,
  "term3_balance": 1500.0,
  "term1_status": "PAID",
  "term2_status": "PARTIAL",
  "term3_status": "PENDING",
  "overall_balance_fee": 2000.0,
  "created_at": "2024-04-01T10:00:00Z",
  "updated_at": null,
  "created_by": 1,
  "updated_by": null
}
```

#### PUT `/school/tuition-fee-balances/{balance_id}/pay-term` → 200: TuitionFeeBalanceFullRead

**Request Body (TermPaymentUpdate):**

```json
{
  "term_id": 2,
  "amount": 500.0
}
```

#### PUT `/school/tuition-fee-balances/{balance_id}/pay-book-fee` → 200: TuitionFeeBalanceFullRead

**Request Body (BookFeePaymentUpdate):**

```json
{
  "amount": 500.0
}
```

#### POST `/school/tuition-fee-balances/bulk-create` → 200: TuitionBalanceBulkCreateResult

**Request Body (TuitionBalanceBulkCreate):**

```json
{
  "class_id": 1
}
```

#### GET `/school/tuition-fee-balances/reports/unpaid-terms` → 200: TuitionUnpaidTermsResponse

**Success Response:**

```json
{
  "data": [
    {
      "student_name": "John Doe",
      "admission_no": "SCH2024001",
      "class_name": "Class 1",
      "section_name": "A",
      "roll_number": "001",
      "father_mobile": "9876543210",
      "term1_amount": 1500.0,
      "term1_paid": 1500.0,
      "term1_balance": 0.0,
      "term1_status": "PAID",
      "term2_amount": 1500.0,
      "term2_paid": 1000.0,
      "term2_balance": 500.0,
      "term2_status": "PARTIAL",
      "term3_amount": 1500.0,
      "term3_paid": 0.0,
      "term3_balance": 1500.0,
      "term3_status": "PENDING"
    }
  ],
  "total_pages": 3,
  "current_page": 1,
  "page_size": 10,
  "total_count": 25
}
```

### School Transport Fees (@school/transport_fee_balances_router.py)

#### GET `/school/transport-fee-balances` → 200: TransportPaginatedResponse

**Success Response:**

```json
{
  "data": [
    {
      "balance_id": 1,
      "enrollment_id": 1,
      "admission_no": "SCH2024001",
      "roll_number": "001",
      "student_name": "John Doe",
      "section_name": "A",
      "actual_fee": 2000.0,
      "concession_amount": 200.0,
      "total_fee": 1800.0,
      "term1_amount": 900.0,
      "term1_paid": 900.0,
      "term1_balance": 0.0,
      "term2_amount": 900.0,
      "term2_paid": 500.0,
      "term2_balance": 400.0,
      "term1_status": "PAID",
      "term2_status": "PARTIAL",
      "overall_balance_fee": 400.0
    }
  ],
  "total_pages": 3,
  "current_page": 1,
  "page_size": 10,
  "total_count": 25
}
```

#### PUT `/school/transport-fee-balances/{balance_id}/pay-term` → 200: TransportFeeBalanceFullRead

**Request Body (TransportTermPaymentUpdate):**

```json
{
  "term_id": 2,
  "amount": 400.0
}
```

#### POST `/school/transport-fee-balances/bulk-create` → 200: TransportBalanceBulkCreateResult

**Request Body (TransportBalanceBulkCreate):**

```json
{
  "class_id": 1
}
```

### College Tuition Fees (@college/tuition_fee_balances_router.py)

#### GET `/college/tuition-fee-balances` → 200: CollegeTuitionPaginatedResponse

**Success Response:**

```json
{
  "data": [
    {
      "balance_id": 1,
      "admission_no": "COL2024001",
      "roll_number": "CS001",
      "student_name": "John Doe",
      "course_name": "Computer Science",
      "book_fee": 1500.0,
      "book_paid": 750.0,
      "book_paid_status": "PARTIAL",
      "group_fee": 2000.0,
      "course_fee": 3000.0,
      "actual_fee": 5000.0,
      "concession_amount": 500.0,
      "total_fee": 4500.0,
      "term1_amount": 1500.0,
      "term1_paid": 1500.0,
      "term1_balance": 0.0,
      "term2_amount": 1500.0,
      "term2_paid": 1000.0,
      "term2_balance": 500.0,
      "term3_amount": 1500.0,
      "term3_paid": 0.0,
      "term3_balance": 1500.0,
      "term1_status": "PAID",
      "term2_status": "PARTIAL",
      "term3_status": "PENDING",
      "overall_balance_fee": 2000.0
    }
  ],
  "total_pages": 5,
  "current_page": 1,
  "page_size": 10,
  "total_count": 50
}
```

#### POST `/college/tuition-fee-balances` → 200: CollegeTuitionFeeBalanceFullRead

**Request Body (CollegeTuitionFeeBalanceCreate):**

```json
{
  "enrollment_id": 1,
  "book_fee": 1500.0,
  "book_paid": 0.0,
  "book_paid_status": "PENDING",
  "group_fee": 2000.0,
  "course_fee": 3000.0,
  "actual_fee": 5000.0,
  "concession_amount": 500.0,
  "total_fee": 4500.0,
  "term1_amount": 1500.0,
  "term1_paid": 0.0,
  "term1_balance": 1500.0,
  "term2_amount": 1500.0,
  "term2_paid": 0.0,
  "term2_balance": 1500.0,
  "term3_amount": 1500.0,
  "term3_paid": 0.0,
  "term3_balance": 1500.0,
  "overall_balance_fee": 4500.0,
  "term1_status": "PENDING",
  "term2_status": "PENDING",
  "term3_status": "PENDING"
}
```

#### PUT `/college/tuition-fee-balances/{balance_id}/term-payment` → 200: CollegeTuitionFeeBalanceFullRead

**Request Body (CollegeTermPaymentUpdate):**

```json
{
  "term_id": 2,
  "amount": 500.0
}
```

#### PUT `/college/tuition-fee-balances/{balance_id}/book-payment` → 200: CollegeTuitionFeeBalanceFullRead

**Request Body (CollegeBookFeePaymentUpdate):**

```json
{
  "amount": 750.0
}
```

#### DELETE `/college/tuition-fee-balances/{balance_id}` → 200: {success: boolean, message: string}

**Success Response:**

```json
{
  "success": true,
  "message": "Tuition fee balance deleted successfully"
}
```

### College Transport Fees (@college/transport_fee_balances_router.py)

#### GET `/college/transport-fee-balances` → 200: CollegeTransportPaginatedResponse

**Success Response:**

```json
{
  "data": [
    {
      "balance_id": 1,
      "enrollment_id": 1,
      "admission_no": "COL2024001",
      "roll_number": "CS001",
      "student_name": "John Doe",
      "class_name": "First Year",
      "group_name": "Science",
      "actual_fee": 2500.0,
      "concession_amount": 250.0,
      "total_fee": 2250.0,
      "term1_amount": 1125.0,
      "term1_paid": 1125.0,
      "term1_balance": 0.0,
      "term2_amount": 1125.0,
      "term2_paid": 500.0,
      "term2_balance": 625.0,
      "term1_status": "PAID",
      "term2_status": "PARTIAL",
      "overall_balance_fee": 625.0
    }
  ],
  "total_pages": 3,
  "current_page": 1,
  "page_size": 10,
  "total_count": 25
}
```

#### POST `/college/transport-fee-balances` → 200: CollegeTransportFeeBalanceFullRead

**Request Body (CollegeTransportFeeBalanceCreate):**

```json
{
  "transport_assignment_id": 1,
  "enrollment_id": 1,
  "actual_fee": 2500.0,
  "concession_amount": 250.0,
  "total_fee": 2250.0,
  "term1_amount": 1125.0,
  "term1_paid": 0.0,
  "term1_balance": 1125.0,
  "term2_amount": 1125.0,
  "term2_paid": 0.0,
  "term2_balance": 1125.0,
  "overall_balance_fee": 2250.0,
  "term1_status": "PENDING",
  "term2_status": "PENDING"
}
```

#### PUT `/college/transport-fee-balances/{balance_id}/term-payment` → 200: CollegeTransportFeeBalanceFullRead

**Request Body (CollegeTransportTermPaymentUpdate):**

```json
{
  "term_id": 2,
  "amount": 625.0
}
```

#### DELETE `/college/transport-fee-balances/{balance_id}` → 200: {success: boolean, message: string}

**Success Response:**

```json
{
  "success": true,
  "message": "Transport fee balance deleted successfully"
}
```

### Common Errors

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Fee balance not found
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
      "loc": ["body", "amount"],
      "msg": "amount must be greater than 0",
      "type": "value_error"
    }
  ]
}
```

## Frontend Structure

### Navigation

- Sidebar: "School / Fees" and "College / Fees" sections
- Tab Navigation: Tuition Fees and Transport Fees tabs within each section
- Breadcrumb: School/College > Fees > [Current Tab]

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Fees/
│   │       ├── TuitionFees/
│   │       │   ├── SchoolTuitionFeesList.tsx
│   │       │   ├── SchoolTuitionFeeModal.tsx
│   │       │   ├── SchoolTuitionFeeView.tsx
│   │       │   ├── SchoolTermPaymentModal.tsx
│   │       │   ├── SchoolBookPaymentModal.tsx
│   │       │   ├── SchoolBulkCreateModal.tsx
│   │       │   └── SchoolUnpaidTermsReport.tsx
│   │       └── TransportFees/
│   │           ├── SchoolTransportFeesList.tsx
│   │           ├── SchoolTransportFeeModal.tsx
│   │           ├── SchoolTransportFeeView.tsx
│   │           ├── SchoolTransportTermPaymentModal.tsx
│   │           └── SchoolTransportBulkCreateModal.tsx
│   ├── college/
│   │   └── Fees/
│   │       ├── TuitionFees/
│   │       │   ├── CollegeTuitionFeesList.tsx
│   │       │   ├── CollegeTuitionFeeModal.tsx
│   │       │   ├── CollegeTuitionFeeForm.tsx
│   │       │   ├── CollegeTuitionFeeView.tsx
│   │       │   ├── CollegeTermPaymentModal.tsx
│   │       │   ├── CollegeBookPaymentModal.tsx
│   │       │   ├── CollegeBulkCreateModal.tsx
│   │       │   └── CollegeUnpaidTermsReport.tsx
│   │       └── TransportFees/
│   │           ├── CollegeTransportFeesList.tsx
│   │           ├── CollegeTransportFeeModal.tsx
│   │           ├── CollegeTransportFeeForm.tsx
│   │           ├── CollegeTransportFeeView.tsx
│   │           ├── CollegeTransportTermPaymentModal.tsx
│   │           └── CollegeTransportBulkCreateModal.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── GroupDropdown.tsx
│       │   ├── CourseDropdown.tsx
│       │   ├── SectionDropdown.tsx
│       │   └── StudentDropdown.tsx
│       ├── Forms/
│       │   ├── FeeBalanceForm.tsx
│       │   ├── TermPaymentForm.tsx
│       │   ├── BookPaymentForm.tsx
│       │   ├── BulkCreateForm.tsx
│       │   └── FeeFiltersForm.tsx
│       ├── DataTable.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       ├── PaymentCard.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   ├── tuitionFeesStore.ts
│   │   └── transportFeesStore.ts
│   ├── college/
│   │   ├── tuitionFeesStore.ts
│   │   └── transportFeesStore.ts
│   └── uiStore.ts
├── api/
│   ├── school/
│   │   ├── tuitionFees.ts
│   │   └── transportFees.ts
│   └── college/
│       ├── tuitionFees.ts
│       └── transportFees.ts
└── pages/
    ├── SchoolFees.tsx
    └── CollegeFees.tsx
```

## Axios Setup

- Base axios instance with interceptors for auth tokens and error handling
- Response interceptor normalizes errors to consistent format
- Request interceptor adds auth headers from Zustand auth store
- Error handling utility for field-level validation and user-friendly messages

## Reusable Dropdowns

- **ClassDropdown**: Fetches school/college classes list, searchable, with loading states
- **GroupDropdown**: Fetches college groups list, searchable, with loading states
- **CourseDropdown**: Fetches college courses list, searchable, with loading states
- **SectionDropdown**: Fetches sections by class, searchable, with loading states
- **StudentDropdown**: Fetches students list for fee balance selection
- All dropdowns support controlled/uncontrolled modes and custom styling

## Zustand Store Architecture

### School Tuition Fees Store

- State: list, loading, error, current item, pagination, filters
- Actions: fetchList, fetchById, fetchByAdmissionNo, payTerm, payBookFee, bulkCreate, getUnpaidTerms
- Optimistic updates for better UX

### School Transport Fees Store

- State: list, loading, error, current item, pagination, filters
- Actions: fetchList, fetchById, fetchByAdmissionNo, payTerm, bulkCreate
- Optimistic updates for better UX

### College Tuition Fees Store

- State: list, loading, error, current item, pagination, filters
- Actions: fetchList, fetchById, fetchByAdmissionNo, create, update, delete, payTerm, payBookFee, bulkCreate, getUnpaidTerms
- Optimistic updates for better UX

### College Transport Fees Store

- State: list, loading, error, current item, pagination, filters
- Actions: fetchList, fetchById, create, update, delete, payTerm, bulkCreate
- Optimistic updates for better UX

### UI Store

- State: active tab, modal states, form states, selected filters
- Actions: setActiveTab, openModal, closeModal, setFormData, setFilters
- Centralized UI state management

## UI/UX Design Specifications

### Layout Structure

- **Header**: Page title with breadcrumb navigation
- **Tab Navigation**: Tuition Fees and Transport Fees tabs
- **Content Area**: Fee balances list with search and filters
- **Action Bar**: Top-right positioned create button, bulk create, and filters
- **Data Display**: Table view with pagination

### School Fees Page

#### Tuition Fees Tab

- **Table View**: Columns for admission no, student name, section, book fee status, term payments, overall balance, actions
- **Status Badges**: Color-coded status indicators (PAID, PARTIAL, PENDING)
- **Actions Column**: View, Pay Term, Pay Book Fee buttons
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter (required), section filter, payment status filter
- **Bulk Create Button**: Create fee balances for entire class
- **Reports Button**: View unpaid terms report

#### Transport Fees Tab

- **Table View**: Columns for admission no, student name, section, transport fee, term payments, overall balance, actions
- **Status Badges**: Color-coded status indicators (PAID, PARTIAL, PENDING)
- **Actions Column**: View, Pay Term buttons
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter (required), section filter, payment status filter
- **Bulk Create Button**: Create transport fee balances for entire class

### College Fees Page

#### Tuition Fees Tab

- **Table View**: Columns for admission no, student name, course, book fee status, term payments, overall balance, actions
- **Status Badges**: Color-coded status indicators (PAID, PARTIAL, PENDING)
- **Actions Column**: View, Edit, Delete, Pay Term, Pay Book Fee buttons
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter (required), group filter (required), course filter, payment status filter
- **Create Button**: Create new tuition fee balance
- **Bulk Create Button**: Create fee balances for class/group/course
- **Reports Button**: View unpaid terms report

#### Transport Fees Tab

- **Table View**: Columns for admission no, student name, class, group, transport fee, term payments, overall balance, actions
- **Status Badges**: Color-coded status indicators (PAID, PARTIAL, PENDING)
- **Actions Column**: View, Edit, Delete, Pay Term buttons
- **Search**: Global search across student name, admission no, roll number
- **Filters**: Class filter (required), group filter (required), payment status filter
- **Create Button**: Create new transport fee balance
- **Bulk Create Button**: Create transport fee balances for class/group

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

### Payment Modal Design

- **Term Selection**: Radio buttons or dropdown for term selection
- **Amount Input**: Number input with validation
- **Payment Summary**: Display current balance and payment amount
- **Confirmation**: Confirm payment action
- **Receipt**: Optional receipt generation

### Bulk Create Modal Design

- **Class Selection**: Required class dropdown
- **Group Selection**: Required group dropdown (college only)
- **Course Selection**: Optional course dropdown (college only)
- **Preview**: Show number of students to be processed
- **Confirmation**: Confirm bulk creation action
- **Results**: Display creation results with success/error counts

### Reports Modal Design

- **Filter Options**: Class, group, course filters
- **Report Table**: Unpaid terms with student details
- **Export Options**: PDF, Excel export buttons
- **Print Option**: Print-friendly view

### Loading States

- **Skeleton Loaders**: For table rows and form sections
- **Spinner Overlays**: For modal forms during submission
- **Progressive Loading**: Load data in chunks for large lists
- **Optimistic Updates**: Update UI immediately, rollback on error

### Empty States

- **No Data**: Friendly illustration with "No fee balances found" message
- **No Filters**: Show all balances when no filters applied
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

- **School Fees**:
  - Class-Section based structure
  - Read-only operations (no create/update/delete)
  - 3 terms for tuition, 2 terms for transport
  - All authenticated users can access
- **College Fees**:
  - Class-Group-Course based structure
  - Full CRUD operations available
  - 3 terms for tuition, 2 terms for transport
  - Role-based access (ADMIN, ACCOUNTANT, INSTITUTE_ADMIN)

### Reusable Component Strategy

- **Shared Forms**: FeeBalanceForm, TermPaymentForm, BookPaymentForm, BulkCreateForm
- **Shared UI**: DataTable, Modal, FormField, PaymentCard, LoadingSpinner
- **Shared Dropdowns**: ClassDropdown, GroupDropdown, CourseDropdown, SectionDropdown, StudentDropdown
- **Shared Validation**: Common validation rules for fee data
- **Shared Styling**: Consistent form and table styling across modules

### Data Display Strategies

- **School**: Read-only table view with payment actions
- **College**: Full CRUD table view with all operations
- **Responsive**: Both adapt to mobile with stacked layouts
- **Filtering**: Both support class/group filtering with different options
- **Search**: Both support global search across student information

### Payment Flow Design

- **Term Payment**: Select term, enter amount, confirm payment
- **Book Payment**: Enter amount, confirm payment
- **Bulk Payment**: Select multiple students, enter amounts, confirm
- **Payment History**: View payment history for each student
- **Receipt Generation**: Optional receipt download/print

This comprehensive UI specification ensures a consistent, accessible, and user-friendly experience for both School and College Fees while maintaining proper role-based access control and smooth data management workflows with reusable components and appropriate data display strategies for each system's complexity.

## References

- Reusable dropdown components (Class, Group, Course, Section, Bus Route, Slab): see [Reusable Dropdowns](./dropdowns.md).
