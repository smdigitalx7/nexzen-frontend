import { useCallback } from "react";
import { queryClient } from "@/lib/query";
import type { QueryKey } from "@tanstack/react-query";
import { CacheUtils } from "@/lib/api";

/**
 * Clear API cache for a given query key
 * This is needed because the API layer has its own cache that intercepts requests
 */
function clearApiCacheForQueryKey(queryKey: QueryKey) {
  try {
    // Convert React Query key to API path pattern
    // ["users"] -> "/users"
    // ["school", "classes"] -> "/school/classes"
    // ["college", "subjects", "detail", 123] -> "/college/subjects"
    const pathParts = queryKey.filter((k): k is string => typeof k === 'string' && k !== 'list' && k !== 'detail' && k !== 'root' && !/^\d+$/.test(String(k)));
    
    if (pathParts.length === 0) return;
    
    const pathPattern = `/${pathParts.join('/')}`;
    
    // Clear all cache entries matching this path
    // Pattern matches: "GET:/api/v1/users", "GET:/api/v1/users/roles-and-branches", etc.
    // Use multiple patterns to catch variations
    const patterns = [
      new RegExp(`GET:.*${pathPattern.replace(/\//g, '\\/')}`, 'i'), // Exact match
      new RegExp(`GET:.*${pathPattern.replace(/\//g, '\\/')}.*`, 'i'), // With query params
    ];
    
    patterns.forEach(pattern => {
      CacheUtils.clearByPattern(pattern);
    });
  } catch (error) {
    console.warn('Failed to clear API cache for query key:', queryKey, error);
    // Fallback: clear all cache if pattern matching fails
    try {
      CacheUtils.clearAll();
    } catch (e) {
      console.error('Failed to clear all API cache:', e);
    }
  }
}

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
 * Utility function to invalidate and refetch queries with API cache clearing
 * Use this in mutation hooks for consistent behavior
 * Debounced to prevent UI freezing from multiple rapid invalidations
 */
export function invalidateAndRefetch(queryKey: QueryKey) {
  // Clear API cache first
  clearApiCacheForQueryKey(queryKey);
  
  // Invalidate React Query cache immediately (lightweight operation)
  void queryClient.invalidateQueries({ queryKey });
  
  // Debounce refetch to prevent multiple simultaneous refetches
  if (refetchTimeout) {
    clearTimeout(refetchTimeout);
  }
  
  refetchTimeout = setTimeout(() => {
    // Refetch active queries after debounce delay
    void queryClient.refetchQueries({ queryKey, type: 'active' }).catch(() => {
      // Silently handle errors to prevent UI blocking
    });
    refetchTimeout = null;
  }, REFETCH_DEBOUNCE_MS);
}

export function useGlobalRefetch() {
  const invalidateEntity = useCallback((entity: EntityType) => {
    const queryKeys = ENTITY_QUERY_MAP[entity];

    if (!queryKeys) {
      console.warn(`No query keys found for entity: ${entity}`);
      return;
    }

    // Invalidate all query keys immediately (lightweight)
    queryKeys.forEach((key) => {
      clearApiCacheForQueryKey(key);
      void queryClient.invalidateQueries({ queryKey: key });
    });

    // Debounce refetch to prevent UI freezing
    if (refetchTimeout) {
      clearTimeout(refetchTimeout);
    }
    
    refetchTimeout = setTimeout(() => {
      // Refetch all active queries for the entity
      queryKeys.forEach((key) => {
        void queryClient.refetchQueries({ queryKey: key, type: 'active' }).catch(() => {
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
