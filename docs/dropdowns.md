# Reusable Dropdowns (School & College)

Overview

- Shared, accessible, debounced, searchable dropdowns built with React + TS + Tailwind.
- Two families: School and College. Each fetches from its own endpoints and exposes a consistent API.
- All dropdowns support: loading state, empty state, error retry, controlled/uncontrolled, onChange callbacks, disabled, clearable, and virtualization for large lists.

Common Props

- value, onChange, placeholder, disabled, required, className
- fetchParams (object for filters), renderOption (custom renderer), getOptionLabel/getOptionValue overrides
- onOpen/onClose, noOptionsText, loadingText

School Dropdowns

- ClassDropdown (School)
  - Data: GET `/api/v1/school/classes`
  - Label: class_name; Value: class_id
- SectionDropdown (by class_id)
  - Data: GET `/api/v1/school/classes/{class_id}/sections`
  - Depends: class_id (required)
  - Label: section_name; Value: section_id
- SubjectDropdown (School)
  - Data: GET `/api/v1/school/subjects`
  - Label: subject_name; Value: subject_id
- TeacherDropdown (School)
  - Data: GET `/api/v1/public/employees/teacher-by-branch`
  - Label: employee_name; Value: employee_id
- ExamDropdown (School)
  - Data: GET `/api/v1/school/exams`
  - Label: exam_name; Value: exam_id
- TestDropdown (School)
  - Data: GET `/api/v1/school/tests` (if available); else omit or reuse exam style

College Dropdowns

- ClassDropdown (College)
  - Data: GET `/api/v1/college/classes/list`
  - Label: class_name; Value: class_id
- GroupDropdown (by class_id)
  - Data: GET `/api/v1/college/classes/{class_id}/groups`
  - Label: group_name; Value: group_id
- CourseDropdown (by group_id)
  - Data: GET `/api/v1/college/groups/{group_id}/courses`
  - Label: course_name; Value: course_id
- SubjectDropdown (College)
  - Data: GET `/api/v1/college/subjects/list`
  - Label: subject_name; Value: subject_id
- ExamDropdown (College)
  - Data: GET `/api/v1/college/exams`
  - Label: exam_name; Value: exam_id
- TestDropdown (College)
  - Data: GET `/api/v1/college/tests`
  - Label: test_name; Value: test_id

Transport & Fees Dropdowns (School & College)

- BusRouteDropdown
  - Data: GET `/api/v1/public/bus-routes/names`
  - Label: route_name (include route_no if present); Value: bus_route_id
- SlabDropdown (Distance Slabs)
  - Data: GET `/api/v1/public/transport-fee-structures`
  - Label: `${slab_name} (${min_distance}-${max_distance ?? '∞'} km) - ₹${fee_amount}`; Value: slab_id

Behavior & UX

- Debounced search (300ms) for text inputs; server-side filter via query when supported
- Disabled until required dependency provided (e.g., SectionDropdown waits for class_id)
- Auto-clear child dropdowns when parent changes (e.g., Group resets Course/Subject)
- Shows selected chips in multi-select modes (if applicable in future)
- Keyboard navigation and ARIA roles; announce loading/results via aria-live

Axios Integration

- Use shared axios with auth; cancel tokens on unmount or param change
- Cache last result in Zustand to prevent duplicate fetches in same session
- Error normalization to `{ detail }`; show inline hint + retry button

Zustand Helpers

- `useDropdownCacheStore` per family (school/college) with map: key → { data, fetchedAt }
- Methods: getCached(key), setCached(key, data), invalidate(key|prefix)
- Keys include serialized params (e.g., `sections:class=1`)

Usage Examples

- School: Class → Section → Subject → Teacher → Exam (→ BusRoute/Slab in Transport/Fees)
- College: Class → Group → Course → Subject → Exam/Test (→ BusRoute/Slab in Transport/Fees)

Cross-module Reuse

- Marks, Academic, Students, Enrollments, Transports, Finance (admission search), Fees can reuse the above dropdowns.
