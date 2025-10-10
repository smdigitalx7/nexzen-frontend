# College / Academic Frontend (React + TS, Vite + Tailwind, Zustand, Axios)

## Overview

Sidebar section "College / Academic" → `/college/academic`. Tabs: Academic Years, Classes, Groups, Courses, Subjects, Teacher-Group-Subjects. Internal helpers: Group-Subjects relations. Each tab follows role-gated actions per router, with reusable dropdowns (Class, Group, Course, Subject), robust Axios error handling, and Zustand stores.

## Tab-level Access Control

- Visible: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT (per routers; some actions Admin-only)
- Actions per tab reflect router permissions

## API Endpoints and Responses (Base: `/api/v1/college` unless noted)

### Academic Years (@public/academic_year_router.py)

- Base: `/api/v1/public/academic-years`
- GET `/` → 200: AcademicYearRead[] (all roles above)
  - UI Flow: List with columns year_name, start_date, end_date, is_active. Actions: View, Edit (Admin-only), Delete (Admin-only). Create button (Admin-only).
- GET `/{id}` → 200: AcademicYearRead
  - UI Flow: Detail modal; Edit/Delete if permitted.
- POST `/` (INSTITUTE_ADMIN, ADMIN) → 200: AcademicYearRead
  - UI Flow: Create modal with fields year_name, start_date, end_date, is_active.
- PUT `/{id}` (INSTITUTE_ADMIN, ADMIN) → 200: AcademicYearRead
- DELETE `/{id}` (INSTITUTE_ADMIN, ADMIN) → 200: boolean

### Classes (@college/classes_router.py)

- GET `/classes` → 200: ClassResponse[]
  - UI Flow: Table: class_name, created_at; actions: View, Edit, Delete; Create button.
- GET `/classes/list` → 200: ClassList[]
  - UI Flow: Drives ClassDropdown (shared for other tabs).
- GET `/classes/{class_id}/groups` → 200: ClassWithGroups
  - UI Flow: In Class detail, show groups assigned with actions to view/remove.
- POST `/classes` → 200: ClassResponse (Create)
- PUT `/classes/{class_id}` → 200: ClassResponse (Update)
- DELETE `/classes/{class_id}/groups/{group_id}` → 200: bool (remove relation)

### Groups (@college/groups_router.py)

- GET `/groups` → 200: GroupResponse[]
  - UI Flow: Table: group_name, code, created_at; actions: View, Edit, Delete; Create button.
- GET `/groups/list` → 200: GroupList[]
  - UI Flow: Drives GroupDropdown.
- GET `/groups/{group_id}` → 200: GroupResponse
- GET `/groups/{group_id}/courses` → 200: GroupWithCourses
  - UI Flow: In Group detail, show related courses; remove relation from Courses tab.
- GET `/groups/{group_id}/subjects` → 200: GroupWithSubjects
  - UI Flow: In Group detail, show related subjects; removal via Subjects tab.
- POST `/groups` → 200: GroupResponse (Create)
- PUT `/groups/{group_id}` → 200: GroupResponse (Update)
- DELETE `/groups/{group_id}` → 204
- DELETE `/groups/{group_id}/subjects/{subject_id}` → 204 (remove relation)

### Courses (@college/courses_router.py)

- GET `/courses` → 200: CourseResponse[]
  - UI Flow: Table: course_name, code, created_at; actions: View, Edit, Delete; Create button.
- GET `/courses/list` → 200: CourseList[]
  - UI Flow: Drives CourseDropdown.
- GET `/courses/{course_id}` → 200: CourseResponse
- POST `/courses` → 200: CourseResponse (Create)
- PUT `/courses/{course_id}` → 200: CourseResponse (Update)
- DELETE `/courses/{course_id}` → 200: boolean (Delete)

### Subjects (@college/subjects_router.py)

- GET `/subjects` → 200: SubjectResponse[]
  - UI Flow: Table: subject_name, code, created_at; actions: View, Edit, Delete; Create button.
- GET `/subjects/list` → 200: SubjectList[]
  - UI Flow: Drives SubjectDropdown.
- GET `/subjects/{subject_id}` → 200: SubjectResponse
- POST `/subjects` → 200: SubjectResponse (Create)
- PUT `/subjects/{subject_id}` → 200: SubjectResponse (Update)
- DELETE `/subjects/{subject_id}` → 204

### Group-Subjects (internal, @college/group_subjects_router.py)

- GET `/group_subjects` → 200: GroupSubjectResponse[]
  - UI Flow: Used internally to pre-populate relations in Subjects/Groups detail.
- POST `/group_subjects` → 200: GroupSubjectResponse
  - UI Flow: In Subjects tab, "Add to Group" modal with GroupDropdown; creates relation.

### Teacher-Group-Subjects (@college/teacher_group_subjects_router.py)

- GET `/teacher-group-subjects` (filters: class_id?, group_id?) → 200: TeacherGroupSubjectGrouped[]
  - UI Flow: Table grouped by Class → Group → Teacher → Subjects. Filters: ClassDropdown, GroupDropdown.
- GET `/teacher-group-subjects/teacher/{teacher_id}` → 200: TeacherGroupSubjectRead[]
  - UI Flow: Teacher detail view shows all group-subject allocations.
- POST `/teacher-group-subjects` → 200: TeacherGroupSubjectRead
  - UI Flow: Create relation modal with TeacherDropdown (from employees), ClassDropdown, GroupDropdown, SubjectDropdown (depends on group), optional CourseDropdown (if applicable). On success: toast + refresh.
- DELETE `/teacher-group-subjects/teacher/{teacher_id}` → 204 (remove all for teacher)
- DELETE `/teacher-group-subjects/teacher/{teacher_id}/groups/{group_id}/subjects/{subject_id}` → 204 (remove one relation)

### Error payloads (typical)

- Errors return `{ detail: string }` with 400/401/403/404/422/500; map 422 to field errors and 401/403 to an in-tab not-authorized state.

## Frontend Structure

### Navigation

- Sidebar: "College / Academic"
- Tabs: Academic Years | Classes | Groups | Courses | Subjects | Teacher-Group-Subjects

### Project Tree

```
src/
├── components/
│   └── college/
│       └── Academic/
│           ├── AcademicYears/
│           │   ├── CollegeAcademicYearsList.tsx
│           │   ├── CollegeAcademicYearModal.tsx
│           │   └── CollegeAcademicYearForm.tsx
│           ├── Classes/
│           │   ├── CollegeClassesList.tsx
│           │   ├── CollegeClassModal.tsx
│           │   ├── CollegeClassForm.tsx
│           │   └── CollegeClassGroupsView.tsx
│           ├── Groups/
│           │   ├── CollegeGroupsList.tsx
│           │   ├── CollegeGroupModal.tsx
│           │   ├── CollegeGroupForm.tsx
│           │   └── CollegeGroupCoursesSubjectsView.tsx
│           ├── Courses/
│           │   ├── CollegeCoursesList.tsx
│           │   ├── CollegeCourseModal.tsx
│           │   └── CollegeCourseForm.tsx
│           ├── Subjects/
│           │   ├── CollegeSubjectsList.tsx
│           │   ├── CollegeSubjectModal.tsx
│           │   └── CollegeSubjectForm.tsx
│           └── TeacherGroupSubjects/
│               ├── TeacherGroupSubjectsList.tsx
│               ├── TeacherGroupSubjectModal.tsx
│               └── TeacherGroupSubjectForm.tsx
├── stores/
│   └── college/
│       ├── academicYearsStore.ts
│       ├── classesStore.ts
│       ├── groupsStore.ts
│       ├── coursesStore.ts
│       ├── subjectsStore.ts
│       └── teacherGroupSubjectsStore.ts
├── api/
│   └── college/
│       ├── academicYears.ts
│       ├── classes.ts
│       ├── groups.ts
│       ├── courses.ts
│       ├── subjects.ts
│       └── teacherGroupSubjects.ts
└── pages/
    └── CollegeAcademic.tsx
```

## Axios Setup

- Shared axios instance with interceptors for auth and error normalization. 422 mapped to field errors. Date handling consistent (YYYY-MM-DD).

## Zustand Stores

- Each store: { list, currentItem, loading, error, filters }, actions: { fetchList, fetchById, create, update, remove } (plus relation methods where relevant).

## UI/UX Details

- Dropdown dependencies:
  - GroupDropdown depends on selected Class (via `/classes/{class_id}/groups`)
  - SubjectDropdown may depend on selected Group (`/groups/{group_id}/subjects`)
  - CourseDropdown depends on selected Group (`/groups/{group_id}/courses`)
- Tables: sortable headers, pagination, sticky actions.
- Forms: inline validation, toasts on success, optimistic updates on edits.
- Accessibility: a11y modals, keyboard focus, aria labels.

## Example Flows

- Add Teacher-Group-Subject relation

  1. Open modal
  2. Select Class → loads GroupDropdown
  3. Select Group → loads SubjectDropdown (and CourseDropdown if needed)
  4. Select Teacher → submit → toast → refresh

- Add Group to Subject (internal)
  1. From Subject detail, click "Add to Group"
  2. Pick Group → submit → toast → relation appears in detail

## References

- Reusable dropdown components (Class, Group, Course, Subject, Exam, Test): see [Reusable Dropdowns](./dropdowns.md).
