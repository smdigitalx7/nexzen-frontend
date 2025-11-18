import { useCallback } from "react";
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
 */
// Debounce utility to prevent refetch storms
let refetchTimeout: NodeJS.Timeout | null = null;
const REFETCH_DEBOUNCE_MS = 300;

/**
 * Utility function to invalidate and refetch queries
 * Use this in mutation hooks for consistent behavior
 * Debounced to prevent UI freezing from multiple rapid invalidations
 *
 * ✅ REMOVED: API cache clearing - React Query handles caching properly
 */
export function invalidateAndRefetch(queryKey: QueryKey) {
  // Invalidate React Query cache immediately (lightweight operation)
  void queryClient.invalidateQueries({ queryKey });

  // Debounce refetch to prevent multiple simultaneous refetches
  if (refetchTimeout) {
    clearTimeout(refetchTimeout);
  }

  refetchTimeout = setTimeout(() => {
    // Refetch active queries after debounce delay
    void queryClient.refetchQueries({ queryKey, type: "active" }).catch(() => {
      // Silently handle errors to prevent UI blocking
    });
    refetchTimeout = null;
  }, REFETCH_DEBOUNCE_MS);
}

/**
 * Batch invalidate and refetch multiple query keys
 * Prevents UI freezes from multiple simultaneous invalidations
 * All invalidations are batched and debounced together
 */
let batchTimeout: NodeJS.Timeout | null = null;
const pendingBatchKeys = new Set<string>();

export function batchInvalidateAndRefetch(queryKeys: QueryKey[]) {
  // Add all keys to pending batch
  queryKeys.forEach((key) => {
    // Serialize key for Set comparison
    const keyStr = JSON.stringify(key);
    pendingBatchKeys.add(keyStr);

    // Invalidate immediately (lightweight)
    void queryClient.invalidateQueries({ queryKey: key });
  });

  // Clear existing batch timeout
  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  // Debounce batch refetch
  batchTimeout = setTimeout(() => {
    // Refetch all pending keys
    pendingBatchKeys.forEach((keyStr) => {
      try {
        const key = JSON.parse(keyStr) as QueryKey;
        void queryClient
          .refetchQueries({ queryKey: key, type: "active" })
          .catch(() => {
            // Silently handle errors
          });
      } catch (error) {
        console.warn(
          "Failed to parse query key for batch refetch:",
          keyStr,
          error
        );
      }
    });

    // Clear pending keys
    pendingBatchKeys.clear();
    batchTimeout = null;
  }, REFETCH_DEBOUNCE_MS);
}

export function useGlobalRefetch() {
  const invalidateEntity = useCallback((entity: EntityType) => {
    const queryKeys = ENTITY_QUERY_MAP[entity];

    if (!queryKeys) {
      console.warn(`No query keys found for entity: ${entity}`);
      return;
    }

    // ✅ REMOVED: API cache clearing - React Query handles caching properly
    // Invalidate all query keys immediately (lightweight)
    queryKeys.forEach((key) => {
      void queryClient.invalidateQueries({ queryKey: key });
    });

    // Debounce refetch to prevent UI freezing
    if (refetchTimeout) {
      clearTimeout(refetchTimeout);
    }

    refetchTimeout = setTimeout(() => {
      // Refetch all active queries for the entity
      queryKeys.forEach((key) => {
        void queryClient
          .refetchQueries({ queryKey: key, type: "active" })
          .catch(() => {
            // Silently handle errors
          });
      });
      refetchTimeout = null;
    }, REFETCH_DEBOUNCE_MS);
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
