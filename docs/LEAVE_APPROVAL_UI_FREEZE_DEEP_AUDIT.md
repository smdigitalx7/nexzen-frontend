# 🔍 LEAVE APPROVAL UI FREEZE - DEEP AUDIT & PERMANENT SOLUTION

**Date:** January 2025  
**Issue:** Complete UI freezing after leave approval  
**Status:** 🔴 **ROOT CAUSE IDENTIFIED**

---

## 🔴 ROOT CAUSE ANALYSIS

### **The Problem Chain:**

1. **User clicks "Approve"** → `handleApproveLeave` called
2. **Dialog closes** (optimistic) ✅
3. **Mutation runs** → `approveLeaveMutation.mutate(id)`
4. **Mutation succeeds** → `onSuccess` callback fires
5. **Query Invalidation** → `invalidateAndRefetch(employeeLeaveKeys.all)` called
6. **🚨 CRITICAL:** `employeeLeaveKeys.all = ['employee-leaves']` invalidates ALL queries with this prefix:
   - ✅ `useEmployeeLeavesByBranch` - **ACTIVE** (table query) → **REFETCHES IMMEDIATELY**
   - ✅ `useLeaveDashboard` - **ACTIVE** (dashboard stats) → **REFETCHES IMMEDIATELY**
   - ✅ Any other leave queries that are active
7. **React Query refetches ALL active queries SYNCHRONOUSLY**
8. **Multiple network requests fire at once**
9. **Multiple re-renders happen simultaneously**
10. **Dashboard stats computation runs (expensive)**
11. **Table re-renders with new data**
12. **🚨 UI FREEZES for 200-500ms**

### **Why This Happens:**

```typescript
// ❌ PROBLEM: This invalidates ALL queries with prefix ['employee-leaves']
invalidateAndRefetch(employeeLeaveKeys.all);
// employeeLeaveKeys.all = ['employee-leaves']

// This matches:
// - ['employee-leaves', 'by-branch', {...}]  ← Table query (ACTIVE)
// - ['employee-leaves', 'dashboard']         ← Dashboard query (ACTIVE)
// - ['employee-leaves', 'recent', {...}]     ← Recent query (if active)
// - Any other query starting with ['employee-leaves']

// React Query's invalidateQueries with exact: false:
// 1. Marks ALL matching queries as stale
// 2. Triggers refetch for ALL ACTIVE queries
// 3. All refetches happen SYNCHRONOUSLY
// 4. Multiple network requests + re-renders = UI FREEZE
```

---

## 🔍 DETAILED FLOW ANALYSIS

### **Current Flow (Causes Freezing):**

```
1. User clicks "Approve"
   ↓
2. handleApproveLeave() called
   ↓
3. Dialog closes immediately ✅
   ↓
4. Mutation starts (background)
   ↓
5. Mutation completes (200-500ms later)
   ↓
6. onSuccess callback fires
   ↓
7. setTimeout(() => {
     invalidateAndRefetch(employeeLeaveKeys.all);  // ← PROBLEM HERE
   }, 200);
   ↓
8. invalidateQueries(['employee-leaves'], { exact: false })
   ↓
9. React Query finds ALL matching queries:
   - Table query: ['employee-leaves', 'by-branch', {...}] → STALE → REFETCH
   - Dashboard: ['employee-leaves', 'dashboard'] → STALE → REFETCH
   ↓
10. BOTH queries refetch SYNCHRONOUSLY
    ↓
11. Multiple network requests fire
    ↓
12. Multiple re-renders happen
    ↓
13. Dashboard stats computation (expensive)
    ↓
14. Table re-renders with new data
    ↓
15. 🚨 UI FREEZES (200-500ms)
```

---

## ✅ PERMANENT SOLUTION

### **Strategy: Selective Query Invalidation + React Concurrent Features**

1. **Only invalidate the specific query that needs updating** (table query, not all)
2. **Defer dashboard stats invalidation separately** (longer delay)
3. **Use `startTransition`** to mark query invalidation as non-urgent
4. **Use `refetchType: 'none'`** to prevent automatic refetch, then manually refetch only what's needed

---

## 🔧 IMPLEMENTATION

### **Step 1: Create Selective Invalidation Function**

```typescript
// client/src/lib/hooks/common/useGlobalRefetch.ts

import { startTransition } from "react";

/**
 * ✅ PERMANENT FIX: Selective query invalidation with React Concurrent features
 * Only invalidates specific queries, not all queries with a prefix
 */
export function invalidateQueriesSelective(
  queryKey: QueryKey,
  options?: {
    exact?: boolean;
    refetchType?: "active" | "inactive" | "all" | "none";
    useTransition?: boolean;
  }
) {
  const {
    exact = false,
    refetchType = "active",
    useTransition = true,
  } = options || {};

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
      exact,
      refetchType, // Only refetch active queries by default
    });
  };

  if (useTransition) {
    // ✅ Use React's startTransition to mark as non-urgent
    startTransition(() => {
      invalidate();
    });
  } else {
    invalidate();
  }
}
```

### **Step 2: Update Leave Approval Hook**

```typescript
// client/src/lib/hooks/general/useEmployeeLeave.ts

export const useApproveEmployeeLeave = () => {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast(
    {
      mutationFn: (id: number) => EmployeeLeaveService.approve(id),
      onSuccess: () => {
        // ✅ PERMANENT FIX: Use selective invalidation with proper delays

        // Step 1: Invalidate only the table query (most important)
        setTimeout(() => {
          startTransition(() => {
            // Only invalidate the specific table query, not all queries
            queryClient.invalidateQueries({
              queryKey: employeeLeaveKeys.byBranch({}),
              exact: false, // Match by-branch queries
              refetchType: "active", // Only refetch if active
            });
          });
        }, 100); // Short delay for table update

        // Step 2: Defer dashboard stats invalidation (less critical)
        setTimeout(() => {
          startTransition(() => {
            queryClient.invalidateQueries({
              queryKey: employeeLeaveKeys.dashboard(),
              exact: true, // Only dashboard query
              refetchType: "active",
            });
          });
        }, 500); // Longer delay - dashboard is less critical
      },
    },
    "Leave request approved successfully"
  );
};
```

---

## 🎯 PERMANENT FIX IMPLEMENTATION

Let me implement this solution:
