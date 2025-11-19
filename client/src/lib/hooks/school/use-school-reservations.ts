import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import type {
  SchoolReservationListResponse,
  SchoolReservationRead,
  SchoolReservationStatusEnum,
  SchoolReservationCreate,
  SchoolReservationListItem,
  SchoolReservationConcessionUpdate,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { batchInvalidateQueries } from "../common/useGlobalRefetch";
import { SCHOOL_INVALIDATION_MAPS, resolveInvalidationKeys } from "../common/invalidation-maps";

/**
 * ✅ OPTIMIZATION: Query key stabilized with useMemo, auto-refetch disabled
 */
export function useSchoolReservationsList(params?: {
  page?: number;
  page_size?: number;
  class_id?: number;
  status?: string;
}) {
  // ✅ OPTIMIZATION: Stabilize query key to prevent unnecessary refetches
  const stableParams = useMemo(
    () => params,
    [params?.page, params?.page_size, params?.class_id, params?.status]
  );
  const queryKey = useMemo(
    () => schoolKeys.reservations.list(stableParams as Record<string, unknown> | undefined),
    [stableParams]
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolReservationsService.list(stableParams),
    staleTime: 30 * 1000, // 30 seconds - reservations change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

/**
 * ✅ OPTIMIZATION: Query key stabilized, auto-refetch disabled
 */
export function useSchoolReservation(reservationId: number | null | undefined) {
  const queryKey = useMemo(
    () =>
      typeof reservationId === "number"
        ? schoolKeys.reservations.detail(reservationId)
        : [...schoolKeys.reservations.root(), "detail", "nil"],
    [reservationId]
  );

  return useQuery({
    queryKey,
    queryFn: () =>
      SchoolReservationsService.getById(
        reservationId as number
      ),
    enabled: typeof reservationId === "number" && reservationId > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useCreateSchoolReservation() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolReservationCreate) => SchoolReservationsService.create(payload),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async () => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.reservations.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousReservationsList = queryClient.getQueriesData<SchoolReservationListResponse>({
        queryKey: schoolKeys.reservations.root(),
      });

      return { previousReservationsList };
    },
    // ✅ PHASE 3: Rollback on error
    onError: (error, newData, context) => {
      // Rollback list queries
      if (context?.previousReservationsList) {
        context.previousReservationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.reservation.create);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation created successfully");
}

export function useUpdateSchoolReservation(reservationId: number) {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (form: FormData) =>
      SchoolReservationsService.update(reservationId, form),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    // Note: FormData updates are complex, so we invalidate on success instead
    // For simple field updates, we could optimistically update here
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.reservation.update, reservationId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation updated successfully");
}

export function useDeleteSchoolReservation() {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      SchoolReservationsService.delete(reservationId),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async (reservationId) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.reservations.detail(reservationId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.reservations.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousReservation = queryClient.getQueryData<SchoolReservationRead>(
        schoolKeys.reservations.detail(reservationId)
      );
      
      const previousReservationsList = queryClient.getQueriesData<SchoolReservationListResponse>({
        queryKey: schoolKeys.reservations.root(),
      });

      // Optimistically remove from detail query
      queryClient.removeQueries({ 
        queryKey: schoolKeys.reservations.detail(reservationId),
        exact: false 
      });

      // Optimistically remove from all list queries
      previousReservationsList.forEach(([queryKey, data]) => {
        if (data?.reservations) {
          queryClient.setQueryData<SchoolReservationListResponse>(
            queryKey,
            (old) => {
              if (!old?.reservations) return old;
              return {
                ...old,
                reservations: old.reservations.filter((r) => r.reservation_id !== reservationId),
                total_count: old.total_count - 1,
              };
            }
          );
        }
      });

      return { previousReservation, previousReservationsList };
    },
    // ✅ PHASE 3: Rollback on error
    onError: (error, reservationId, context) => {
      // Rollback detail query
      if (context?.previousReservation) {
        queryClient.setQueryData(
          schoolKeys.reservations.detail(reservationId),
          context.previousReservation
        );
      }

      // Rollback list queries
      if (context?.previousReservationsList) {
        context.previousReservationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.reservation.delete);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation deleted successfully");
}

export function useUpdateSchoolReservationStatus(reservationId: number) {
  const queryClient = useQueryClient();

  return useMutationWithSuccessToast({
    mutationFn: ({
      status,
      remarks,
    }: {
      status: SchoolReservationStatusEnum;
      remarks?: string;
    }) =>
      SchoolReservationsService.updateStatus(reservationId, status, remarks),
    // ✅ PHASE 3: Optimistic update for immediate UI feedback
    onMutate: async ({ status, remarks }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.reservations.detail(reservationId),
        exact: false 
      });
      await queryClient.cancelQueries({ 
        queryKey: schoolKeys.reservations.root(),
        exact: false 
      });

      // Snapshot previous values for rollback
      const previousReservation = queryClient.getQueryData<SchoolReservationRead>(
        schoolKeys.reservations.detail(reservationId)
      );
      
      const previousReservationsList = queryClient.getQueriesData<SchoolReservationListResponse>({
        queryKey: schoolKeys.reservations.root(),
      });

      // Optimistically update detail query
      if (previousReservation) {
        queryClient.setQueryData<SchoolReservationRead>(
          schoolKeys.reservations.detail(reservationId),
          (old) => old ? { ...old, status, remarks: remarks ?? old.remarks } : undefined
        );
      }

      // Optimistically update all list queries
      previousReservationsList.forEach(([queryKey, data]) => {
        if (data?.reservations) {
          queryClient.setQueryData<SchoolReservationListResponse>(
            queryKey,
            (old) => {
              if (!old?.reservations) return old;
              return {
                ...old,
                reservations: old.reservations.map((r) =>
                  r.reservation_id === reservationId 
                    ? { ...r, status: status as string, remarks: remarks ?? r.remarks } 
                    : r
                ),
              };
            }
          );
        }
      });

      return { previousReservation, previousReservationsList };
    },
    // ✅ PHASE 3: Rollback on error
    onError: (error, variables, context) => {
      // Rollback detail query
      if (context?.previousReservation) {
        queryClient.setQueryData(
          schoolKeys.reservations.detail(reservationId),
          context.previousReservation
        );
      }

      // Rollback list queries
      if (context?.previousReservationsList) {
        context.previousReservationsList.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    // ✅ FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.reservation.update, reservationId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation status updated successfully");
}

/**
 * ✅ OPTIMIZATION: Auto-refetch disabled - dashboard stats are shown on-demand
 */
export function useSchoolReservationsDashboard() {
  const queryKey = useMemo(
    () => [...schoolKeys.reservations.root(), "dashboard"],
    []
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolReservationsService.getDashboard(),
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
export function useSchoolReservationsRecent(limit?: number) {
  const queryKey = useMemo(
    () => [...schoolKeys.reservations.root(), "recent", { limit }],
    [limit]
  );

  return useQuery({
    queryKey,
    queryFn: () => SchoolReservationsService.getRecent(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
  });
}

export function useUpdateSchoolReservationConcession(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolReservationConcessionUpdate) =>
      SchoolReservationsService.updateConcession(reservationId, payload),
    // ✅ VALIDATION FIX: Use invalidation map to ensure all related queries are invalidated
    onSuccess: () => {
      const keysToInvalidate = resolveInvalidationKeys(SCHOOL_INVALIDATION_MAPS.reservation.update, reservationId);
      batchInvalidateQueries(keysToInvalidate);
    },
  }, "Reservation concession updated successfully");
}
