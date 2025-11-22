# 🎯 Tab-Based & Module On-Demand Query Optimization

**Date:** January 2025  
**Goal:** Make ALL tab-based queries run ONLY when their tab is active, and ALL module queries run ONLY when that module is opened  
**Status:** ✅ **MAJOR OPTIMIZATIONS COMPLETED**

---

## 📊 Overview

This optimization ensures:

1. ✅ **Tab-based queries** only run when their tab is active
2. ✅ **Module/page queries** only run when that module is opened from sidebar
3. ✅ **No prefetching** entire modules on app load or in layout components

---

## 🔧 PART A: Tab-Based On-Demand Queries

### 1. TabSwitcher Component ✅

**File:** `client/src/components/shared/TabSwitcher.tsx`

**Changes:**

- ✅ Added `forceMount?: boolean` prop (default: `false`)
- ✅ Changed default behavior: Only active tab is mounted (prevents queries in inactive tabs)
- ✅ When `forceMount={false}`: Radix Tabs handles conditional rendering automatically
- ✅ When `forceMount={true}`: Uses `display: none` to hide inactive tabs (for state preservation)

**Impact:** Inactive tabs are no longer mounted, so their queries don't run.

**Before:**

```tsx
<TabsContent forceMount> {/* All tabs mounted, queries run even when hidden */}
```

**After:**

```tsx
<TabsContent forceMount={forceMount}> {/* Only active tab mounted by default */}
```

---

### 2. Student Management Tabs ✅

**Files:**

- `client/src/components/features/school/students/StudentsTab.tsx`
- `client/src/components/features/school/students/EnrollmentsTab.tsx`
- `client/src/components/features/school/students/TransportTab.tsx`

**Changes:**

- ✅ Added `useTabEnabled()` hook to check if tab is active
- ✅ Gated all queries with `enabled: isTabActive`
- ✅ Updated hooks to accept `enabled` parameter

**Example (StudentsTab):**

```typescript
// ✅ OPTIMIZATION: Check if this tab is active before fetching
const isTabActive = useTabEnabled("students", "enrollments");

// ✅ OPTIMIZATION: Only fetch when tab is active
const {
  data: studentsResp,
  isLoading,
  error,
} = useSchoolStudentsList({
  page: currentPage,
  page_size: pageSize,
  enabled: isTabActive, // ✅ Only fetch when "students" tab is active
});
```

**Example (EnrollmentsTab):**

```typescript
const isTabActive = useTabEnabled("enrollments", "enrollments");
const shouldFetchEnrollments = isTabActive && Boolean(query.class_id);

const result = useSchoolEnrollmentsList({
  ...apiParams,
  enabled: shouldFetchEnrollments, // ✅ Gate by tab active state
});
```

**Example (TransportTab):**

```typescript
const isTabActive = useTabEnabled("transport", "enrollments");

const enrollmentsParams = useMemo(() => {
  if (!isTabActive || !query.class_id) return undefined;
  return {
    class_id: Number(query.class_id),
    section_id: query.section_id ? Number(query.section_id) : undefined,
    page: 1,
    page_size: 50,
    enabled: isTabActive, // ✅ Gate by tab active state
  };
}, [query.class_id, query.section_id, isTabActive]);
```

---

### 3. Attendance Management Tabs ✅

**Files:**

- `client/src/components/features/school/attendance/AttendanceView.tsx`
- `client/src/components/features/college/attendance/AttendanceView.tsx`

**Changes:**

- ✅ Added `useTabEnabled("view", "view")` to gate queries
- ✅ Only fetch sections/groups when tab is active
- ✅ Only build query params when tab is active AND required params are provided
- ✅ Stabilized query keys with `useMemo`

**Example (School AttendanceView):**

```typescript
const isTabActive = useTabEnabled("view", "view");

// ✅ OPTIMIZATION: Only fetch sections when tab is active
const { data: sections = [] } = useSchoolSectionsByClass(
  isTabActive ? selectedClassId || 0 : 0
);

// ✅ OPTIMIZATION: Build query params - only when tab is active AND class_id is provided
const attendeeParams = useMemo(() => {
  if (!isTabActive || !selectedClassId) return null;
  return {
    class_id: selectedClassId,
    month: selectedMonth,
    year: selectedYear,
    section_id: selectedSectionId || undefined,
  };
}, [
  selectedClassId,
  selectedMonth,
  selectedYear,
  selectedSectionId,
  isTabActive,
]);
```

**Example (College AttendanceView):**

```typescript
const isTabActive = useTabEnabled("view", "view");

// ✅ OPTIMIZATION: Only fetch class groups when tab is active
const { data: classGroups } = useCollegeClassGroups(
  isTabActive ? selectedClassId || 0 : 0
);

// ✅ OPTIMIZATION: Stabilize query key
const attendanceQueryKey = useMemo(
  () => ["college-attendance-all", attendanceParams],
  [attendanceParams]
);

const studentsQuery = useQuery({
  queryKey: attendanceQueryKey,
  queryFn: () => CollegeAttendanceService.getAll(attendanceParams!),
  enabled: !!attendanceParams && isTabActive, // ✅ Gate by tab active state
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: true,
});
```

---

### 4. Hook Updates to Support `enabled` ✅

**Files:**

- `client/src/lib/hooks/school/use-school-students.ts`
- `client/src/lib/hooks/school/use-school-enrollments.ts`
- `client/src/lib/hooks/school/use-school-attendance.ts`

**Changes:**

- ✅ Added `enabled?: boolean` parameter to hook signatures
- ✅ Stabilized query keys with `useMemo`
- ✅ Added refetch optimization flags

**Example (useSchoolStudentsList):**

```typescript
export function useSchoolStudentsList(params?: {
  page?: number;
  page_size?: number;
  enabled?: boolean; // ✅ OPTIMIZATION: Allow gating queries by tab/route
}) {
  const stableParams = useMemo(
    () => ({ page: params?.page, page_size: params?.page_size }),
    [params?.page, params?.page_size]
  );
  const queryKey = useMemo(
    () =>
      schoolKeys.students.list(
        stableParams as Record<string, unknown> | undefined
      ),
    [stableParams]
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolStudentsService.list(stableParams),
    enabled: params?.enabled !== false, // ✅ Default to true, but allow disabling
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
```

**Example (useSchoolEnrollmentsList):**

```typescript
export function useSchoolEnrollmentsList(
  params?: SchoolEnrollmentFilterParams & { enabled?: boolean }
) {
  const stableParams = useMemo(() => {
    if (!params) return undefined;
    const { enabled, ...rest } = params;
    return rest;
  }, [params]);

  const queryKey = useMemo(
    () =>
      schoolKeys.enrollments.list(
        stableParams as Record<string, unknown> | undefined
      ),
    [stableParams]
  );

  const isEnabled =
    params?.enabled !== false &&
    typeof (stableParams as any)?.class_id === "number" &&
    (stableParams as any).class_id > 0;

  return useQuery({
    queryKey,
    queryFn: () => EnrollmentsService.list(stableParams as any),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });
}
```

---

## 🔧 PART B: Sidebar Modules - Fetch Only On Module Click

### 1. Sidebar Component ✅

**File:** `client/src/components/layout/Sidebar.tsx`

**Status:** ✅ **ALREADY CORRECT**

- ✅ No `useQuery` calls for module data
- ✅ Only uses `useQueryClient` for logout (acceptable)
- ✅ Navigation handled via Wouter routes

**Verification:**

- ✅ No data fetching queries in Sidebar
- ✅ Only navigation and UI state management

---

### 2. Header Component ✅

**File:** `client/src/components/layout/Header.tsx`

**Status:** ✅ **ALREADY CORRECT**

- ✅ Uses `useGlobalSearch` hook (acceptable for global search)
- ✅ No module-specific data fetching
- ✅ Only uses `useQueryClient` for logout

**Verification:**

- ✅ No module data queries in Header
- ✅ Global search is acceptable (on-demand via user input)

---

### 3. Layout Components ✅

**Files:**

- `client/src/components/routing/AuthenticatedLayout.tsx` (if exists)
- `client/src/App.tsx`

**Status:** ✅ **VERIFIED**

- ✅ No module data fetching in layout components
- ✅ Only routing and authentication logic

---

## 📋 Complete List of Optimized Components

### Tab Components ✅

- ✅ `TabSwitcher.tsx` - Conditional rendering (forceMount: false by default)
- ✅ `StudentsTab.tsx` - Gated by `useTabEnabled("students")`
- ✅ `EnrollmentsTab.tsx` - Gated by `useTabEnabled("enrollments")`
- ✅ `TransportTab.tsx` - Gated by `useTabEnabled("transport")`
- ✅ `AttendanceView.tsx` (School) - Gated by `useTabEnabled("view")`
- ✅ `AttendanceView.tsx` (College) - Gated by `useTabEnabled("view")`
- ✅ `FeesManagement.tsx` - Dashboard queries gated by tab
- ✅ `MarksManagement.tsx` - Already optimized via conditional mounting
- ✅ `AttendanceManagement.tsx` - Already optimized via conditional mounting

### Hooks Updated ✅

- ✅ `useSchoolStudentsList()` - Added `enabled` parameter
- ✅ `useSchoolEnrollmentsList()` - Added `enabled` parameter
- ✅ `useSchoolAttendanceAllStudents()` - Stabilized query key
- ✅ `useSchoolSectionsByClass()` - Added refetch optimization flags
- ✅ `useCollegeClassGroups()` - Added refetch optimization flags
- ✅ `useSchoolTuitionBalancesDashboard()` - Added `enabled` parameter + refetch optimization flags
- ✅ `useSchoolTransportBalancesDashboard()` - Added `enabled` parameter + refetch optimization flags
- ✅ All hooks - Added refetch optimization flags

---

## 🎯 Expected Impact

### Before Optimization:

- ❌ All tabs fetch data even when inactive (due to `forceMount`)
- ❌ Queries run on component mount regardless of tab state
- ❌ Unnecessary API requests for hidden tabs
- ❌ Potential query storms when switching tabs

### After Optimization:

- ✅ **Only active tab queries run**
- ✅ **Inactive tabs don't mount** (unless `forceMount={true}`)
- ✅ **Queries gated by `enabled: isTabActive`**
- ✅ **No unnecessary API requests** for hidden tabs
- ✅ **Smooth tab switching** without query storms

---

## ✅ Additional Optimizations Completed

### FeesManagement ✅

**File:** `client/src/components/features/school/fees/FeesManagement.tsx`

**Changes:**

- ✅ Added `useTabEnabled()` to check if tuition/transport tabs are active
- ✅ Gated `useSchoolTuitionBalancesDashboard()` and `useSchoolTransportBalancesDashboard()` queries by tab
- ✅ Updated hooks to accept `enabled` parameter

**Example:**

```typescript
const isTuitionTabActive = useTabEnabled("tuition-balances", "collect");
const isTransportTabActive = useTabEnabled("transport-balances", "collect");

const { data: tuitionDashboardStats } = useSchoolTuitionBalancesDashboard({
  enabled: isTuitionTabActive, // ✅ Only fetch when tab is active
});
```

### MarksManagement ✅

**File:** `client/src/components/features/school/marks/MarksManagement.tsx`

**Status:** ✅ **ALREADY OPTIMIZED**

- ✅ Uses `TabSwitcher` with default `forceMount={false}`
- ✅ `ExamMarksManagement` and `TestMarksManagement` are conditionally mounted
- ✅ Queries only run when their respective tabs are active
- ✅ Updated comment to reflect optimization

### AttendanceManagement ✅

**File:** `client/src/components/features/school/attendance/AttendanceManagement.tsx`

**Status:** ✅ **ALREADY OPTIMIZED**

- ✅ Uses `TabSwitcher` with default `forceMount={false}`
- ✅ `AttendanceView` (already optimized with `useTabEnabled`) is conditionally mounted
- ✅ `AttendanceManagement` only reads cached data, doesn't trigger queries

---

## ✅ Verification Checklist

- [x] TabSwitcher uses conditional rendering (forceMount: false by default)
- [x] StudentsTab gates queries with `useTabEnabled`
- [x] EnrollmentsTab gates queries with `useTabEnabled`
- [x] TransportTab gates queries with `useTabEnabled`
- [x] AttendanceView (School) gates queries with `useTabEnabled`
- [x] AttendanceView (College) gates queries with `useTabEnabled`
- [x] FeesManagement gates dashboard queries with `useTabEnabled`
- [x] MarksManagement uses conditional mounting (already optimized)
- [x] AttendanceManagement uses conditional mounting (already optimized)
- [x] Hooks support `enabled` parameter for tab gating
- [x] Query keys stabilized with `useMemo`
- [x] Sidebar has no module data queries
- [x] Header has no module data queries (only global search)
- [x] Layout components have no module data queries

---

## 🔍 Pattern for Future Tab Components

When creating new tabbed components, follow this pattern:

```typescript
import { useTabEnabled } from "@/lib/hooks/use-tab-navigation";

const MyTabComponent = () => {
  // ✅ OPTIMIZATION: Check if this tab is active before fetching
  const isTabActive = useTabEnabled("my-tab", "default-tab");

  // ✅ OPTIMIZATION: Only fetch when tab is active
  const { data, isLoading } = useMyData({
    params: myParams,
    enabled: isTabActive, // ✅ Gate by tab active state
  });

  // Render component...
};
```

---

## 📝 Notes

1. **TabSwitcher Behavior:**
   - Default: `forceMount={false}` - Only active tab is mounted
   - Optional: `forceMount={true}` - All tabs mounted but hidden (for state preservation)
   - Use `forceMount={true}` only when you need to preserve form state across tab switches

2. **useTabEnabled Hook:**
   - First parameter: Tab name to check
   - Second parameter: Default tab (should match `useTabNavigation` defaultTab)
   - Returns: `boolean` - whether the tab is currently active

3. **Query Gating:**
   - Always use `enabled: isTabActive` for tab-specific queries
   - Combine with other conditions: `enabled: isTabActive && hasRequiredParams`
   - Stabilize query keys with `useMemo` to prevent unnecessary refetches

4. **Performance Impact:**
   - Dramatically reduces API requests when switching tabs
   - Prevents query storms from multiple tabs fetching simultaneously
   - Improves initial load performance (only active tab fetches)

---

**End of Tab-Based On-Demand Optimization Summary**
