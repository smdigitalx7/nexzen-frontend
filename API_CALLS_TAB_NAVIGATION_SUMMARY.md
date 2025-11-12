# API Calls Based on Sidebar/Tab Navigation - Summary

## Overview

This document explains how API calls are controlled and triggered based on sidebar navigation and tab-based navigation in the NexZen frontend application.

---

## 1. Sidebar Navigation → Route Changes

### How It Works

1. **Sidebar Component** (`client/src/components/layout/Sidebar.tsx`)
   - Displays navigation items based on user role and branch type
   - Uses `wouter` for routing
   - Each sidebar item navigates to a specific route (e.g., `/reservations`, `/academic`, `/fees`)

2. **Route Structure**
   - **Flat routes**: Each major module has its own route
   - **Tab-based organization**: Within each route, tabs control what data is displayed

### Example Flow

```
User clicks "Reservations" in Sidebar
    ↓
Navigates to `/reservations` route
    ↓
ReservationManagement component loads
    ↓
Component initializes with default tab (e.g., "new")
    ↓
API calls are made based on active tab
```

---

## 2. Tab-Based Navigation → API Calls

### Core Mechanism: `useTabNavigation` Hook

Located in: `client/src/lib/hooks/use-tab-navigation.ts`

```typescript
const { activeTab, setActiveTab } = useTabNavigation("default-tab");
```

**Features:**

- ✅ URL persistence (tabs stored in query params: `?tab=all`)
- ✅ Tab state survives page refresh
- ✅ Consistent API across all modules

### Controlling API Calls: `useTabEnabled` Hook

The key to lazy loading and conditional API calls:

```typescript
import { useTabEnabled } from "@/lib/hooks/use-tab-navigation";

// Check if specific tab(s) are active
const isTabActive = useTabEnabled("tab-name");
const isAnyTabActive = useTabEnabled(["tab1", "tab2"]);
```

**Returns:** `boolean` - whether the tab(s) are currently active

---

## 3. Pattern: React Query + Tab-Enabled API Calls

### Standard Pattern

```typescript
import { useQuery } from "@tanstack/react-query";
import { useTabNavigation, useTabEnabled } from "@/lib/hooks/use-tab-navigation";

const MyComponent = () => {
  const { activeTab, setActiveTab } = useTabNavigation("default-tab");

  // Get enabled state for conditional fetching
  const tabEnabled = useTabEnabled("specific-tab");

  // React Query hook with conditional fetching
  const { data, isLoading } = useQuery({
    queryKey: ["my-data"],
    queryFn: () => fetchMyData(),
    enabled: tabEnabled, // ⭐ Only fetch when tab is active
    staleTime: 30 * 1000,
  });

  return (
    <TabSwitcher
      tabs={[
        { value: "specific-tab", label: "Tab", content: <TabContent /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
};
```

---

## 4. Real-World Examples

### Example 1: College Reservations Management

**File:** `client/src/components/features/college/reservations/ReservationManagement.tsx`

**Tabs:**

- `"new"` - New reservation form
- `"all"` - All reservations list
- `"status"` - Status update table
- `"dashboard"` - Dashboard stats

**API Call Pattern:**

```typescript
const { activeTab, setActiveTab } = useTabNavigation("new");

// Dashboard stats - always loaded
const { data: dashboardStats } = useCollegeReservationDashboard();

// Reservations list - only loaded when "all" or "status" tab is active
const { data: reservationsData, isLoading } = useQuery({
  queryKey: collegeKeys.reservations.list({
    page: currentPage,
    page_size: pageSize,
  }),
  queryFn: () =>
    CollegeReservationsService.list({ page: currentPage, page_size: pageSize }),
  enabled: activeTab === "all" || activeTab === "status", // ⭐ Conditional
  staleTime: 30 * 1000,
});

// Dropdowns - lazy loaded when form tab is active
useEffect(() => {
  if (activeTab === "new") {
    setDropdownsOpened((prev) => ({
      ...prev,
      groups: true,
      classes: true,
    }));
  }
}, [activeTab]);
```

**Key Points:**

- ✅ Dashboard data always loads (needed for overview)
- ✅ Reservations list only loads when viewing "all" or "status" tabs
- ✅ Dropdowns lazy-loaded when form tab opens
- ✅ Prevents unnecessary API calls and UI freezes

---

### Example 2: School Academic Management

**File:** `client/src/components/features/school/academic/AcademicManagement.tsx`

**Tabs:**

- `"classes"` - Classes management
- `"subjects"` - Subjects management
- `"sections"` - Sections management
- `"exams"` - Exams management
- `"tests"` - Tests management

**API Call Pattern:**

```typescript
const { activeTab, setActiveTab } = useTabNavigation("classes");

// Get enabled states at top level (avoids hook order issues)
const classesEnabled = useTabEnabled(["classes", "sections"], "classes");
const subjectsEnabled = useTabEnabled("subjects", "classes");
const examsEnabled = useTabEnabled("exams", "classes");
const testsEnabled = useTabEnabled("tests", "classes");

// Overview cards - always enabled (needed for stats)
const { data: backendClasses } = useSchoolClasses({
  enabled: true, // Always enabled for cards
});

const { data: backendSubjects } = useSchoolSubjects({
  enabled: true, // Always enabled for cards
});

// Tab-specific data - conditionally enabled
const { data: classesData } = useSchoolClasses({
  enabled: classesEnabled, // Only when classes/sections tab active
});

const { data: subjectsData } = useSchoolSubjects({
  enabled: subjectsEnabled, // Only when subjects tab active
});
```

**Key Points:**

- ✅ Overview data always loads (for dashboard cards)
- ✅ Tab-specific data only loads when tab is active
- ✅ Multiple tabs can share the same data (e.g., classes for both "classes" and "sections" tabs)
- ✅ Uses `useTabEnabled` for clean conditional logic

---

### Example 3: School Reservations Management

**File:** `client/src/components/features/school/reservations/ReservationManagement.tsx`

**Similar Pattern:**

```typescript
const { activeTab, setActiveTab } = useTabNavigation("new");

// Only fetch reservations when viewing "all" or "status" tabs
const { data: reservationsData, isLoading } = useQuery({
  queryKey: schoolKeys.reservations.list({
    page: currentPage,
    page_size: pageSize,
  }),
  queryFn: () =>
    SchoolReservationsService.list({ page: currentPage, page_size: pageSize }),
  enabled: activeTab === "all" || activeTab === "status", // ⭐ Conditional
  staleTime: 30 * 1000,
});
```

---

## 5. Benefits of This Pattern

### Performance Benefits

1. **Lazy Loading**
   - Data only loads when needed
   - Reduces initial page load time
   - Prevents loading unnecessary data

2. **Prevents UI Freezes**
   - Large datasets only load when tab is active
   - Pagination limits data per request
   - Non-blocking data fetching

3. **Reduced Network Traffic**
   - Only makes API calls for active tabs
   - Caching with React Query reduces redundant calls
   - Stale time prevents excessive refetching

### User Experience Benefits

1. **Faster Navigation**
   - Sidebar navigation is instant (just route change)
   - Tab switching is instant (data already cached or loading)

2. **URL Persistence**
   - Tabs persist in URL (`?tab=all`)
   - Bookmarkable tabs
   - Shareable links with specific tab

3. **Progressive Loading**
   - Overview data loads immediately
   - Detailed data loads when tab is opened
   - Loading states per tab

---

## 6. Tab List Summary by Module

### College Reservations (`/reservations`)

- **Tabs:**
  - `"new"` - New reservation form
  - `"all"` - All reservations (paginated)
  - `"status"` - Status update table
  - `"dashboard"` - Dashboard stats
- **API Calls:**
  - Dashboard: Always loaded
  - Reservations list: Only when `activeTab === "all" || activeTab === "status"`
  - Dropdowns: Lazy loaded when form opens

### School Academic (`/academic`)

- **Tabs:**
  - `"classes"` - Classes management
  - `"subjects"` - Subjects management
  - `"sections"` - Sections management
  - `"exams"` - Exams management
  - `"tests"` - Tests management
- **API Calls:**
  - Overview cards: Always loaded
  - Tab-specific data: Only when respective tab is active

### Employee Management (`/employees`)

- **Tabs:**
  - `"employees"` - Employee list
  - `"attendance"` - Attendance tracking
  - `"leaves"` - Leave management
  - `"advances"` - Advance management
- **API Calls:**
  - Each tab loads its own data when active

### Fee Management (`/fees`)

- **Tabs:**
  - `"collect-fees"` - Fee collection
  - `"tuition-structures"` - Tuition fee structures
  - `"tuition-balances"` - Tuition balances
  - `"transport-balances"` - Transport balances
- **API Calls:**
  - Each tab loads its own data when active

---

## 7. Implementation Checklist

When implementing a new tab-based module:

1. ✅ Import `useTabNavigation` and `useTabEnabled`
2. ✅ Initialize tab navigation with default tab
3. ✅ Use `useTabEnabled` to get enabled state for each tab
4. ✅ Pass `enabled` parameter to React Query hooks
5. ✅ Use `TabSwitcher` component for UI
6. ✅ Set appropriate `staleTime` and `gcTime` for caching
7. ✅ Use pagination for large datasets
8. ✅ Lazy load dropdowns/options when needed

---

## 8. Common Patterns

### Pattern 1: Always Load Overview Data

```typescript
// Overview cards always need data
const { data: overview } = useOverviewData({
  enabled: true, // Always enabled
});
```

### Pattern 2: Conditional Tab Data

```typescript
// Tab-specific data only when active
const tabEnabled = useTabEnabled("specific-tab");
const { data: tabData } = useTabData({
  enabled: tabEnabled,
});
```

### Pattern 3: Multiple Tabs Share Data

```typescript
// Data needed for multiple tabs
const tabsEnabled = useTabEnabled(["tab1", "tab2"]);
const { data: sharedData } = useSharedData({
  enabled: tabsEnabled,
});
```

### Pattern 4: Lazy Load Dropdowns

```typescript
// Dropdowns only load when form tab opens
useEffect(() => {
  if (activeTab === "form") {
    setDropdownsOpened({ classes: true, groups: true });
  }
}, [activeTab]);
```

---

## 9. Key Files Reference

- **Tab Navigation Hook:** `client/src/lib/hooks/use-tab-navigation.ts`
- **Tab Navigation Docs:** `client/src/lib/hooks/README-tab-navigation.md`
- **Sidebar Component:** `client/src/components/layout/Sidebar.tsx`
- **API Service:** `client/src/lib/api.ts`
- **Example - Reservations:** `client/src/components/features/college/reservations/ReservationManagement.tsx`
- **Example - Academic:** `client/src/components/features/school/academic/AcademicManagement.tsx`

---

## 10. Summary

**How API Calls Work:**

1. **Sidebar Navigation** → Changes route → Component loads
2. **Component Initializes** → Sets default tab → URL updated with `?tab=default`
3. **Tab Navigation** → User clicks tab → `activeTab` changes → URL updated
4. **React Query Hooks** → Check `enabled` parameter → Make API call if enabled
5. **Data Fetched** → Cached by React Query → Component re-renders with data

**Key Principle:**

> **"Only fetch data when the tab that needs it is active"**

This prevents unnecessary API calls, reduces load times, and improves user experience.
