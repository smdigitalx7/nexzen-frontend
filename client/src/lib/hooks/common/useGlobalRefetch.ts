import { useCallback } from "react";
import { queryClient } from "@/lib/query";
import type { QueryKey } from "@tanstack/react-query";

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
export function useGlobalRefetch() {
  const invalidateEntity = useCallback((entity: EntityType) => {
    const queryKeys = ENTITY_QUERY_MAP[entity];

    if (!queryKeys) {
      console.warn(`No query keys found for entity: ${entity}`);
      return;
    }

    // Invalidate all queries for the entity
    queryKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: key });
    });
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, []);

  const invalidateByPattern = useCallback((pattern: string) => {
    queryClient.invalidateQueries({
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
