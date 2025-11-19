import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { CollegeStudentsService } from "@/lib/services/college/students.service";
import type {
  CollegeStudentCreate,
  CollegeStudentFullDetails,
  CollegeStudentRead,
  CollegeStudentUpdate,
  CollegeStudentsPaginatedResponse,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { batchInvalidateQueries } from "../common/useGlobalRefetch";
import { COLLEGE_INVALIDATION_MAPS, resolveInvalidationKeys } from "../common/invalidation-maps";

/**
 * ✅ OPTIMIZATION: Query key stabilized with useMemo, auto-refetch disabled
 */
export function useCollegeStudentsList(params?: { page?: number; pageSize?: number }) {
  // ✅ OPTIMIZATION: Stabilize query key to prevent unnecessary refetches
  const stableParams = useMemo(() => params, [params?.page, params?.pageSize]);
  const queryKey = useMemo(
    () => collegeKeys.students.list(stableParams),
    [stableParams]
  );

  return useQuery({
    queryKey,
    queryFn: () => CollegeStudentsService.list(stableParams),
    staleTime: 30 * 1000, // 30 seconds - students change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

/**
 * ✅ OPTIMIZATION: Query key stabilized, auto-refetch disabled
 */
export function useCollegeStudent(studentId: number | null | undefined) {
  const queryKey = useMemo(
    () => studentId ? collegeKeys.students.detail(studentId) : [...collegeKeys.students.root(), "detail", "nil"],
    [studentId]
  );

  return useQuery({
    queryKey,
    queryFn: () => CollegeStudentsService.getById(studentId as number),
    enabled: typeof studentId === "number" && studentId > 0,
    staleTime: 60 * 1000, // 1 minute - student details don't change as frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useCreateCollegeStudent() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentCreate) => CollegeStudentsService.create(payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async () => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.students.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousStudentsList = queryClient.getQueriesData<CollegeStudentsPaginatedResponse>({
        queryKey: collegeKeys.students.root(),
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
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.student.create);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Student created successfully");
}

export function useUpdateCollegeStudent(studentId: number) {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeStudentUpdate) =>
      CollegeStudentsService.update(studentId, payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async (newData) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.students.detail(studentId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.students.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousStudent = queryClient.getQueryData<CollegeStudentRead>(
        collegeKeys.students.detail(studentId)
      );
      
      const previousStudentsList = queryClient.getQueriesData<CollegeStudentsPaginatedResponse>({
        queryKey: collegeKeys.students.root(),
      });

      // Optimistically update detail query
      if (previousStudent) {
        queryClient.setQueryData<CollegeStudentRead>(
          collegeKeys.students.detail(studentId),
          (old) => old ? { ...old, ...newData } : undefined
        );
      }

      // Optimistically update all list queries
      previousStudentsList.forEach(([queryKey, data]) => {
        if (data?.data) {
          queryClient.setQueryData<CollegeStudentsPaginatedResponse>(
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
          collegeKeys.students.detail(studentId),
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
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.student.update, studentId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Student updated successfully");
}

export function useDeleteCollegeStudent() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (studentId: number) => CollegeStudentsService.delete(studentId),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async (studentId) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.students.detail(studentId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.students.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousStudent = queryClient.getQueryData<CollegeStudentRead>(
        collegeKeys.students.detail(studentId)
      );
      
      const previousStudentsList = queryClient.getQueriesData<CollegeStudentsPaginatedResponse>({
        queryKey: collegeKeys.students.root(),
      });

      // Optimistically remove from detail query
      queryClient.removeQueries({ 
        queryKey: collegeKeys.students.detail(studentId),
        exact: false 
      });

      // Optimistically remove from all list queries
      previousStudentsList.forEach(([queryKey, data]) => {
        if (data?.data) {
          queryClient.setQueryData<CollegeStudentsPaginatedResponse>(
            queryKey,
            (old) => {
              if (!old?.data) return old;
              return {
                ...old,
                data: old.data.filter((s) => s.student_id !== studentId),
                total_count: old.total_count - 1,
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
          collegeKeys.students.detail(studentId),
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
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.student.delete);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Student deleted successfully");
}


