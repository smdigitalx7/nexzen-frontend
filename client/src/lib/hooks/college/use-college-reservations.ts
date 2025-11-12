import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import type {
  CollegePaginatedReservationRead,
  CollegeReservationCreate,
  CollegeReservationRead,
  CollegeReservationUpdate,
  CollegeReservationDashboardStats,
  CollegeRecentReservation,
  ReservationStatusEnum,
} from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { invalidateAndRefetch } from "../common/useGlobalRefetch";

export function useCollegeReservationsList(params?: {
  group_id?: number;
  course_id?: number;
  page?: number;
  page_size?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: collegeKeys.reservations.list(params),
    queryFn: () => CollegeReservationsService.list(params),
  });
}

export function useCollegeReservation(
  reservationId: number | null | undefined
) {
  return useQuery({
    queryKey:
      typeof reservationId === "number"
        ? collegeKeys.reservations.detail(reservationId)
        : [...collegeKeys.reservations.root(), "detail", "nil"],
    queryFn: () => CollegeReservationsService.getById(reservationId as number),
    enabled: typeof reservationId === "number" && reservationId > 0,
  });
}

export function useCreateCollegeReservation() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeReservationCreate) =>
      CollegeReservationsService.create(payload),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(collegeKeys.reservations.root());
    },
  }, "Reservation created successfully");
}

export function useUpdateCollegeReservation(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: CollegeReservationUpdate) =>
      CollegeReservationsService.update(reservationId, payload),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(collegeKeys.reservations.detail(reservationId));
      invalidateAndRefetch(collegeKeys.reservations.root());
    },
  }, "Reservation updated successfully");
}

export function useDeleteCollegeReservation() {
  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      CollegeReservationsService.delete(reservationId),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(collegeKeys.reservations.root());
    },
  }, "Reservation deleted successfully");
}

export function useUpdateCollegeReservationStatus(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: {
      status: ReservationStatusEnum;
      remarks?: string | null;
    }) => CollegeReservationsService.updateStatus(reservationId, payload),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(collegeKeys.reservations.detail(reservationId));
      invalidateAndRefetch(collegeKeys.reservations.root());
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
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(collegeKeys.reservations.detail(reservationId));
      invalidateAndRefetch(collegeKeys.reservations.root());
    },
  }, "Reservation concessions updated successfully");
}

export function useCollegeReservationDashboard() {
  return useQuery({
    queryKey: [...collegeKeys.reservations.root(), "dashboard"],
    queryFn: () => CollegeReservationsService.dashboard(),
  });
}

export function useCollegeReservationRecent(limit?: number) {
  return useQuery({
    queryKey: [...collegeKeys.reservations.root(), "recent", { limit }],
    queryFn: () => CollegeReservationsService.recent(limit),
  });
}
