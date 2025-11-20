# 🔍 Deep Architectural Analysis: Logout Request Issue

## Problem Statement

After clicking logout, 4 requests are still being sent:

- `academic-years` (2x)
- `activity-summary` (2x)

These requests complete successfully (200) AFTER the logout request completes.

---

## Root Cause Analysis

### 1. **Component Lifecycle Issue** 🔴 CRITICAL

**Problem**: Components remain mounted during logout transition.

**Components Affected**:

- `AcademicYearSwitcher` - Located in Header/Layout (always mounted when authenticated)
- `AdminDashboard` - Uses `useActivitySummary` hook
- Other dashboard components that use these hooks

**Timeline**:

```
T0: User clicks logout
T1: logout() function starts
T2: isLoggingOut = true (set in store)
T3: Query cancellation happens
T4: State cleared (isAuthenticated = false)
T5: Toast shown
T6: 1500ms delay starts...
T7: Components still mounted, React Query sees enabled change
T8: Queries trigger because components re-render
T9: Redirect happens (window.location.href = "/login")
```

**Why This Happens**:

- `AppRouter` doesn't unmount authenticated components immediately
- Components stay mounted during the 1500ms delay
- When `isAuthenticated` changes, React Query's `enabled` check re-evaluates
- If queries were previously enabled, they might trigger again

---

### 2. **React Query `enabled` Check Timing** 🔴 CRITICAL

**Problem**: `enabled` check happens AFTER query is scheduled.

**Current Hook Implementation**:

```typescript
export const useAcademicYears = (options?: { enabled?: boolean }) => {
  const { isAuthenticated, isLoggingOut } = useAuthStore();

  return useQuery({
    queryKey: ["academic-years"],
    queryFn: () => AcademicYearService.listAcademicYears(),
    enabled: options?.enabled !== false && isAuthenticated && !isLoggingOut,
    refetchOnMount: true, // ⚠️ PROBLEM: This triggers refetch even if enabled changes
  });
};
```

**Issue**:

- `refetchOnMount: true` means React Query will refetch when component mounts OR when `enabled` changes from `false` to `true`
- When logout happens, `isAuthenticated` changes from `true` to `false`
- But React Query might have already scheduled the query before the state change
- The `enabled` check is evaluated asynchronously

---

### 3. **API Layer Not Checking `isLoggingOut`** 🟠 HIGH

**Problem**: The `api.ts` fetch function checks `isLoggingOut`, but React Query queries might bypass this.

**Current Implementation**:

```typescript
// api.ts
if (!noAuth) {
  if (state.isLoggingOut) {
    throw new Error("Request cancelled: logout in progress");
  }
}
```

**Issue**:

- This check happens INSIDE the `queryFn`
- But React Query might have already started executing the query
- The check happens too late

---

### 4. **Component Unmounting Delay** 🟠 HIGH

**Problem**: Components stay mounted for 1500ms after logout starts.

**Current Flow**:

```typescript
logout: async () => {
  // ... cancellation logic ...

  setTimeout(() => {
    window.location.href = "/login"; // 1500ms delay
  }, 1500);
};
```

**Issue**:

- During this 1500ms, components are still mounted
- React Query hooks are still active
- State changes trigger re-renders
- Queries might be triggered by these re-renders

---

### 5. **React Query Cancellation Not Working** 🟡 MEDIUM

**Problem**: `cancelQueries()` might not cancel queries that are already executing.

**Current Implementation**:

```typescript
await queryClient.cancelQueries();
queryClient.removeQueries();
queryClient.clear();
queryClient.resetQueries();
```

**Issue**:

- `cancelQueries()` only cancels queries that haven't started executing yet
- If a query is already in-flight (fetch request sent), it won't be cancelled
- The AbortController registry should handle this, but timing matters

---

## Solution Architecture

### Solution 1: Immediate Component Unmounting ✅ RECOMMENDED

**Strategy**: Unmount authenticated components IMMEDIATELY when logout starts.

**Implementation**:

```typescript
logout: async () => {
  // Step 1: Set logout flag FIRST
  set((state) => {
    state.isLoggingOut = true;
    state.isAuthenticated = false; // ⚠️ CRITICAL: Set this immediately
  });

  // Step 2: Cancel queries (components will unmount due to isAuthenticated = false)
  await queryClient.cancelQueries();
  cancelAllRequests();

  // Step 3: Clear state
  // ... rest of logout logic
};
```

**Why This Works**:

- `AppRouter` checks `isAuthenticated` to decide what to render
- Setting `isAuthenticated = false` immediately causes `AppRouter` to unmount authenticated components
- Unmounted components = no React Query hooks active = no queries triggered

---

### Solution 2: Prevent Query Execution in API Layer ✅ REQUIRED

**Strategy**: Check `isLoggingOut` at the START of the API call, not inside.

**Implementation**:

```typescript
// In each service function
export const AcademicYearService = {
  listAcademicYears: async (): Promise<AcademicYearRead[]> => {
    // Check logout state BEFORE making request
    const authState = useAuthStore.getState();
    if (authState.isLoggingOut || !authState.isAuthenticated) {
      throw new Error("Request cancelled: logout in progress");
    }

    return Api.get<AcademicYearRead[]>("/academic-years");
  },
};
```

**Why This Works**:

- Catches requests even if React Query scheduled them
- Fails fast before network request is made
- Works as a safety net

---

### Solution 3: Remove `refetchOnMount` During Logout ✅ RECOMMENDED

**Strategy**: Dynamically disable `refetchOnMount` when `isLoggingOut` is true.

**Implementation**:

```typescript
export const useAcademicYears = (options?: { enabled?: boolean }) => {
  const { isAuthenticated, isLoggingOut } = useAuthStore();

  return useQuery({
    queryKey: ["academic-years"],
    queryFn: () => AcademicYearService.listAcademicYears(),
    enabled: options?.enabled !== false && isAuthenticated && !isLoggingOut,
    refetchOnMount: !isLoggingOut, // ⚠️ Disable refetch during logout
  });
};
```

---

### Solution 4: Use `queryFn` Guard ✅ REQUIRED

**Strategy**: Check logout state INSIDE `queryFn` before making request.

**Implementation**:

```typescript
export const useAcademicYears = (options?: { enabled?: boolean }) => {
  const { isAuthenticated, isLoggingOut } = useAuthStore();

  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      // Double-check logout state INSIDE queryFn
      const currentState = useAuthStore.getState();
      if (currentState.isLoggingOut || !currentState.isAuthenticated) {
        throw new Error("Query cancelled: logout in progress");
      }

      return AcademicYearService.listAcademicYears();
    },
    enabled: options?.enabled !== false && isAuthenticated && !isLoggingOut,
  });
};
```

---

## Recommended Fix Order

1. **IMMEDIATE**: Set `isAuthenticated = false` at the START of logout (Solution 1)
2. **IMMEDIATE**: Add `queryFn` guard in all hooks (Solution 4)
3. **HIGH PRIORITY**: Add API layer check in services (Solution 2)
4. **MEDIUM PRIORITY**: Disable `refetchOnMount` during logout (Solution 3)

---

## Testing Strategy

1. **Test Case 1**: Click logout → Check network tab → No requests after logout
2. **Test Case 2**: Click logout → Immediately click login → No race conditions
3. **Test Case 3**: Click logout → Check console → No React Query errors
4. **Test Case 4**: Click logout → Check components → All unmount immediately

---

## Expected Behavior After Fix

```
T0: User clicks logout
T1: isLoggingOut = true, isAuthenticated = false (IMMEDIATE)
T2: AppRouter unmounts authenticated components (IMMEDIATE)
T3: React Query hooks unmount (no queries can trigger)
T4: Cancel any in-flight queries
T5: Cancel fetch requests
T6: Show toast
T7: Redirect after delay
```

**Result**: Zero requests after logout starts.
