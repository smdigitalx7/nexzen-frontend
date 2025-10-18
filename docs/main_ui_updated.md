# Main App UI & Navigation Specification (Updated - Dec 2024)

## Overview

This document defines the **actual implementation** of the NexZen ERP system UI, including sidebar navigation, tab-based modules, routing, access control, React Query data fetching, and architectural patterns. This reflects the current codebase and recommended best practices.

---

## 1. Architectural Stack

### Core Technologies

- **Framework**: React 18.3 + TypeScript 5.6
- **Build Tool**: Vite 5.4
- **Routing**: Wouter 3.3 (lightweight alternative to React Router)
- **State Management**:
  - **Auth & Navigation**: Zustand 5.0 with persist middleware
  - **Server State**: React Query (TanStack Query) 5.89
- **UI Library**: Radix UI + shadcn/ui components
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.18
- **Forms**: React Hook Form 7.55 + Zod 3.24 validation
- **Data Tables**: TanStack Table 8.21
- **Charts**: Recharts 2.15

### Clean Architecture (Partial Implementation)

The system uses a **hybrid approach** with two coexisting API layers:

1. **Simple Fetch API** (`lib/api.ts`) - Primary for most features
2. **Clean Architecture** (`core/`) - For complex business logic

**Recommendation**: Gradually migrate to full Clean Architecture OR consolidate to Simple API.

---

## 2. Current Route Structure

### Flat Routes with Tab-Based Organization

Unlike domain-prefixed routing (`/general/`, `/school/`, `/college/`), the system uses a **flat route structure** where each major module is a single route with internal tab navigation.

#### General Section (Always Visible)

```
General
├── / → Dashboard (role-specific KPIs)
├── /users → User Management
├── /employees → Employee Management
│   └── Tabs: Employees | Attendance | Leaves | Advances
├── /payroll → Payroll Management
├── /transport → Transport Management
├── /financial-reports → Financial Reports & Analytics
└── /audit-log → Audit Log (ADMIN only)
```

#### School Section (When currentBranch.branch_type === 'SCHOOL')

```
School
├── /academic → Academic Management
│   └── Tabs: Classes | Subjects | Exams | Tests | Academic Years
├── /reservations/new → New Reservation Form
├── /admissions/new → New Admission Form
├── /classes → Class Management (separate)
├── /students → Student Management
├── /attendance → Attendance Tracking
├── /marks → Marks Management
│   └── Tabs: Exam Marks | Test Marks
├── /fees → Fee Management
│   └── Tabs: Collect Fees | Tuition Structures | Tuition Balances | Transport Balances
└── /announcements → Announcements
```

#### College Section (When currentBranch.branch_type === 'COLLEGE')

```
College
├── /college → College Management
│   └── Tabs: Groups | Courses | Combinations | Sections
├── /academic → Academic Structure
│   └── Tabs: Classes | Subjects | Academic Years
├── /students → Student Management
├── /attendance → Attendance Tracking
├── /fees → Fee Management
│   └── Tabs: Collect Fees | Tuition Structures | Tuition Balances | Transport Balances
└── /announcements → Announcements
```

---

## 3. Sidebar Implementation

### Structure (`client/src/components/layout/Sidebar.tsx`)

```typescript
const Sidebar = () => {
  const { user, currentBranch } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useNavigationStore();
  const [location] = useLocation();

  // Public modules (always visible)
  const publicModules = getPublicModules(user.role);

  // Schema-specific modules (school/college)
  const schemaModules = getSchemaModules(currentBranch?.branch_type, user.role);

  return (
    <aside className={cn("sidebar", sidebarOpen ? "w-[280px]" : "w-[72px]")}>
      <Logo />
      <ToggleButton />

      {/* General Section */}
      <Section title="General">
        {publicModules.map((module) => (
          <NavItem
            key={module.href}
            {...module}
            isActive={location === module.href}
          />
        ))}
      </Section>

      {/* School/College Section */}
      {currentBranch && (
        <Section title={currentBranch.branch_type}>
          {schemaModules.map((module) => (
            <NavItem
              key={module.href}
              {...module}
              isActive={location === module.href}
            />
          ))}
        </Section>
      )}
    </aside>
  );
};
```

### Dynamic Visibility Rules

**Role-Based:**

- `INSTITUTE_ADMIN`: All modules
- `ACADEMIC`: Academic, Students, Classes, Attendance, Marks, Announcements
- `ACCOUNTANT`: Reservations, Admissions, Fees, Transport, Financial Reports

**Branch-Type Based:**

- School: Shows School-specific modules
- College: Shows College-specific modules
- General: Always visible regardless of branch type

---

## 4. Page Templates & Tab Navigation

### Pattern: Template Component with Tabs

Most complex modules use a **Template Component** that manages:

- Tab state
- Data fetching via React Query hooks
- Filter state
- Modal/dialog state
- Business logic handlers

### Example: Employee Management

```typescript
// client/src/components/features/employee-management/templates/EmployeeManagementTemplate.tsx
export const EmployeeManagementTemplate = () => {
  const {
    employees,
    attendance,
    leaves,
    advances,
    activeTab,
    setActiveTab,
    ...handlers
  } = useEmployeeManagement(); // Custom hook encapsulates all logic

  return (
    <div className="space-y-6 p-6">
      <Header title="Employee Management" />
      <StatsCards {...stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          <EmployeeTable
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceTable attendance={attendance} />
        </TabsContent>

        {/* ... other tabs */}
      </Tabs>

      {/* Modals */}
      <EmployeeFormDialog />
      <AttendanceFormDialog />
    </div>
  );
};
```

### Example: Academic Management

```typescript
// client/src/components/pages/AcademicManagement.tsx
const AcademicManagement = () => {
  const { currentBranch } = useAuthStore();
  const { backendClasses, backendSubjects, exams, tests, isLoading } =
    useAcademicData();
  const [activeTab, setActiveTab] = useState("classes");

  return (
    <div className="space-y-6 p-6">
      <Header title="Academic Management" branch={currentBranch} />
      <AcademicOverviewCards {...stats} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="academic-years">Academic Years</TabsTrigger>
        </TabsList>

        <TabsContent value="classes">
          <ClassesTab classesWithSubjects={backendClasses} />
        </TabsContent>

        {/* ... other tabs */}
      </Tabs>
    </div>
  );
};
```

### Tab State Management (Current vs Recommended)

**Current Implementation:**

```typescript
const [activeTab, setActiveTab] = useState("classes");
```

- ❌ Tab state stored in component state
- ❌ Lost on page reload
- ❌ No deep linking
- ❌ Can't share specific tab URLs

**Recommended Implementation (TODO):**

```typescript
import { useSearchParams } from "wouter";

const [searchParams, setSearchParams] = useSearchParams();
const activeTab = searchParams.get("tab") || "classes";
const setActiveTab = (tab: string) => setSearchParams({ tab });
```

- ✅ Tab state in URL: `/academic?tab=subjects`
- ✅ Persists across reloads
- ✅ Deep linking works
- ✅ Shareable URLs
- ✅ Browser back/forward navigation

---

## 5. Data Fetching with React Query

### Pattern: Custom Hooks + React Query

Instead of Zustand stores for server data, the system uses **React Query hooks** for data fetching, caching, and synchronization.

### Example: Class Management

```typescript
// client/src/lib/hooks/useSchool.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Api } from "@/lib/api";

export const useClasses = () => {
  return useQuery({
    queryKey: ["school", "classes"],
    queryFn: async () => {
      const response = await Api.get("/school/classes");
      return response;
    },
    staleTime: 30_000, // 30 seconds
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ClassCreate) => {
      return await Api.post("/school/classes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "classes"] });
      toast.success("Class created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create class");
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ClassUpdate }) => {
      return await Api.put(`/school/classes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school", "classes"] });
      toast.success("Class updated successfully");
    },
  });
};
```

### Query Client Configuration

```typescript
// client/src/lib/query.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 seconds before data considered stale
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 2, // Retry failed requests twice
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});
```

### Benefits of React Query

- ✅ **Automatic Caching**: Reduces unnecessary API calls
- ✅ **Background Refetching**: Keeps data fresh
- ✅ **Optimistic Updates**: Instant UI feedback
- ✅ **Request Deduplication**: Multiple components can use same query
- ✅ **Pagination & Infinite Scroll**: Built-in support
- ✅ **Error Handling**: Consistent error states
- ✅ **Loading States**: Automatic loading indicators

---

## 6. API Layer

### Simple Fetch API (Primary)

```typescript
// client/src/lib/api.ts
import { useAuthStore } from "@/store/authStore";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const api = async <T>(options: ApiRequestOptions): Promise<T> => {
  const state = useAuthStore.getState();
  const token = state.token;

  const url = `${API_BASE_URL}${options.path}${buildQuery(options.query)}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers: requestHeaders,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || data.message || "Request failed");
  }

  return response.json();
};

export const Api = {
  get: <T>(path: string, query?: Record<string, any>) =>
    api<T>({ method: "GET", path, query }),
  post: <T>(path: string, body?: any) => api<T>({ method: "POST", path, body }),
  put: <T>(path: string, body?: any) => api<T>({ method: "PUT", path, body }),
  patch: <T>(path: string, body?: any) =>
    api<T>({ method: "PATCH", path, body }),
  delete: <T>(path: string) => api<T>({ method: "DELETE", path }),
};
```

### Token Management & Refresh

```typescript
// Automatic token refresh 60 seconds before expiry
export const AuthTokenTimers = {
  scheduleProactiveRefresh: () => {
    const { token, tokenExpireAt } = useAuthStore.getState();
    if (!token || !tokenExpireAt) return;

    const now = Date.now();
    const refreshInMs = Math.max(0, tokenExpireAt - now - 60_000);

    setTimeout(async () => {
      await tryRefreshToken(token);
      scheduleProactiveRefresh(); // Reschedule
    }, refreshInMs);
  },

  clearProactiveRefresh: () => {
    // Clear refresh timer
  },
};

// On 401/403, attempt refresh once
if (
  !response.ok &&
  (response.status === 401 || response.status === 403) &&
  !_isRetry
) {
  const refreshed = await tryRefreshToken(token);
  if (refreshed) {
    return api<T>({ ...options, _isRetry: true }); // Retry with new token
  }
}
```

---

## 7. State Management Strategy

### Zustand for Client State

```typescript
// client/src/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      tokenExpireAt: null,
      branches: [],
      currentBranch: null,
      isAuthenticated: false,

      login: (user, branches) => {
        const defaultBranch = branches.find((b) => b.is_default) || branches[0];
        set({
          user,
          branches,
          currentBranch: defaultBranch,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          branches: [],
          currentBranch: null,
          isAuthenticated: false,
        });
      },

      switchBranch: async (branch) => {
        const response = await AuthService.switchBranch(branch.branch_id);
        if (response?.access_token) {
          set({ currentBranch: branch, token: response.access_token });
        }
      },

      setTokenAndExpiry: (token, expireAtMs) => {
        set({ token, tokenExpireAt: expireAtMs });
        ServiceLocator.setAuthToken(token); // Update Clean Architecture
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tokenExpireAt: state.tokenExpireAt,
        branches: state.branches,
        currentBranch: state.currentBranch,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

```typescript
// client/src/store/navigationStore.ts
export const useNavigationStore = create<NavigationState>((set) => ({
  sidebarOpen: true,
  activeModule: "dashboard",
  isMobile: false,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveModule: (module) => set({ activeModule: module }),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### React Query for Server State

- ✅ **All API data** managed by React Query
- ✅ **No Zustand stores for server data**
- ✅ **Automatic caching and synchronization**
- ✅ **Built-in loading and error states**

---

## 8. Form Handling

### React Hook Form + Zod Validation

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const classFormSchema = z.object({
  class_name: z.string().min(1, "Class name is required"),
  section: z.string().optional(),
  grade: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classFormSchema>;

const ClassForm = () => {
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_name: "",
    },
  });

  const createClassMutation = useCreateClass();

  const onSubmit = async (values: ClassFormValues) => {
    await createClassMutation.mutateAsync(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="class_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter class name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createClassMutation.isPending}>
          {createClassMutation.isPending ? "Creating..." : "Create Class"}
        </Button>
      </form>
    </Form>
  );
};
```

### Form Patterns

- **Inline Validation**: Real-time validation as user types
- **Error Display**: FormMessage component shows field errors
- **Loading States**: Button shows spinner during submission
- **Success Handling**: Toast notification + form reset + list refresh
- **Error Handling**: Toast with error message + field-level errors

---

## 9. Data Tables

### EnhancedDataTable Component

```typescript
<EnhancedDataTable
  data={employees}
  columns={employeeColumns}
  title="Employees"
  searchKey="employee_name"
  exportable={true}
  selectable={false}
/>
```

**Features:**

- Global search with debouncing
- Column sorting (asc/desc)
- Pagination (10/25/50 per page)
- CSV export
- Row selection (optional)
- Responsive design
- Loading skeletons
- Empty states

---

## 10. Modal & Dialog Patterns

### Using Radix UI Dialog

```typescript
<Dialog open={showEmployeeForm} onOpenChange={setShowEmployeeForm}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>{isEditing ? "Edit Employee" : "Add Employee"}</DialogTitle>
    </DialogHeader>
    <EmployeeForm
      initialData={selectedEmployee}
      onSubmit={isEditing ? handleUpdate : handleCreate}
      onCancel={() => setShowEmployeeForm(false)}
    />
  </DialogContent>
</Dialog>
```

**Accessibility Features:**

- Focus trap within modal
- ESC key closes dialog
- Click outside closes dialog
- ARIA labels and roles
- Keyboard navigation support

---

## 11. Access Control

### Route Protection

```typescript
// client/src/App.tsx
<ProtectedRoute
  path="/employees"
  roles={["institute_admin"]}
  component={EmployeeManagement}
/>;

function ProtectedRoute({
  path,
  roles,
  component: Component,
}: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const hasAccess = user && roles.includes(user.role);

  return (
    <Route
      path={path}
      component={() => (hasAccess ? <Component /> : <NotAuthorized />)}
    />
  );
}
```

### Action-Level Access Control

```typescript
const canEdit = user?.role === "institute_admin" || user?.role === "admin";
const canDelete = user?.role === "institute_admin";

<Button onClick={handleEdit} disabled={!canEdit}>
  Edit
</Button>;

{
  canDelete && (
    <Button variant="destructive" onClick={handleDelete}>
      Delete
    </Button>
  );
}
```

---

## 12. Styling & Theming

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        // ... other semantic colors
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
```

### CSS Custom Properties

```css
/* client/src/index.css */
:root {
  --background: 210 20% 98%;
  --foreground: 220 13% 12%;
  --primary: 217 91% 60%;
  --secondary: 220 14% 96%;
  --muted: 220 14% 96%;
  --accent: 220 14% 94%;
  --destructive: 0 72% 51%;

  /* Elevation system */
  --elevate-1: rgba(0, 0, 0, 0.03);
  --elevate-2: rgba(0, 0, 0, 0.08);
}
```

### Hover Effects

```css
.hover-elevate:hover::after {
  content: "";
  position: absolute;
  inset: 0;
  background-color: var(--elevate-1);
  border-radius: inherit;
}
```

---

## 13. Error Handling

### API Error Handling

```typescript
try {
  const response = await Api.post("/school/classes", data);
  toast.success("Class created successfully");
  return response;
} catch (error: any) {
  // Field-level errors (422)
  if (error.status === 422 && error.details) {
    error.details.forEach((err: any) => {
      form.setError(err.loc[1], { message: err.msg });
    });
  } else {
    // General error toast
    toast.error(error.message || "Failed to create class");
  }
  throw error;
}
```

### Loading & Error States

```typescript
const { data, isLoading, error } = useClasses();

if (isLoading) return <Skeleton />;
if (error) return <ErrorState message={error.message} onRetry={refetch} />;
return <ClassesTable data={data} />;
```

---

## 14. Performance Optimizations

### Current Optimizations

- ✅ React Query caching (30s stale time)
- ✅ Pagination for large datasets
- ✅ Lazy loading of routes (Vite code splitting)
- ✅ Optimistic updates with React Query
- ✅ Debounced search inputs (300ms)

### Recommended Future Optimizations

- ⏳ Virtual scrolling for very long lists
- ⏳ Image lazy loading and optimization
- ⏳ Service worker for offline support
- ⏳ Web Workers for heavy computations
- ⏳ React.memo for expensive components

---

## 15. Reusable Dropdown Components (TODO)

### Pattern to Implement

```typescript
// client/src/components/shared/Dropdowns/ClassDropdown.tsx
export const ClassDropdown = ({
  value,
  onChange,
  branchType,
  ...props
}: Props) => {
  const { data: classes, isLoading } = useClasses({ branchType });

  return (
    <Select
      value={value?.toString()}
      onValueChange={(v) => onChange(Number(v))}
      {...props}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select class" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Loading...
          </SelectItem>
        ) : (
          classes?.map((cls) => (
            <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
              {cls.class_name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
```

### Dropdowns to Implement

**School:**

- ClassDropdown
- SectionDropdown (depends on class)
- SubjectDropdown
- TeacherDropdown
- ExamDropdown
- TestDropdown

**College:**

- ClassDropdown
- GroupDropdown (depends on class)
- CourseDropdown (depends on group)
- SubjectDropdown (depends on group)
- ExamDropdown
- TestDropdown

**Shared:**

- BranchDropdown
- EmployeeDropdown
- StudentDropdown
- RoleDropdown
- BusRouteDropdown
- DistanceSlabDropdown

---

## 16. Testing Strategy (Future)

### Unit Tests

- Zustand store actions
- Utility functions
- Form validation logic
- API client functions

### Integration Tests

- React Query hooks
- Form submissions
- Component interactions
- Error handling flows

### E2E Tests (Playwright/Cypress)

- Critical user flows (login, create, update, delete)
- Navigation and routing
- Role-based access control
- Multi-branch switching

---

## 17. Deployment & Environment

### Environment Variables

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000/api/v1  # Development
# OR
VITE_API_BASE_URL=https://nexzenapi.smdigitalx.com/api/v1  # Production
```

### Build Configuration

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "tsc"
  }
}
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  server: {
    port: 7000,
    proxy: {
      "/api": {
        target: "https://nexzenapi.smdigitalx.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
```

---

## 18. Recommended Next Steps

### High Priority

1. **Implement URL-based tab state**

   - Replace `useState` with `useSearchParams` for tab navigation
   - Enable deep linking and tab persistence

2. **Create reusable dropdown components**

   - Build Class, Section, Subject, Teacher dropdowns
   - Implement dropdown caching
   - Use across all forms

3. **Consolidate API layers**

   - Choose between Simple API or Clean Architecture
   - Remove unused layer
   - Document final choice

4. **Add comprehensive error handling**
   - Retry buttons on error states
   - Better field-level error mapping
   - Consistent error patterns

### Medium Priority

5. **Implement UI store for modals**

   - Centralized modal state management
   - Or document local state pattern as standard

6. **Enhance access control**

   - Add `hasRole()` helper to auth store
   - Implement tab-level access control
   - Document access patterns clearly

7. **Add performance monitoring**
   - React Query DevTools (development)
   - Performance metrics tracking
   - Error tracking (Sentry/similar)

### Low Priority

8. **Documentation cleanup**

   - Remove outdated domain-prefix routing references
   - Update API examples to match actual implementation
   - Add architecture decision records (ADRs)

9. **Advanced features**
   - Dark mode support
   - Multi-language support (i18n)
   - Offline mode with service workers
   - Export to PDF/Excel

---

## Conclusion

This document reflects the **actual implementation** of the NexZen ERP frontend as of December 2024. The system uses a pragmatic approach combining:

- **Flat routing** with tab-based organization (simpler than domain prefixes)
- **React Query** for server state (better than Zustand for API data)
- **Zustand** for client state (auth, navigation)
- **Radix UI + shadcn/ui** for components (accessible, customizable)
- **React Hook Form + Zod** for forms (type-safe validation)

The architecture prioritizes **developer experience**, **maintainability**, and **user experience** over strict adherence to complex architectural patterns.

**Key Principle**: Pragmatic architecture that balances best practices with practical implementation needs.

---

**Last Updated**: December 2024  
**Version**: 2.0 (Reflects Actual Implementation)
