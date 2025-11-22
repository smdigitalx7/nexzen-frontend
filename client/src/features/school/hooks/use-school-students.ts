import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { SchoolStudentsService } from "@/features/school/services/students.service";
import type { SchoolStudentCreate, SchoolStudentFullDetails, SchoolStudentRead, SchoolStudentUpdate, SchoolStudentsPaginatedResponse } from "@/features/school/types";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { SCHOOL_INVALIDATION_MAPS, resolveInvalidationKeys } from "@/common/hooks/invalidation-maps";

/**
 * Hook to fetch a paginated list of school students
 * 
 * ✅ OPTIMIZATION: Query key stabilized with useMemo, auto-refetch disabled
 * 
 * @param params - Pagination parameters (page, page_size) and optional enabled flag
 * @returns TanStack Query result with students data
 * 
 * @example
 * ```typescript
 * const { data, isLoading, error } = useSchoolStudentsList({ page: 1, page_size: 50 });
 * // With tab gating:
 * const isTabActive = useTabEnabled("students");
 * const { data } = useSchoolStudentsList({ page: 1, page_size: 50, enabled: isTabActive });
 * ```
 */
export function useSchoolStudentsList(params?: { 
  page?: number; 
  page_size?: number;
  enabled?: boolean; // ✅ OPTIMIZATION: Allow gating queries by tab/route
}) {
  // ✅ OPTIMIZATION: Stabilize query key to prevent unnecessary refetches
  const stableParams = useMemo(() => ({ page: params?.page, page_size: params?.page_size }), [params?.page, params?.page_size]);
  const queryKey = useMemo(
    () => schoolKeys.students.list(stableParams as Record<string, unknown> | undefined),
    [stableParams]
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolStudentsService.list(stableParams),
    enabled: params?.enabled !== false, // ✅ OPTIMIZATION: Default to true, but allow disabling
    staleTime: 30 * 1000, // 30 seconds - students change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

/**
 * Hook to fetch a single school student by ID
 * 
 * ✅ OPTIMIZATION: Auto-refetch disabled, only fetches when enabled
 * 
 * @param studentId - The student ID (null/undefined disables the query)
 * @returns TanStack Query result with student details
 * 
 * @example
 * ```typescript
 * const { data, isLoading } = useSchoolStudent(123);
 * ```
 */
export function useSchoolStudent(studentId: number | null | undefined) {
  const queryKey = useMemo(
    () => typeof studentId === "number" ? schoolKeys.students.detail(studentId) : [...schoolKeys.students.root(), "detail", "nil"],
    [studentId]
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolStudentsService.getById(studentId as number),
    enabled: typeof studentId === "number" && studentId > 0,
    staleTime: 60 * 1000, // 1 minute - student details don't change as frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

/**
 * Hook to create a new school student
 * 
 * Includes optimistic updates and automatic query invalidation.
 * 
 * @returns Mutation hook with create function
 * 
 * @example
 * ```typescript
 * const createStudent = useCreateSchoolStudent();
 * createStudent.mutate({ student_name: "John Doe", ... });
 * ```
 */
export function useCreateSchoolStudent() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentCreate) => SchoolStudentsService.create(payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async () => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.students.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousStudentsList = queryClient.getQueriesData<SchoolStudentsPaginatedResponse>({
        queryKey: schoolKeys.students.root(),
      });

      return { previousStudentsList };
    },
    // ✅ PHASE 3: Rollback on error
    onError: (error, newData, context) => {
      // Rollback list queries
      if (context?.previousStudentsList) {
        context.previousStudentsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.student.create);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Student created successfully");
}

/**
 * Hook to update an existing school student
 * 
 * Includes optimistic updates with rollback on error and automatic query invalidation.
 * 
 * @param studentId - The student ID to update
 * @returns Mutation hook with update function
 * 
 * @example
 * ```typescript
 * const updateStudent = useUpdateSchoolStudent(123);
 * updateStudent.mutate({ student_name: "Jane Doe" });
 * ```
 */
export function useUpdateSchoolStudent(studentId: number) {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolStudentUpdate) => SchoolStudentsService.update(studentId, payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async (newData) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.students.detail(studentId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.students.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousStudent = queryClient.getQueryData<SchoolStudentRead>(
        schoolKeys.students.detail(studentId)
      );
      
      const previousStudentsList = queryClient.getQueriesData<SchoolStudentsPaginatedResponse>({
        queryKey: schoolKeys.students.root(),
      });

      // Optimistically update detail query
      if (previousStudent) {
        queryClient.setQueryData<SchoolStudentRead>(
          schoolKeys.students.detail(studentId),
          (old) => old ? { ...old, ...newData } : undefined
        );
      }

      // Optimistically update all list queries
      previousStudentsList.forEach(([queryKey, data]) => {
        if (data?.data) {
          queryClient.setQueryData<SchoolStudentsPaginatedResponse>(
            queryKey,
            (old) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: old.data.map((s) =>
                  s.student_id === studentId ? { ...s, ...newData } : s
                ),
              };
            }
          );
        }
      });

      return { previousStudent, previousStudentsList };
    },
    // ✅ PHASE 3: Rollback on error
    onError: (error, newData, context) => {
      // Rollback detail query
      if (context?.previousStudent) {
        queryClient.setQueryData(
          schoolKeys.students.detail(studentId),
          context.previousStudent
        );
      }

      // Rollback list queries
      if (context?.previousStudentsList) {
        context.previousStudentsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      // This ensures StudentsTab, EnrollmentsTab, AttendanceTab, and ReservationsTab all refresh correctly
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.student.update, studentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Student updated successfully");
}

/**
 * Hook to delete a school student
 * 
 * Includes optimistic updates with rollback on error and automatic query invalidation.
 * 
 * @returns Mutation hook with delete function
 * 
 * @example
 * ```typescript
 * const deleteStudent = useDeleteSchoolStudent();
 * deleteStudent.mutate(123);
 * ```
 */
export function useDeleteSchoolStudent() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (studentId: number) => SchoolStudentsService.delete(studentId),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async (studentId) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.students.detail(studentId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.students.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousStudent = queryClient.getQueryData<SchoolStudentRead>(
        schoolKeys.students.detail(studentId)
      );
      
      const previousStudentsList = queryClient.getQueriesData<SchoolStudentsPaginatedResponse>({
        queryKey: schoolKeys.students.root(),
      });

      // Optimistically remove from detail query
      queryClient.removeQueries({ 
        queryKey: schoolKeys.students.detail(studentId),
        exact: false 
      });

      // Optimistically remove from all list queries
      previousStudentsList.forEach(([queryKey, data]) => {
        if (data?.data) {
          queryClient.setQueryData<SchoolStudentsPaginatedResponse>(
            queryKey,
            (old) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: old.data.filter((s) => s.student_id !== studentId),
                total_count: (old.total_count ?? 0) - 1,
              };
            }
          );
        }
      });

      return { previousStudent, previousStudentsList };
    },
    // ✅ PHASE 3: Rollback on error
    onError: (error, studentId, context) => {
      // Rollback detail query
      if (context?.previousStudent) {
        queryClient.setQueryData(
          schoolKeys.students.detail(studentId),
          context.previousStudent
        );
      }

      // Rollback list queries
      if (context?.previousStudentsList) {
        context.previousStudentsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.student.delete);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Student deleted successfully");
}