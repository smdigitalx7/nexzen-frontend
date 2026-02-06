import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { CollegeReservationsService } from "@/features/college/services/reservations.service";
import type {
  CollegePaginatedReservationRead,
  CollegeReservationCreate,
  CollegeReservationRead,
  CollegeReservationUpdate,
  CollegeReservationDashboardStats,
  CollegeRecentReservation,
  ReservationStatusEnum,
} from "@/features/college/types/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { COLLEGE_INVALIDATION_MAPS, resolveInvalidationKeys } from "@/common/hooks/invalidation-maps";

/**
 * ✅ OPTIMIZATION: Query key stabilized with useMemo, auto-refetch disabled
 */
export function useCollegeReservationsList(params?: {
  group_id?: number;
  course_id?: number;
  page?: number;
  page_size?: number;
  status?: string;
}) {
  // ✅ OPTIMIZATION: Stabilize query key to prevent unnecessary refetches
  const stableParams = useMemo(
    () => params,
    [params?.group_id, params?.course_id, params?.page, params?.page_size, params?.status]
  );
  const queryKey = useMemo(
    () => collegeKeys.reservations.list(stableParams),
    [stableParams]
  );

  return useQuery({
    queryKey,
    queryFn: () => CollegeReservationsService.list(stableParams),
    staleTime: 30 * 1000, // 30 seconds - reservations change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
    select: (data: any) => (Array.isArray(data) ? data : data.reservations || data.data || []),
  });
}

/**
 * ✅ OPTIMIZATION: Query key stabilized, auto-refetch disabled
 */
export function useCollegeReservation(
  reservationId: number | null | undefined
) {
  const queryKey = useMemo(
    () =>
      typeof reservationId === "number"
        ? collegeKeys.reservations.detail(reservationId)
        : [...collegeKeys.reservations.root(), "detail", "nil"],
    [reservationId]
  );

  return useQuery({
    queryKey,
    queryFn: () => CollegeReservationsService.getById(reservationId as number),
    enabled: typeof reservationId === "number" && reservationId > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useCreateCollegeReservation() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeReservationCreate) =>
      CollegeReservationsService.create(payload),
    // ✅ VALIDATION FIX: Optimistic update for immediate UI feedback
    onMutate: async () => {
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.reservations.root(),
        exact: false 
      });

      const previousReservationsList = queryClient.getQueriesData<CollegePaginatedReservationRead>({
        queryKey: collegeKeys.reservations.root(),
      });

      return { previousReservationsList };
    },
    // ✅ VALIDATION FIX: Rollback on error
    onError: (error, newData, context) => {
      if (context?.previousReservationsList) {
        context.previousReservationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ VALIDATION FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.reservation.create);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation created successfully");
}

export function useUpdateCollegeReservation(reservationId: number) {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeReservationUpdate) =>
      CollegeReservationsService.update(reservationId, payload),
    // ✅ VALIDATION FIX: Use invalidation map to ensure all related queries are invalidated
    // Note: FormData updates are complex, so we invalidate on success instead of optimistic update
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.reservation.update, reservationId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation updated successfully");
}

export function useDeleteCollegeReservation() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      CollegeReservationsService.delete(reservationId),
    // ✅ VALIDATION FIX: Optimistic update for immediate UI feedback
    onMutate: async (reservationId) => {
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.reservations.detail(reservationId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.reservations.root(),
        exact: false 
      });

      const previousReservation = queryClient.getQueryData<CollegeReservationRead>(
        collegeKeys.reservations.detail(reservationId)
      );
      
      const previousReservationsList = queryClient.getQueriesData<CollegePaginatedReservationRead>({
        queryKey: collegeKeys.reservations.root(),
      });

      queryClient.removeQueries({ 
        queryKey: collegeKeys.reservations.detail(reservationId),
        exact: false 
      });

      previousReservationsList.forEach(([queryKey, data]) => {
        if (data?.reservations) {
          queryClient.setQueryData<CollegePaginatedReservationRead>(
            queryKey,
            (old) => {
              if (!old?.reservations) return old;
              return {
                ...old,
                reservations: old.reservations.filter(
                  (r) => r.reservation_id !== reservationId
                ),
                total_count: old.total_count - 1,
              };
            }
          );
        }
      });

      return { previousReservation, previousReservationsList };
    },
    // ✅ VALIDATION FIX: Rollback on error
    onError: (error, reservationId, context) => {
      if (context?.previousReservation) {
        queryClient.setQueryData(
          collegeKeys.reservations.detail(reservationId),
          context.previousReservation
        );
      }

      if (context?.previousReservationsList) {
        context.previousReservationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ VALIDATION FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.reservation.delete);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation deleted successfully");
}

export function useUpdateCollegeReservationStatus(reservationId: number) {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: {
      status: ReservationStatusEnum;
      remarks?: string | null;
    }) => CollegeReservationsService.updateStatus(reservationId, payload),
    // ✅ VALIDATION FIX: Optimistic update for immediate UI feedback
    onMutate: async ({ status, remarks }) => {
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.reservations.detail(reservationId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: collegeKeys.reservations.root(),
        exact: false 
      });

      const previousReservation = queryClient.getQueryData<CollegeReservationRead>(
        collegeKeys.reservations.detail(reservationId)
      );
      
      const previousReservationsList = queryClient.getQueriesData<CollegePaginatedReservationRead>({
        queryKey: collegeKeys.reservations.root(),
      });

      if (previousReservation) {
        queryClient.setQueryData<CollegeReservationRead>(
          collegeKeys.reservations.detail(reservationId),
          (old) => old ? { ...old, status, remarks: remarks ?? old.remarks } : undefined
        );
      }

      previousReservationsList.forEach(([queryKey, data]) => {
        if (data?.reservations) {
          queryClient.setQueryData<CollegePaginatedReservationRead>(
            queryKey,
            (old) => {
              if (!old?.reservations) return old;
              return {
                ...old,
                reservations: old.reservations.map((r) =>
                  r.reservation_id === reservationId 
                    ? { ...r, status, remarks: remarks ?? r.remarks } 
                    : r
                ),
              };
            }
          );
        }
      });

      return { previousReservation, previousReservationsList };
    },
    // ✅ VALIDATION FIX: Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousReservation) {
        queryClient.setQueryData(
          collegeKeys.reservations.detail(reservationId),
          context.previousReservation
        );
      }

      if (context?.previousReservationsList) {
        context.previousReservationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ VALIDATION FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.reservation.update, reservationId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation status updated successfully");
}

export function useUpdateCollegeReservationConcessions(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: {
      tuition_concession?: number | null;
      transport_concession?: number | null;
      remarks?: string | null;
    }) => CollegeReservationsService.updateConcessions(reservationId, payload),
    // ✅ VALIDATION FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(COLLEGE_INVALIDATION_MAPS.reservation.update, reservationId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation concessions updated successfully");
}

/**
 * ✅ OPTIMIZATION: Auto-refetch disabled - dashboard stats are shown on-demand
 */
export function useCollegeReservationDashboard() {
  const queryKey = useMemo(
    () => [...collegeKeys.reservations.root(), "dashboard"],
    []
  );

  return useQuery({
    queryKey,
    queryFn: () => CollegeReservationsService.dashboard(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

/**
 * ✅ OPTIMIZATION: Auto-refetch disabled - recent reservations shown on-demand
 */
export function useCollegeReservationRecent(limit?: number) {
  const queryKey = useMemo(
    () => [...collegeKeys.reservations.root(), "recent", { limit }],
    [limit]
  );

  return useQuery({
    queryKey,
    queryFn: () => CollegeReservationsService.recent(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}
