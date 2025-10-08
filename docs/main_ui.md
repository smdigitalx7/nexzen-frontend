# Main App UI & Navigation Specification

## Overview

This document defines the complete UI structure for the NexZen ERP system, including sidebar navigation, inner tabs, route paths, access control, Zustand stores, Axios integration, and UI patterns for all modules across General, School, and College domains.

---

## 1. Sidebar Structure & Navigation Tree

### General Domain (`/general`)

```
General
├── User & Branch Management → /general/user-and-branch
│   └── Tabs: Branches | Users | User-Branch-Access | Roles
├── Employment Management → /general/employment
│   └── Tabs: Employees | Attendance | Leaves
├── Advances & Payroll → /general/finance/payroll
│   └── Tabs: Advances | Payroll
└── Transport (Public) → /general/transport
    └── Tabs: Bus Routes | Distance Slabs
```

### School Domain (`/school`)

```
School
├── Academic → /school/academic
│   └── Tabs: Academic Years | Classes | Sections | Subjects | Exams | Tests | Teacher-Class-Subjects
├── Students → /school/students
├── Enrollments → /school/enrollments
├── Transports → /school/transports
├── Reservations → /school/reservations
├── Fees → /school/fees
│   └── Tabs: Tuition Fee | Transport Fee
├── Attendance → /school/attendance
├── Marks → /school/marks
│   └── Tabs: Exams | Tests
└── Finance → /school/finance
    └── Tabs: Income | Expenditure
```

### College Domain (`/college`)

```
College
├── Academic → /college/academic
│   └── Tabs: Academic Years | Classes | Groups | Courses | Subjects | Teacher-Group-Subjects
├── Students → /college/students
├── Enrollments → /college/enrollments
├── Transports → /college/transports
├── Reservations → /college/reservations
├── Fees → /college/fees
│   └── Tabs: Tuition Fee | Transport Fee
├── Attendance → /college/attendance
├── Marks → /college/marks
│   └── Tabs: Exams | Tests
└── Finance → /college/finance
    └── Tabs: Income | Expenditure
```

---

## 2. Access Control Matrix

### Domain Visibility Rules

- **Domain Switching**: Only one domain (School or College) sidebar is visible at a time, determined by `current_branch` from auth token
- **Branch Switching**: Users can switch branches via `/auth/switch-branch/{branch_id}` which regenerates the access token
- **General Domain**: Always visible alongside the active School/College domain

### Role-Based Access

#### INSTITUTE_ADMIN & ADMIN

- **General**: Full access to all tabs and actions
- **School/College**: Full access to all modules and tabs; only current-branch domain visible at once
- **Actions**: Create, Read, Update, Delete on all resources

#### ACADEMIC

- **General**:
  - Visible: User & Branch Management (only Attendance inner tab)
  - Hidden: Employment Management, Advances & Payroll, Transport
- **School/College**:
  - Visible: Academic, Students, Enrollments, Attendance, Marks
  - Hidden: Fees, Reservations, Finance, Student Transport
  - Actions: Full CRUD on visible modules

#### ACCOUNTANT

- **General**:
  - Visible: Transport (read-only), Advances & Payroll (full access)
  - Actions: Transport read-only; Payroll/Advances full CRUD
- **School/College**:
  - Visible: All modules except Marks and Attendance
  - Hidden: Marks, Attendance
  - Actions: Full CRUD on visible modules (Fees, Reservations, Finance, Students, Enrollments, Transports)

---

## 3. Route → Documentation Links

| Route                      | Documentation                                      |
| -------------------------- | -------------------------------------------------- |
| `/general/user-and-branch` | [user_and_branch.md](./user_and_branch.md)         |
| `/general/employment`      | [employee_mangement.md](./employee_mangement.md)   |
| `/general/finance/payroll` | [advance_and_payroll.md](./advance_and_payroll.md) |
| `/general/transport`       | [transports.md](./transports.md)                   |
| `/school/academic`         | [school_academic.md](./school_academic.md)         |
| `/school/students`         | [students.md](./students.md)                       |
| `/school/enrollments`      | [enrollments.md](./enrollments.md)                 |
| `/school/transports`       | [studenttransport.md](./studenttransport.md)       |
| `/school/reservations`     | [reservations.md](./reservations.md)               |
| `/school/fees`             | [fees.md](./fees.md)                               |
| `/school/attendance`       | [attendance.md](./attendance.md)                   |
| `/school/marks`            | [marks.md](./marks.md)                             |
| `/school/finance`          | [finance.md](./finance.md)                         |
| `/college/academic`        | [college_academic.md](./college_academic.md)       |
| `/college/students`        | [students.md](./students.md)                       |
| `/college/enrollments`     | [enrollments.md](./enrollments.md)                 |
| `/college/transports`      | [studenttransport.md](./studenttransport.md)       |
| `/college/reservations`    | [reservations.md](./reservations.md)               |
| `/college/fees`            | [fees.md](./fees.md)                               |
| `/college/attendance`      | [attendance.md](./attendance.md)                   |
| `/college/marks`           | [marks.md](./marks.md)                             |
| `/college/finance`         | [finance.md](./finance.md)                         |

---

## 4. Global Navigation Rules

### Route Guards

- Redirect unauthorized users to 403 page embedded within tab content
- Check user roles from auth store before rendering protected routes
- Fallback to `/auth/login` if no valid token exists

### Sidebar Gating

- Hide sections user cannot access based on role
- Tabs rendered but disabled if visible-without-permission
- Show tooltip explaining insufficient permissions on disabled tabs

### Breadcrumbs

- Format: `<Domain> / <Module> / <Tab>`
- Examples:
  - `School / Academic / Classes`
  - `General / Employment / Attendance`
  - `College / Fees / Tuition Fee`

### Active Tab Persistence

- Read/write active tab to URL query parameter: `?tab=subjects`
- Restore last active tab on page reload
- Default to first tab if no query parameter present

### Deep Links

- Each tab has canonical route: `/school/academic?tab=subjects`
- Support direct navigation to specific tabs via URL
- Maintain query parameters during navigation

---

## 5. Shared Components & Stores

### Reusable Dropdowns

See [dropdowns.md](./dropdowns.md) for complete specifications:

- **School**: ClassDropdown, SectionDropdown, SubjectDropdown, TeacherDropdown, ExamDropdown, TestDropdown
- **College**: ClassDropdown, GroupDropdown, CourseDropdown, SubjectDropdown, ExamDropdown, TestDropdown
- **Shared**: BusRouteDropdown, DistanceSlabDropdown, EmployeeDropdown, StudentDropdown, RoleDropdown, BranchDropdown

### Common UI Components

- **DataTable**: Sortable, filterable, paginated table with role-gated actions
- **Modal**: Accessible modal with focus trap, ESC to close, ARIA labels
- **ConfirmDialog**: Confirmation dialog for destructive actions
- **Toaster**: Toast notifications (success/error/info) in top-right corner
- **FormField**: Reusable form field with label, validation, error display
- **LoadingSpinner**: Consistent loading indicators
- **Skeleton**: Loading skeletons for tables, cards, forms
- **EmptyState**: Friendly empty states with CTAs

### Axios Configuration

```typescript
// src/api/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor: Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Normalize errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail || error.message || "Request failed";
    return Promise.reject({
      message,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);
```

### Zustand Store Pattern

```typescript
// Example: src/stores/school/classesStore.ts
import { create } from "zustand";

interface ClassesStore {
  list: ClassRead[];
  currentItem: ClassRead | null;
  loading: boolean;
  error: string | null;

  fetchList: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  create: (data: ClassCreate) => Promise<ClassRead>;
  update: (id: number, data: ClassUpdate) => Promise<ClassRead>;
  remove: (id: number) => Promise<void>;
}

export const useClassesStore = create<ClassesStore>((set, get) => ({
  list: [],
  currentItem: null,
  loading: false,
  error: null,

  fetchList: async () => {
    set({ loading: true, error: null });
    try {
      const data = await ClassesApi.list();
      set({ list: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // ... other actions
}));
```

### UI State Store

```typescript
// src/stores/uiStore.ts
import { create } from "zustand";

interface UIStore {
  activeTab: string;
  modals: Record<string, boolean>;

  setActiveTab: (tab: string) => void;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "",
  modals: {},

  setActiveTab: (tab) => set({ activeTab: tab }),
  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),
  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),
}));
```

---

## 6. Design Tokens & Layout

### Header

- **Left**: Logo, Domain switcher (School/College badge)
- **Center**: Breadcrumb navigation
- **Right**:
  - Branch switcher dropdown (current branch name)
  - Academic Year switcher dropdown
  - User menu (profile, logout)

### Sidebar

- **Collapsible**: Toggle button to expand/collapse
- **Searchable**: Search input to filter modules
- **Active State**: Highlight current active module
- **Icons**: Consistent iconography for each module
- **Badge**: Show notification badges for pending items

### Content Area

- **Tab Header**:
  - Left: Tab navigation (horizontal tabs)
  - Right: Role-gated action buttons (Create, Bulk Create, Export, etc.)
- **Filters Row**: Dropdowns and inputs for filtering data
- **Table/Card Content**: Main data display area
- **Pagination**: Bottom pagination controls

### Color Palette (Tailwind)

- **Primary**: Blue (600, 700, 800)
- **Success**: Green (500, 600)
- **Error**: Red (500, 600)
- **Warning**: Yellow (500, 600)
- **Neutral**: Gray (100-900)
- **Background**: White, Gray-50, Gray-100

### Typography

- **Headings**: Font-semibold, text-lg/xl/2xl
- **Body**: Font-normal, text-sm/base
- **Labels**: Font-medium, text-sm
- **Buttons**: Font-medium, text-sm

---

## 7. Common UI Patterns

### Create Button (Top Right)

- **Position**: Top-right corner of content area
- **Style**: Primary button with icon
- **Text**: "Create [Resource]" or "+ New [Resource]"
- **Action**: Opens create modal
- **Role-gated**: Hidden if user lacks create permission

### Bulk Create Button

- **Position**: Next to Create button
- **Style**: Secondary button with icon
- **Text**: "Bulk Create" or "Bulk Import"
- **Action**: Opens bulk create modal
- **Use Cases**:
  - Fee balances for entire class
  - Attendance for all students
  - Marks for exam/test
  - Enrollments for class

### Table Actions Column

- **View**: Eye icon button → Opens detail modal
- **Edit**: Pencil icon button → Opens edit modal
- **Delete**: Trash icon button → Shows confirmation dialog
- **Custom Actions**:
  - Pay Term (Fees)
  - Approve/Reject (Leaves, Advances)
  - Update Status (Payroll, Reservations)
  - Concessions (Reservations)

### Modal Structure

```
┌─────────────────────────────────────┐
│ Modal Title                    [X]  │
├─────────────────────────────────────┤
│                                     │
│  [Form Content]                     │
│                                     │
│  - Field 1                          │
│  - Field 2                          │
│  - Field 3                          │
│                                     │
├─────────────────────────────────────┤
│              [Cancel]  [Save/Submit]│
└─────────────────────────────────────┘
```

### Form Validation

- **Inline Errors**: Show below field with red text
- **Required Fields**: Asterisk (\*) next to label
- **Real-time Validation**: Validate on blur or change
- **Submit Disabled**: Disable submit button if form invalid
- **Loading State**: Show spinner on submit button during API call

### Empty States

- **Illustration**: Friendly SVG illustration
- **Message**: Clear message explaining no data
- **CTA**: Primary button to create first item
- **Example**: "No students found. Create your first student to get started."

### Loading States

- **Skeleton Loaders**: For tables, cards, lists
- **Spinner Overlays**: For modals during submission
- **Button Spinners**: On action buttons during async operations
- **Progressive Loading**: Load data in chunks for large datasets

### Error Handling

- **Field Errors**: Red border, error message below field
- **Form Errors**: Error banner at top of form
- **Network Errors**: Toast notification with retry option
- **Permission Errors**: Inline message explaining insufficient permissions
- **422 Validation Errors**: Map to specific form fields

### Success Feedback

- **Toast Notifications**: Success messages for all operations
- **Visual Confirmation**: Check marks, success animations
- **Data Refresh**: Automatic list refresh after successful operations
- **Optimistic Updates**: Update UI immediately, rollback on error

---

## 8. Navigation JSON (Implementation Reference)

```json
{
  "domains": [
    {
      "id": "general",
      "name": "General",
      "path": "/general",
      "alwaysVisible": true,
      "modules": [
        {
          "id": "user-branch",
          "name": "User & Branch Management",
          "path": "/general/user-and-branch",
          "icon": "users",
          "roles": ["INSTITUTE_ADMIN", "ADMIN"],
          "tabs": [
            {
              "id": "branches",
              "name": "Branches",
              "endpoint": "/api/v1/public/branches"
            },
            {
              "id": "users",
              "name": "Users",
              "endpoint": "/api/v1/public/users"
            },
            {
              "id": "access",
              "name": "User-Branch-Access",
              "endpoint": "/api/v1/public/user-branch-accesses"
            },
            {
              "id": "roles",
              "name": "Roles",
              "endpoint": "/api/v1/public/roles"
            }
          ]
        },
        {
          "id": "employment",
          "name": "Employment Management",
          "path": "/general/employment",
          "icon": "briefcase",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "tabs": [
            {
              "id": "employees",
              "name": "Employees",
              "endpoint": "/api/v1/public/employees",
              "actions": {
                "create": ["INSTITUTE_ADMIN", "ADMIN"],
                "update": ["INSTITUTE_ADMIN", "ADMIN"],
                "delete": ["INSTITUTE_ADMIN", "ADMIN"],
                "read": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"]
              }
            },
            {
              "id": "attendance",
              "name": "Attendance",
              "endpoint": "/api/v1/public/employee-attendances",
              "actions": {
                "create": [
                  "INSTITUTE_ADMIN",
                  "ADMIN",
                  "ACADEMIC",
                  "ACCOUNTANT"
                ],
                "update": [
                  "INSTITUTE_ADMIN",
                  "ADMIN",
                  "ACADEMIC",
                  "ACCOUNTANT"
                ],
                "delete": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"]
              }
            },
            {
              "id": "leaves",
              "name": "Leaves",
              "endpoint": "/api/v1/public/employee-leave",
              "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
              "actions": {
                "create": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
                "update": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
                "delete": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
                "approve": ["INSTITUTE_ADMIN", "ADMIN"],
                "reject": ["INSTITUTE_ADMIN", "ADMIN"]
              }
            }
          ]
        },
        {
          "id": "payroll",
          "name": "Advances & Payroll",
          "path": "/general/finance/payroll",
          "icon": "dollar-sign",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "tabs": [
            {
              "id": "advances",
              "name": "Advances",
              "endpoint": "/api/v1/public/advances"
            },
            {
              "id": "payroll",
              "name": "Payroll",
              "endpoint": "/api/v1/public/payrolls"
            }
          ]
        },
        {
          "id": "transport",
          "name": "Transport (Public)",
          "path": "/general/transport",
          "icon": "truck",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "tabs": [
            {
              "id": "bus-routes",
              "name": "Bus Routes",
              "endpoint": "/api/v1/public/bus-routes",
              "actions": {
                "create": ["INSTITUTE_ADMIN", "ADMIN"],
                "update": ["INSTITUTE_ADMIN", "ADMIN"],
                "delete": ["INSTITUTE_ADMIN", "ADMIN"],
                "read": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"]
              }
            },
            {
              "id": "distance-slabs",
              "name": "Distance Slabs",
              "endpoint": "/api/v1/public/transport-fee-structures",
              "actions": {
                "create": ["INSTITUTE_ADMIN", "ADMIN"],
                "update": ["INSTITUTE_ADMIN", "ADMIN"],
                "read": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"]
              }
            }
          ]
        }
      ]
    },
    {
      "id": "school",
      "name": "School",
      "path": "/school",
      "visibleWhen": "branch.branch_type === 'SCHOOL'",
      "modules": [
        {
          "id": "academic",
          "name": "Academic",
          "path": "/school/academic",
          "icon": "book-open",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "tabs": [
            {
              "id": "academic-years",
              "name": "Academic Years",
              "endpoint": "/api/v1/public/academic-years"
            },
            {
              "id": "classes",
              "name": "Classes",
              "endpoint": "/api/v1/school/classes"
            },
            {
              "id": "sections",
              "name": "Sections",
              "endpoint": "/api/v1/school/classes/{class_id}/sections"
            },
            {
              "id": "subjects",
              "name": "Subjects",
              "endpoint": "/api/v1/school/subjects"
            },
            {
              "id": "exams",
              "name": "Exams",
              "endpoint": "/api/v1/school/exams"
            },
            {
              "id": "tests",
              "name": "Tests",
              "endpoint": "/api/v1/school/tests"
            },
            {
              "id": "teacher-class-subjects",
              "name": "Teacher-Class-Subjects",
              "endpoint": "/api/v1/school/teacher-class-subjects"
            }
          ]
        },
        {
          "id": "students",
          "name": "Students",
          "path": "/school/students",
          "icon": "users",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "endpoint": "/api/v1/school/students"
        },
        {
          "id": "enrollments",
          "name": "Enrollments",
          "path": "/school/enrollments",
          "icon": "user-plus",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "endpoint": "/api/v1/school/enrollments"
        },
        {
          "id": "transports",
          "name": "Transports",
          "path": "/school/transports",
          "icon": "truck",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "endpoint": "/api/v1/school/student-transport"
        },
        {
          "id": "reservations",
          "name": "Reservations",
          "path": "/school/reservations",
          "icon": "calendar",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "endpoint": "/api/v1/school/reservations"
        },
        {
          "id": "fees",
          "name": "Fees",
          "path": "/school/fees",
          "icon": "credit-card",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "tabs": [
            {
              "id": "tuition",
              "name": "Tuition Fee",
              "endpoint": "/api/v1/school/tuition-fee-balances"
            },
            {
              "id": "transport",
              "name": "Transport Fee",
              "endpoint": "/api/v1/school/transport-fee-balances"
            }
          ]
        },
        {
          "id": "attendance",
          "name": "Attendance",
          "path": "/school/attendance",
          "icon": "check-square",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC"],
          "hiddenFor": ["ACCOUNTANT"],
          "endpoint": "/api/v1/school/student-attendance"
        },
        {
          "id": "marks",
          "name": "Marks",
          "path": "/school/marks",
          "icon": "award",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC"],
          "hiddenFor": ["ACCOUNTANT"],
          "tabs": [
            {
              "id": "exams",
              "name": "Exams",
              "endpoint": "/api/v1/school/exam-marks"
            },
            {
              "id": "tests",
              "name": "Tests",
              "endpoint": "/api/v1/school/test-marks"
            }
          ]
        },
        {
          "id": "finance",
          "name": "Finance",
          "path": "/school/finance",
          "icon": "dollar-sign",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "tabs": [
            {
              "id": "income",
              "name": "Income",
              "endpoint": "/api/v1/school/income"
            },
            {
              "id": "expenditure",
              "name": "Expenditure",
              "endpoint": "/api/v1/school/expenditure"
            }
          ]
        }
      ]
    },
    {
      "id": "college",
      "name": "College",
      "path": "/college",
      "visibleWhen": "branch.branch_type === 'COLLEGE'",
      "modules": [
        {
          "id": "academic",
          "name": "Academic",
          "path": "/college/academic",
          "icon": "book-open",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "tabs": [
            {
              "id": "academic-years",
              "name": "Academic Years",
              "endpoint": "/api/v1/public/academic-years"
            },
            {
              "id": "classes",
              "name": "Classes",
              "endpoint": "/api/v1/college/classes"
            },
            {
              "id": "groups",
              "name": "Groups",
              "endpoint": "/api/v1/college/groups"
            },
            {
              "id": "courses",
              "name": "Courses",
              "endpoint": "/api/v1/college/courses"
            },
            {
              "id": "subjects",
              "name": "Subjects",
              "endpoint": "/api/v1/college/subjects"
            },
            {
              "id": "teacher-group-subjects",
              "name": "Teacher-Group-Subjects",
              "endpoint": "/api/v1/college/teacher-group-subjects"
            }
          ]
        },
        {
          "id": "students",
          "name": "Students",
          "path": "/college/students",
          "icon": "users",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "endpoint": "/api/v1/college/students"
        },
        {
          "id": "enrollments",
          "name": "Enrollments",
          "path": "/college/enrollments",
          "icon": "user-plus",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC", "ACCOUNTANT"],
          "endpoint": "/api/v1/college/student-enrollments"
        },
        {
          "id": "transports",
          "name": "Transports",
          "path": "/college/transports",
          "icon": "truck",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "endpoint": "/api/v1/college/student-transport-assignments"
        },
        {
          "id": "reservations",
          "name": "Reservations",
          "path": "/college/reservations",
          "icon": "calendar",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "endpoint": "/api/v1/college/reservations"
        },
        {
          "id": "fees",
          "name": "Fees",
          "path": "/college/fees",
          "icon": "credit-card",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "tabs": [
            {
              "id": "tuition",
              "name": "Tuition Fee",
              "endpoint": "/api/v1/college/tuition-fee-balances"
            },
            {
              "id": "transport",
              "name": "Transport Fee",
              "endpoint": "/api/v1/college/transport-fee-balances"
            }
          ]
        },
        {
          "id": "attendance",
          "name": "Attendance",
          "path": "/college/attendance",
          "icon": "check-square",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC"],
          "hiddenFor": ["ACCOUNTANT"],
          "endpoint": "/api/v1/college/student-attendance"
        },
        {
          "id": "marks",
          "name": "Marks",
          "path": "/college/marks",
          "icon": "award",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACADEMIC"],
          "hiddenFor": ["ACCOUNTANT"],
          "tabs": [
            {
              "id": "exams",
              "name": "Exams",
              "endpoint": "/api/v1/college/exam-marks"
            },
            {
              "id": "tests",
              "name": "Tests",
              "endpoint": "/api/v1/college/test-marks"
            }
          ]
        },
        {
          "id": "finance",
          "name": "Finance",
          "path": "/college/finance",
          "icon": "dollar-sign",
          "roles": ["INSTITUTE_ADMIN", "ADMIN", "ACCOUNTANT"],
          "hiddenFor": ["ACADEMIC"],
          "tabs": [
            {
              "id": "income",
              "name": "Income",
              "endpoint": "/api/v1/college/income"
            },
            {
              "id": "expenditure",
              "name": "Expenditure",
              "endpoint": "/api/v1/college/expenditure"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 9. Zustand Store Architecture

### Store Organization

```
src/stores/
├── authStore.ts                    # Global auth state
├── uiStore.ts                      # Global UI state (modals, tabs, etc.)
├── dropdownCacheStore.ts           # Dropdown data caching
├── public/                         # General domain stores
│   ├── branchesStore.ts
│   ├── usersStore.ts
│   ├── rolesStore.ts
│   ├── accessStore.ts
│   ├── employeesStore.ts
│   ├── attendanceStore.ts
│   ├── leavesStore.ts
│   ├── advancesStore.ts
│   ├── payrollStore.ts
│   ├── busRoutesStore.ts
│   └── distanceSlabsStore.ts
├── school/                         # School domain stores
│   ├── academicYearsStore.ts
│   ├── classesStore.ts
│   ├── sectionsStore.ts
│   ├── subjectsStore.ts
│   ├── examsStore.ts
│   ├── testsStore.ts
│   ├── teacherClassSubjectsStore.ts
│   ├── studentsStore.ts
│   ├── enrollmentsStore.ts
│   ├── transportsStore.ts
│   ├── reservationsStore.ts
│   ├── tuitionFeesStore.ts
│   ├── transportFeesStore.ts
│   ├── attendanceStore.ts
│   ├── examMarksStore.ts
│   ├── testMarksStore.ts
│   ├── incomeStore.ts
│   └── expenditureStore.ts
└── college/                        # College domain stores
    ├── academicYearsStore.ts
    ├── classesStore.ts
    ├── groupsStore.ts
    ├── coursesStore.ts
    ├── subjectsStore.ts
    ├── teacherGroupSubjectsStore.ts
    ├── studentsStore.ts
    ├── enrollmentsStore.ts
    ├── transportsStore.ts
    ├── reservationsStore.ts
    ├── tuitionFeesStore.ts
    ├── transportFeesStore.ts
    ├── attendanceStore.ts
    ├── examMarksStore.ts
    ├── testMarksStore.ts
    ├── incomeStore.ts
    └── expenditureStore.ts
```

### Auth Store

```typescript
// src/stores/authStore.ts
interface AuthStore {
  user: {
    user_id: number;
    institute_id: number;
    current_branch_id: number;
    branch_name: string;
    current_branch: { branch_id: number; branch_type: string };
    is_institute_admin: boolean;
    roles: string[];
    academic_year_id: number;
  } | null;
  token: string | null;
  loading: boolean;

  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  switchBranch: (branchId: number) => Promise<void>;
  switchAcademicYear: (yearId: number) => Promise<void>;
  fetchMe: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  canAccess: (module: string) => boolean;
}
```

---

## 10. Axios API Client Architecture

### API Organization

```
src/api/
├── axios.ts                        # Base axios instance
├── public/                         # General domain APIs
│   ├── auth.ts
│   ├── branches.ts
│   ├── users.ts
│   ├── roles.ts
│   ├── userBranchAccesses.ts
│   ├── employees.ts
│   ├── branchEmployees.ts
│   ├── employeeAttendance.ts
│   ├── employeeLeaves.ts
│   ├── advances.ts
│   ├── payroll.ts
│   ├── busRoutes.ts
│   └── distanceSlabs.ts
├── school/                         # School domain APIs
│   ├── academicYears.ts
│   ├── classes.ts
│   ├── classSubjects.ts
│   ├── sections.ts
│   ├── subjects.ts
│   ├── exams.ts
│   ├── tests.ts
│   ├── teacherClassSubjects.ts
│   ├── students.ts
│   ├── enrollments.ts
│   ├── transports.ts
│   ├── reservations.ts
│   ├── tuitionFees.ts
│   ├── transportFees.ts
│   ├── attendance.ts
│   ├── examMarks.ts
│   ├── testMarks.ts
│   ├── income.ts
│   └── expenditure.ts
└── college/                        # College domain APIs
    ├── academicYears.ts
    ├── classes.ts
    ├── groups.ts
    ├── groupSubjects.ts
    ├── courses.ts
    ├── subjects.ts
    ├── teacherGroupSubjects.ts
    ├── students.ts
    ├── enrollments.ts
    ├── transports.ts
    ├── reservations.ts
    ├── tuitionFees.ts
    ├── transportFees.ts
    ├── attendance.ts
    ├── examMarks.ts
    ├── testMarks.ts
    ├── income.ts
    └── expenditure.ts
```

### API Client Pattern

```typescript
// Example: src/api/school/classes.ts
import { api } from "../axios";

export const ClassesApi = {
  list: () => api.get("/api/v1/school/classes").then((r) => r.data),

  get: (id: number) =>
    api.get(`/api/v1/school/classes/${id}`).then((r) => r.data),

  getWithSubjects: (classId: number) =>
    api.get(`/api/v1/school/classes/${classId}/subjects`).then((r) => r.data),

  create: (data: ClassCreate) =>
    api.post("/api/v1/school/classes", data).then((r) => r.data),

  update: (id: number, data: ClassUpdate) =>
    api.put(`/api/v1/school/classes/${id}`, data).then((r) => r.data),

  removeSubject: (classId: number, subjectId: number) =>
    api
      .delete(`/api/v1/school/classes/${classId}/subject/${subjectId}`)
      .then((r) => r.data),
};
```

---

## 11. Page Component Structure

### Page Template

```typescript
// Example: src/pages/school/SchoolAcademicPage.tsx
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUIStore } from "@/stores/uiStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Tab components
import AcademicYearsTab from "@/components/school/academic/AcademicYearsTab";
import ClassesTab from "@/components/school/academic/ClassesTab";
import SectionsTab from "@/components/school/academic/SectionsTab";
import SubjectsTab from "@/components/school/academic/SubjectsTab";
import ExamsTab from "@/components/school/academic/ExamsTab";
import TestsTab from "@/components/school/academic/TestsTab";
import TeacherClassSubjectsTab from "@/components/school/academic/TeacherClassSubjectsTab";

export default function SchoolAcademicPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "academic-years";

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">School Academic</h1>
        <p className="text-gray-600">
          Manage academic years, classes, sections, subjects, exams, and teacher
          assignments
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="teacher-class-subjects">
            Teacher-Class-Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="academic-years">
          <AcademicYearsTab />
        </TabsContent>

        <TabsContent value="classes">
          <ClassesTab />
        </TabsContent>

        <TabsContent value="sections">
          <SectionsTab />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectsTab />
        </TabsContent>

        <TabsContent value="exams">
          <ExamsTab />
        </TabsContent>

        <TabsContent value="tests">
          <TestsTab />
        </TabsContent>

        <TabsContent value="teacher-class-subjects">
          <TeacherClassSubjectsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Tab Component Template

```typescript
// Example: src/components/school/academic/ClassesTab.tsx
import React, { useEffect } from "react";
import { useClassesStore } from "@/stores/school/classesStore";
import { useUIStore } from "@/stores/uiStore";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/DataTable";
import { ClassModal } from "./ClassModal";
import { Plus } from "lucide-react";

export default function ClassesTab() {
  const { list, loading, error, fetchList } = useClassesStore();
  const { openModal } = useUIStore();

  useEffect(() => {
    fetchList();
  }, []);

  const columns = [
    { key: "class_name", label: "Class Name" },
    {
      key: "created_at",
      label: "Created At",
      format: (val) => new Date(val).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openModal("classDetail", row)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openModal("classEdit", row)}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Classes</h2>
        <Button onClick={() => openModal("classCreate")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        data={list}
        loading={loading}
        emptyMessage="No classes found. Create your first class to get started."
      />

      <ClassModal />
    </div>
  );
}
```

---

## 12. Responsive Design Breakpoints

### Tailwind Breakpoints

- **sm**: 640px (Mobile landscape)
- **md**: 768px (Tablet portrait)
- **lg**: 1024px (Tablet landscape / Small desktop)
- **xl**: 1280px (Desktop)
- **2xl**: 1536px (Large desktop)

### Layout Adjustments

- **Mobile (< 768px)**:
  - Collapsed sidebar (hamburger menu)
  - Stacked form fields
  - Full-width modals
  - Single-column tables (card view)
  - Bottom navigation for tabs
- **Tablet (768px - 1024px)**:
  - Collapsible sidebar
  - Two-column forms
  - Optimized modal sizes
  - Scrollable tables
- **Desktop (> 1024px)**:
  - Full sidebar
  - Multi-column forms
  - Side-by-side panels in modals
  - Full table views

---

## 13. Accessibility Standards

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader**: ARIA labels, roles, and live regions
- **Focus Management**: Visible focus indicators, focus trap in modals
- **Alternative Text**: Descriptive alt text for images and icons

### Keyboard Shortcuts

- **Tab**: Navigate forward through interactive elements
- **Shift + Tab**: Navigate backward
- **Enter**: Activate buttons, submit forms
- **Escape**: Close modals, cancel actions
- **Arrow Keys**: Navigate dropdowns, tabs
- **Space**: Toggle checkboxes, select options

---

## 14. Performance Optimization

### Code Splitting

- Lazy load pages and heavy components
- Dynamic imports for modals and forms
- Route-based code splitting

### Data Fetching

- Debounced search inputs (300ms)
- Pagination for large datasets
- Caching with Zustand
- Cancel tokens for abandoned requests

### Rendering

- React.memo for expensive components
- useMemo for computed values
- useCallback for event handlers
- Virtual scrolling for long lists

---

## 15. Environment Configuration

### .env Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# Feature Flags
VITE_ENABLE_BULK_OPERATIONS=true
VITE_ENABLE_EXPORTS=true

# UI Configuration
VITE_ITEMS_PER_PAGE=10
VITE_DEBOUNCE_DELAY=300
```

---

## 16. Testing Strategy

### Unit Tests

- Test Zustand stores (actions, state updates)
- Test utility functions
- Test form validation logic

### Integration Tests

- Test API client functions
- Test component interactions
- Test form submissions

### E2E Tests

- Test critical user flows (login, create, update, delete)
- Test navigation and routing
- Test role-based access control

---

## 17. Deployment Checklist

- [ ] Environment variables configured
- [ ] API base URL set correctly
- [ ] Build optimized for production
- [ ] Assets minified and compressed
- [ ] Source maps generated
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (Google Analytics, etc.)
- [ ] Performance monitoring enabled
- [ ] HTTPS enforced
- [ ] CORS configured correctly

---

## 18. Future Enhancements

- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Offline mode with service workers
- [ ] Real-time updates with WebSockets
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Export to PDF/Excel
- [ ] Bulk import from CSV/Excel
- [ ] Email notifications
- [ ] SMS notifications

---

## Conclusion

This comprehensive UI specification provides a complete blueprint for implementing the NexZen ERP frontend. It covers navigation, access control, state management, API integration, UI patterns, and best practices. Use this document as a reference throughout development to ensure consistency and quality across all modules.

For module-specific details, refer to the individual documentation files linked in the Route → Documentation Links section.
