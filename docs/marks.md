# Marks Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Two separate sidebar sections: "School / Marks" → `/school/marks` and "College / Marks" → `/college/marks`. Tabs in each section: Exams and Tests. Feature set includes list/grouped views, detail, create/update, delete, and bulk create. Role-based action visibility and robust error handling.

## Tab-level Access Control

- School (uses get_current_user):
  - Visible: authenticated users
  - Actions: Create/Update/Delete/Bulk Create
- College (required roles: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN):
  - Visible: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
  - Actions: Create/Update/Delete/Bulk Create

## API Endpoints and Responses (Base: `/api/v1`)

### School • Exams (@school/exam_marks_router.py)

- GET `/school/exam-marks` (query: class_id required; subject_id?, section_id?, exam_id?) → 200: ExamGroupAndSubjectResponse[]
  - ExamGroupAndSubjectResponse: `{ exam_id, exam_name, conducted_at, subject_id, subject_name, students?: ExamMarkMinimalRead[] }`
  - ExamMarkMinimalRead: `{ mark_id, enrollment_id, student_name, roll_number, section_name, marks_obtained?, percentage?, grade?, remarks?, conducted_at? }`
  - UI Flow: Filters bar (ClassDropdown required, SectionDropdown optional, SubjectDropdown optional, ExamDropdown optional). Grouped list by exam/subject. Row actions: View, Edit, Delete. Skeletons on load, empty state with Bulk Create CTA.
- GET `/school/exam-marks/{mark_id}` → 200: ExamMarkFullReadResponse
  - UI Flow: ExamMarkDetailModal shows student + exam + subject + marks. Buttons: Edit, Delete.
- POST `/school/exam-marks` → 201: ExamMarkFullReadResponse
  - Body (ExamMarkCreate): `{ enrollment_id, exam_id, subject_id, marks_obtained?, percentage?, grade?, remarks?, conducted_at? }`
  - UI Flow: Create modal with StudentDropdown (enrollment), ExamDropdown, SubjectDropdown, fields for marks/percentage/grade/remarks/date. Validation: non-negative, percentage 0-100, grade optional.
- PUT `/school/exam-marks/{mark_id}` → 200: ExamMarkFullReadResponse
  - Body (ExamMarkUpdate): `{ marks_obtained?, percentage?, grade?, remarks?, conducted_at? }`
  - UI Flow: Edit modal pre-filled. Optimistic update, toast on success.
- DELETE `/school/exam-marks/{mark_id}` → 204
  - UI Flow: Confirm dialog. On success: remove row, toast.
- POST `/school/exam-marks/bulk-create` → 201: ExamMarkBulkCreateResult
  - Body (CreateExamMarkBulk): `{ class_id, section_id?, exam_id, subject_id, conducted_at }`
  - ExamMarkBulkCreateResult: `{ created_count, skipped_enrollment_ids:number[], total_requested }`
  - UI Flow: Bulk Create modal: pick class/section/exam/subject/date. On submit: spinner, show result counts, refresh.

### School • Tests (@school/test_marks_router.py)

- GET `/school/test-marks` (query: class_id required; subject_id?, section_id?, test_id?) → 200: TestGropupAndSubjectResponse[]
  - TestGropupAndSubjectResponse: `{ test_id, test_name, conducted_at, subject_id, subject_name, students?: TestMarkMinimalRead[] }`
  - TestMarkMinimalRead: `{ test_mark_id, enrollment_id, student_name, roll_number, section_name, marks_obtained?, percentage?, grade?, remarks?, conducted_at? }`
  - UI Flow: Same as Exams, with test filters instead of exam.
- GET `/school/test-marks/{test_mark_id}` → 200: TestMarkFullReadResponse
- POST `/school/test-marks` → 201: TestMarkFullReadResponse
  - Body (TestMarkCreate): `{ enrollment_id, test_id, subject_id, marks_obtained?, percentage?, grade?, remarks?, conducted_at? }`
- PUT `/school/test-marks/{test_mark_id}` → 200: TestMarkFullReadResponse
  - Body (TestMarkUpdate)
- DELETE `/school/test-marks/{test_mark_id}` → 204
- POST `/school/test-marks/bulk-create` → 201: TestMarkBulkCreateResult
  - Body (CreateTestMarkBulk): `{ class_id, section_id?, test_id, subject_id, conducted_at }`

### College • Exams (@college/exam_marks_router.py)

- GET `/college/exam-marks` (CollegeExamParams in query: class_id, group_id, exam_id?, subject_id?) → 200: CollegeExamGroupAndClassResponse[]
  - CollegeExamGroupAndClassResponse: `{ exam_id, exam_name, conducted_at, subjects?: { subject_id, subject_name, students?: CollegeExamMarkMinimalRead[] }[] }`
  - CollegeExamMarkMinimalRead: `{ mark_id, enrollment_id, admission_no, student_name, roll_number, marks_obtained?, percentage?, grade?, remarks?, conducted_at? }`
  - UI Flow: Filters bar (ClassDropdown required, GroupDropdown required, SubjectDropdown optional, ExamDropdown optional). Grouped by exam → subject → students. Row actions: View, Edit, Delete.
- GET `/college/exam-marks/{mark_id}` → 200: CollegeExamMarkFullReadResponse
- POST `/college/exam-marks` → 201: CollegeExamMarkFullReadResponse
  - Body (CollegeExamMarkCreate)
- PUT `/college/exam-marks/{mark_id}` → 200: CollegeExamMarkFullReadResponse
  - Body (CollegeExamMarkUpdate)
- DELETE `/college/exam-marks/{mark_id}` → 204
- POST `/college/exam-marks/bulk-create` → 200: CollegeExamMarkBulkCreateResult
  - Body (CollegeCreateExamMarkBulk): `{ class_id, group_id?, exam_id, subject_id, conducted_at }`

### College • Tests (@college/test_marks_router.py)

- GET `/college/test-marks` (CollegeTestsParams in query: class_id, group_id, test_id?, subject_id?) → 200: CollegeTestGroupAndClassResponse[]
  - CollegeTestGroupAndClassResponse: `{ test_id, test_name, conducted_at, subjects?: { subject_id, subject_name, students?: CollegeTestMarkMinimalRead[] }[] }`
- GET `/college/test-marks/{test_mark_id}` → 200: CollegeTestMarkFullReadResponse
- POST `/college/test-marks` → 201: CollegeTestMarkFullReadResponse
  - Body (CollegeTestMarkCreate)
- PUT `/college/test-marks/{test_mark_id}` → 200: CollegeTestMarkFullReadResponse
  - Body (CollegeTestMarkUpdate)
- DELETE `/college/test-marks/{test_mark_id}` → 204
- POST `/college/test-marks/bulk-create` → 200: CollegeTestMarkBulkCreateResult
  - Body (CollegeCreateTestMarkBulk): `{ class_id, group_id?, test_id, subject_id, conducted_at }`

### Common Errors

- 401 Unauthorized, 403 Forbidden (college roles), 404 Not Found, 422 Validation errors (map to fields), 500 Server errors.

## Frontend Structure

### Navigation

- Sidebar: "School / Marks" and "College / Marks" sections
- Tabs: Exams | Tests

### Project Tree

```
src/
├── components/
│   ├── school/
│   │   └── Marks/
│   │       ├── Exams/
│   │       │   ├── SchoolExamMarksList.tsx
│   │       │   ├── SchoolExamMarkModal.tsx
│   │       │   ├── SchoolExamMarkView.tsx
│   │       │   ├── SchoolExamMarkForm.tsx
│   │       │   └── SchoolExamMarksBulkCreateModal.tsx
│   │       └── Tests/
│   │           ├── SchoolTestMarksList.tsx
│   │           ├── SchoolTestMarkModal.tsx
│   │           ├── SchoolTestMarkView.tsx
│   │           ├── SchoolTestMarkForm.tsx
│   │           └── SchoolTestMarksBulkCreateModal.tsx
│   ├── college/
│   │   └── Marks/
│   │       ├── Exams/
│   │       │   ├── CollegeExamMarksList.tsx
│   │       │   ├── CollegeExamMarkModal.tsx
│   │       │   ├── CollegeExamMarkView.tsx
│   │       │   ├── CollegeExamMarkForm.tsx
│   │       │   └── CollegeExamMarksBulkCreateModal.tsx
│   │       └── Tests/
│   │           ├── CollegeTestMarksList.tsx
│   │           ├── CollegeTestMarkModal.tsx
│   │           ├── CollegeTestMarkView.tsx
│   │           ├── CollegeTestMarkForm.tsx
│   │           └── CollegeTestMarksBulkCreateModal.tsx
│   └── shared/
│       ├── Dropdowns/
│       │   ├── ClassDropdown.tsx
│       │   ├── GroupDropdown.tsx
│       │   ├── SectionDropdown.tsx
│       │   ├── SubjectDropdown.tsx
│       │   ├── ExamDropdown.tsx
│       │   └── TestDropdown.tsx
│       ├── DataTable.tsx
│       ├── Modal.tsx
│       ├── FormField.tsx
│       ├── ConfirmDialog.tsx
│       └── LoadingSpinner.tsx
├── stores/
│   ├── school/
│   │   ├── examMarksStore.ts
│   │   └── testMarksStore.ts
│   └── college/
│       ├── examMarksStore.ts
│       └── testMarksStore.ts
├── api/
│   ├── school/
│   │   ├── examMarks.ts
│   │   └── testMarks.ts
│   └── college/
│       ├── examMarks.ts
│       └── testMarks.ts
└── pages/
    ├── SchoolMarks.tsx
    └── CollegeMarks.tsx
```

## Axios Setup

- Use shared axios instance with auth header via interceptor, 401/403 handling, and 422 normalization to field errors.

## Zustand Stores

- School examMarksStore
  - state: list (grouped), currentItem, filters {classId, sectionId?, subjectId?, examId?}, loading, error
  - actions: fetchList(params), fetchById(id), create(payload), update(id, payload), remove(id), bulkCreate(payload)
- School testMarksStore
  - same shape as examMarksStore with testId instead of examId
- College examMarksStore
  - state: list (grouped by exam→subject), currentItem, filters {classId, groupId, examId?, subjectId?}, loading, error
  - actions: fetchList(params), fetchById(id), create(payload), update(id, payload), remove(id), bulkCreate(payload)
- College testMarksStore
  - same shape with test filters

## UI/UX Details

- Filters
  - Enforce required fields: School requires class; College requires class and group
  - Month/date optional via conducted_at; pickers with formatting
- Tables and Grouped Views
  - Group by exam/test and subject, then list students with marks
  - Sort by roll_number and student_name
- Forms
  - Numeric validations for marks and percentage (0–100), optional grade
  - Remarks textarea, conducted_at datetime picker
- Bulk Create
  - Preview number of students before submit, show created/skipped counts
- Role Gating
  - College actions visible only to allowed roles
- Loading/Empty/Error
  - Skeletons, clear empty states with CTAs, inline errors, toasts
- Accessibility
  - ARIA-labelled modals, keyboard focus management

## Example UI Flows

- Create single exam mark
  1. Click "Create" → ExamMarkModal
  2. Select enrollment, exam, subject → enter marks/percentage/grade/remarks/date
  3. Submit → toast → list refresh
- Bulk create test marks
  1. Click "Bulk Create" → BulkCreateModal
  2. Select class (and group for college), section (school), test, subject, conducted_at
  3. Submit → show created_count/skipped list → refresh

## References

- Reusable dropdown components (Class, Section, Subject, Teacher, Exam/Test, Group, Course, Bus Route, Slab): see [Reusable Dropdowns](./dropdowns.md).
