# School / Academic Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

General sidebar section "School / Academic" → `/school/academic`. Tabs: Academic Years, Classes, Sections, Subjects, Exams, Tests, Teacher-Class-Subjects. Class-Subjects is internal (no tab) and used by Classes/Subjects to manage relationships. Tab-level access mirrors backend routers.

## Tab-level Access Control

- Academic Years
  - Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
  - Actions: INSTITUTE_ADMIN, ADMIN → Create/Update/Delete; Others → Read
- Classes
  - Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
  - Actions: All four can Create/Update; manage subjects via relationship endpoints
- Sections
  - Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
  - Actions: All four can Create/Update
- Subjects
  - Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
  - Actions: All four can Create/Update/Delete; manage class relations
- Exams (School)
  - Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
  - Actions: All four can Create/Update
- Tests (College)
  - Visible: ADMIN, ACADEMIC
  - Actions: ADMIN, ACADEMIC can Create/Update/Delete
- Teacher-Class-Subjects
  - Visible: authenticated users (router uses get_current_user); surface actions per role needs

## API Endpoints and Responses (Base: /api/v1)

### Academic Years (@public/academic_year_router.py)

- GET `/public/academic-years` → 200: AcademicYearRead[]; 401/403/500
- GET `/public/academic-years/{id}` → 200: AcademicYearRead; 401/403/500
- POST `/public/academic-years` (Admins) → 200: AcademicYearRead; 401/403/500
- PUT `/public/academic-years/{id}` (Admins) → 200: AcademicYearRead; 401/403/500
- DELETE `/public/academic-years/{id}` (Admins) → 200: boolean; 401/403/500
- AcademicYearRead: { academic_year_id, year_name, start_date, end_date, is_active, created_at, updated_at?, created_by?, updated_by? }

### Classes (@school/class_router.py)

- GET `/school/classes` → 200: ClassRead[]; 401/403
- GET `/school/classes/{id}` → 200: ClassRead; 401/403
- GET `/school/classes/{class_id}/subjects` → 200: ClassWithSubjects (extends ClassRead with subjects: { subject_id, subject_name }[])
- POST `/school/classes` → 200: ClassRead
- PUT `/school/classes/{id}` → 200: ClassRead
- DELETE relation (from class): `/school/classes/{class_id}/subject/{subject_id}` → 204
- ClassRead: { class_id, class_name, created_by?, updated_by? }

### Class-Subjects (internal, @school/class_subjects_router.py)

- GET `/school/class-subjects` → 200: ClassSubjectRead[]
- POST `/school/class-subjects` → 200: ClassSubjectRead
- ClassSubjectRead: { class_id, subject_id, created_by?, updated_by? }

### Sections (@school/sections_router.py)

- Prefix: `/school/classes/{class_id}/sections`
- GET `/` → 200: SectionRead[]
- GET `/{id}` → 200: SectionRead
- POST `/` → 200: SectionRead
- PUT `/{id}` → 200: SectionRead
- SectionRead: { section_id, class_id, section_name, current_enrollment, is_active, created_at, updated_at?, created_by?, updated_by? }

### Subjects (@school/subject_router.py)

- GET `/school/subjects` → 200: SubjectRead[]
- GET `/school/subjects/{id}` → 200: SubjectRead
- GET `/school/subjects/{subject_id}/classes` → 200: SubjectWithClasses (extends SubjectRead with classes: { class_id, class_name }[])
- POST `/school/subjects` → 200: SubjectRead
- PUT `/school/subjects/{id}` → 200: SubjectRead
- DELETE `/school/subjects/{id}` → 204
- DELETE relation: `/school/subjects/{subject_id}/classes/{class_id}` → 204
- SubjectRead: { subject_id, subject_name, created_by?, updated_by? }

### Exams (@school/exams_router.py)

- GET `/school/exams` → 200: ExamRead[]
- GET `/school/exams/{exam_id}` → 200: ExamRead
- POST `/school/exams` → 200: ExamRead
- PUT `/school/exams/{exam_id}` → 200: ExamRead
- ExamRead: { exam_id, exam_name, exam_date, pass_marks, max_marks, created_by?, updated_by? }

### Tests (@college/tests_router.py)

- GET `/college/tests` → 200: TestRead[]
- GET `/college/tests/{test_id}` → 200: TestResponse
- POST `/college/tests` → 200: TestResponse
- PUT `/college/tests/{test_id}` → 200: TestResponse
- DELETE `/college/tests/{test_id}` → 204
- TestRead: { test_id, test_name, test_date, pass_marks, max_marks }
- TestResponse adds: { created_at, updated_at?, created_by?, updated_by? }

### Teacher-Class-Subjects (@school/teacher_class_subjects_router.py)

- GET `/school/teacher-class-subjects` → 200: TeacherClassSubjectRead[]
- POST `/school/teacher-class-subjects` → 201: TeacherClassSubjectRead
- DELETE `/school/teacher-class-subjects/{teacher_id}/{class_id}/{subject_id}` → 204
- TeacherClassSubjectRead: { teacher_id, teacher_name, class_id, class_name, subject_id, subject_name, created_at, updated_at?, created_by?, updated_by? }

### Common Errors

- Errors return { detail: string } with 400/401/403/404/422/500; map 422 to field errors and 401/403 to an in-tab not-authorized state.

## Frontend Structure

### Navigation

- Sidebar: "School / Academic" section
- Tab Navigation: Horizontal tabs within the section
- Breadcrumb: School / Academic > [Current Tab]

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   ├── AcademicYears/
│   │   │   ├── AcademicYearsList.tsx
│   │   │   ├── AcademicYearModal.tsx
│   │   │   └── AcademicYearForm.tsx
│   │   ├── Classes/
│   │   │   ├── ClassesList.tsx
│   │   │   ├── ClassModal.tsx
│   │   │   ├── ClassForm.tsx
│   │   │   └── ClassSubjectsPanel.tsx
│   │   ├── Sections/
│   │   │   ├── SectionsList.tsx
│   │   │   ├── SectionModal.tsx
│   │   │   └── SectionForm.tsx
│   │   ├── Subjects/
│   │   │   ├── SubjectsList.tsx
│   │   │   ├── SubjectModal.tsx
│   │   │   ├── SubjectForm.tsx
│   │   │   └── SubjectClassesPanel.tsx
│   │   ├── Exams/
│   │   │   ├── ExamsList.tsx
│   │   │   ├── ExamModal.tsx
│   │   │   └── ExamForm.tsx
│   │   ├── Tests/
│   │   │   ├── TestsList.tsx
│   │   │   ├── TestModal.tsx
│   │   │   └── TestForm.tsx
│   │   └── TeacherClassSubjects/
│   │       ├── TeacherClassSubjectsList.tsx
│   │       ├── TeacherClassSubjectModal.tsx
│   │       └── TeacherClassSubjectForm.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── SubjectDropdown.tsx
│       │   └── TeacherDropdown.tsx
│       ├── DataTable.tsx
│       ├── CardGrid.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   ├── academicYearsStore.ts
│   │   ├── classesStore.ts
│   │   ├── sectionsStore.ts
│   │   ├── subjectsStore.ts
│   │   ├── examsStore.ts
│   │   ├── testsStore.ts
│   │   └── teacherClassSubjectsStore.ts
│   └── uiStore.ts
├── api/
│   ├── public/
│   │   └── academicYears.ts
│   └── school/
│       ├── classes.ts
│       ├── classSubjects.ts
│       ├── sections.ts
│       ├── subjects.ts
│       ├── exams.ts
│       └── teacherClassSubjects.ts
│   └── college/
│       └── tests.ts
└── pages/
    └── SchoolAcademic.tsx
```

## Axios Setup

- Base axios instance with interceptors for auth tokens and error handling
- Response interceptor normalizes errors to consistent format
- Request interceptor adds auth headers from Zustand auth store
- Error handling utility for field-level validation and user-friendly messages

## Reusable Dropdowns

- **ClassDropdown**: Fetches classes list, searchable, with loading states
- **SubjectDropdown**: Fetches subjects list, searchable, with loading states
- **TeacherDropdown**: Fetches teachers by branch, searchable, with loading states
- All dropdowns support controlled/uncontrolled modes and custom styling

## Zustand Store Architecture

### Academic Years Store

- State: list, loading, error, current item
- Actions: fetchList, fetchById, create, update, remove
- Optimistic updates for better UX

### Classes Store

- State: list, loading, error, current item, subjects for current class
- Actions: fetchList, fetchById, fetchWithSubjects, create, update, removeRelation
- Manages class-subject relationships

### Sections Store

- State: list, loading, error, selected class ID
- Actions: setClassId, fetchList, fetchById, create, update
- Dependent on class selection

### Subjects Store

- State: list, loading, error, current item, classes for current subject
- Actions: fetchList, fetchById, fetchWithClasses, create, update, remove, removeRelation
- Manages subject-class relationships

### Exams Store

- State: list, loading, error, current item
- Actions: fetchList, fetchById, create, update
- Read-only for most users

### Tests Store

- State: list, loading, error, current item
- Actions: fetchList, fetchById, create, update, remove
- Full CRUD for authorized users

### Teacher-Class-Subjects Store

- State: list, loading, error
- Actions: fetchList, create, remove
- Manages teacher assignments

### UI Store

- State: active tab, modal states, form states
- Actions: setActiveTab, openModal, closeModal, setFormData
- Centralized UI state management

## UI/UX Design Specifications

### Layout Structure

- **Header**: Page title with breadcrumb navigation
- **Tab Navigation**: Horizontal tabs with active state styling
- **Content Area**: Dynamic content based on selected tab
- **Action Bar**: Top-right positioned create buttons and filters
- **Data Display**: Tables for lists, cards for grid views, modals for forms

### Academic Years Tab

- **List View**: Clean table with columns for year name, start/end dates, status, actions
- **Status Badge**: Green for active, gray for inactive
- **Actions**: View (eye icon), Edit (pencil icon), Delete (trash icon) - role-based visibility
- **Create Button**: Floating action button in top-right corner
- **Modal Design**: Full-screen modal for create/edit with form validation
- **Date Pickers**: Calendar widgets for start/end date selection
- **Form Validation**: Real-time validation with error messages below fields

### Classes Tab

- **List View**: Table with class name, created date, subject count columns
- **Subject Count Badge**: Shows number of assigned subjects
- **Full View Modal**: Two-panel layout - class details on left, subjects management on right
- **Subjects Panel**:
  - List of assigned subjects with remove buttons
  - Add subject section with dropdown and add button
  - Search functionality for subject dropdown
- **Create Flow**:
  1. Create class form in modal
  2. Success toast with "Add Subjects" action button
  3. Opens subjects assignment modal
- **Dependency Management**: Visual indicators for subject relationships

### Sections Tab

- **Class Selector**: Prominent dropdown at top of page
- **Empty State**: When no class selected, show instructional message
- **Card Grid**: Sections displayed as cards with enrollment info
- **Card Design**:
  - Section name as header
  - Current enrollment number
  - Active/inactive status badge
  - Action buttons (view, edit)
- **Create Modal**: Simple form with section name and enrollment fields
- **Dependency Indicator**: Clear visual connection to selected class

### Subjects Tab

- **List View**: Table with subject name, class count, created date
- **Class Count Badge**: Shows number of assigned classes
- **Full View Modal**: Two-panel layout - subject details on left, classes management on right
- **Classes Panel**:
  - List of assigned classes with remove buttons
  - Add class section with dropdown and add button
- **Create Flow**: Standard modal with subject name field
- **Relationship Management**: Visual indicators for class assignments

### Exams Tab

- **Card Grid**: Exams displayed as cards with key information
- **Card Design**:
  - Exam name as header
  - Exam date prominently displayed
  - Pass marks and max marks in footer
  - Action buttons (view, edit)
- **Date Display**: Formatted date with relative time (e.g., "2 days ago")
- **Create Modal**: Form with exam name, date picker, and marks fields
- **Validation**: Date must be in future, marks must be positive numbers

### Tests Tab

- **Card Grid**: Similar to exams but with additional delete option
- **Card Design**: Same as exams with delete button for authorized users
- **Create Modal**: Same form structure as exams
- **Delete Confirmation**: Modal confirmation dialog before deletion
- **Role-based Actions**: Delete button only visible to ADMIN/ACADEMIC roles

### Teacher-Class-Subjects Tab

- **Table View**: Three-column layout showing teacher, class, subject
- **Teacher Column**: Teacher name with employee ID
- **Class Column**: Class name with section info if available
- **Subject Column**: Subject name
- **Actions Column**: Delete button for each relationship
- **Create Modal**: Three-dropdown form (teacher, class, subject)
- **Dependency Validation**: Ensure teacher is available for selected class/subject
- **Bulk Operations**: Select multiple relationships for bulk delete

### Modal Design System

- **Overlay**: Semi-transparent dark background
- **Modal Container**: Centered, max-width responsive design
- **Header**: Title with close button (X)
- **Body**: Scrollable content area
- **Footer**: Action buttons (Cancel, Save/Submit)
- **Animation**: Smooth fade-in/out transitions
- **Accessibility**: Focus trap, escape key to close, ARIA labels

### Form Design Patterns

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

- **No Data**: Friendly illustration with "No [items] found" message
- **No Selection**: Instructional text for dependent tabs (e.g., "Select a class to view sections")
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

- **Lazy Loading**: Load tab content only when selected
- **Debounced Search**: Delay API calls for search inputs
- **Caching**: Store API responses in Zustand for faster subsequent loads
- **Pagination**: Load data in pages for large datasets
- **Memoization**: Prevent unnecessary re-renders with React.memo

This comprehensive UI specification ensures a consistent, accessible, and user-friendly experience across all School/Academic tabs while maintaining proper role-based access control and smooth data management workflows.

## References

- Reusable dropdown components (Class, Section, Subject, Teacher, Exam): see [Reusable Dropdowns](./dropdowns.md).
