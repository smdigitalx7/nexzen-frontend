import { useCallback } from "react";
import { startTransition } from "react";
import { queryClient } from "@/lib/query";
import type { QueryKey } from "@tanstack/react-query";

/**
 * ✅ REMOVED: API cache clearing - React Query handles caching properly
 * We no longer need to clear API-level cache as it was causing conflicts
 * React Query's invalidation is sufficient and more reliable
 */

/**
 * Entity Query Key Mapping
 * Maps entity names to their query key prefixes
 */
export const ENTITY_QUERY_MAP = {
  employees: [["employees"]] as QueryKey[],
  users: [["users"]] as QueryKey[],
  classes: [["school", "classes"]] as QueryKey[],
  students: [
    ["school", "students"],
    ["college", "students"],
  ] as QueryKey[],
  payrolls: [["payrolls"]] as QueryKey[],
  transport: [["transport"]] as QueryKey[],
  branches: [["branches"]] as QueryKey[],
  academicYears: [["academic-years"], ["academic-year"]] as QueryKey[],
  subjects: [
    ["school", "subjects"],
    ["college", "subjects"],
  ] as QueryKey[],
  courses: [["college", "courses"]] as QueryKey[],
  exams: [
    ["school", "exams"],
    ["college", "exams"],
  ] as QueryKey[],
  attendance: [
    ["school", "attendance"],
    ["college", "attendance"],
  ] as QueryKey[],
  marks: [
    ["school", "marks"],
    ["college", "marks"],
  ] as QueryKey[],
  fees: [
    ["school", "fees"],
    ["college", "fees"],
  ] as QueryKey[],
  income: [
    ["school", "income"],
    ["college", "income"],
  ] as QueryKey[],
  expenditure: [
    ["school", "expenditure"],
    ["college", "expenditure"],
  ] as QueryKey[],
  reservations: [
    ["school", "reservations"],
    ["college", "reservations"],
  ] as QueryKey[],
  admissions: [
    ["school", "admissions"],
    ["college", "admissions"],
  ] as QueryKey[],
  enrollments: [
    ["school", "enrollments"],
    ["college", "enrollments"],
  ] as QueryKey[],
  announcements: [["announcements"]] as QueryKey[],
  distanceSlabs: [["distance-slabs"]] as QueryKey[],
  grades: [["grades"]] as QueryKey[],
  roles: [["roles"]] as QueryKey[],
  advances: [["advances"]] as QueryKey[],
  leaves: [["employee-leaves"]] as QueryKey[],
  employeeAttendances: [["employee-attendances"]] as QueryKey[],
} as const;

export type EntityType = keyof typeof ENTITY_QUERY_MAP;

/**
 * Global Refetch Hook
 * Provides centralized query invalidation for entities
 * 
 * Note: React Query handles refetching automatically - no debouncing needed
 */

/**
 * Utility function to invalidate queries
 * React Query automatically handles refetching in the background
 * Use this in mutation hooks for consistent behavior
 *
 * Note: React Query handles caching, deduplication, and background refetching automatically
 */
export function invalidateQueries(queryKey: QueryKey) {
  // Invalidate React Query cache - React Query will automatically refetch active queries
  // ✅ FIX: Explicitly set exact: false to ensure prefix matching works correctly
  void queryClient.invalidateQueries({ queryKey, exact: false });
}

/**
 * @deprecated Use invalidateQueries() instead
 * This function is kept for backward compatibility but simply calls invalidateQueries()
 */
export function invalidateAndRefetch(queryKey: QueryKey) {
  invalidateQueries(queryKey);
}

/**
 * ✅ PERMANENT FIX: Selective query invalidation with React Concurrent features
 * Only invalidates specific queries, prevents UI freezing by:
 * 1. Using startTransition to mark as non-urgent
 * 2. Only invalidating exact matches or specific patterns
 * 3. Deferring heavy operations
 * 
 * @param queryKey - The query key to invalidate
 * @param options - Invalidation options
 */
export function invalidateQueriesSelective(
  queryKey: QueryKey,
  options?: {
    exact?: boolean;
    refetchType?: 'active' | 'inactive' | 'all' | 'none';
    useTransition?: boolean;
    delay?: number;
  }
) {
  const { 
    exact = true, // Default to exact match to prevent over-invalidation
    refetchType = 'active', 
    useTransition = true,
    delay = 0
  } = options || {};
  
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
      exact,
      refetchType, // Only refetch active queries by default
    });
  };
  
  const execute = () => {
    if (useTransition) {
      // ✅ Use React's startTransition to mark as non-urgent (prevents UI blocking)
      startTransition(() => {
        invalidate();
      });
    } else {
      invalidate();
    }
  };
  
  if (delay > 0) {
    setTimeout(execute, delay);
  } else {
    execute();
  }
}

/**
 * Batch invalidate multiple query keys
 * React Query handles refetching automatically
 * 
 * ✅ FIX: Explicitly set exact: false to ensure prefix matching works correctly
 */
export function batchInvalidateQueries(queryKeys: QueryKey[]) {
  // Invalidate all keys - React Query handles refetching automatically
  // ✅ FIX: Explicitly set exact: false to ensure prefix matching works correctly
  queryKeys.forEach((key) => {
    void queryClient.invalidateQueries({ queryKey: key, exact: false });
  });
}

/**
 * @deprecated Use batchInvalidateQueries() instead
 */
export function batchInvalidateAndRefetch(queryKeys: QueryKey[]) {
  batchInvalidateQueries(queryKeys);
}

export function useGlobalRefetch() {
  const invalidateEntity = useCallback((entity: EntityType) => {
    const queryKeys = ENTITY_QUERY_MAP[entity];

    if (!queryKeys) {
      console.warn(`No query keys found for entity: ${entity}`);
      return;
    }

    // Invalidate all query keys - React Query handles refetching automatically
    // ✅ FIX: Explicitly set exact: false to ensure prefix matching works correctly
    queryKeys.forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: key, exact: false });
    });
  }, []);

  const invalidateAll = useCallback(() => {
    void queryClient.invalidateQueries();
  }, []);

  const invalidateByPattern = useCallback((pattern: string) => {
    void queryClient.invalidateQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return queryKey.some(
          (key) => typeof key === "string" && key.includes(pattern)
        );
      },
    });
  }, []);

  return {
    invalidateEntity,
    invalidateAll,
    invalidateByPattern,
  };
}
