import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import type {
  SchoolReservationListResponse,
  SchoolReservationRead,
  SchoolReservationStatusEnum,
  SchoolReservationCreate,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { invalidateAndRefetch } from "../common/useGlobalRefetch";

export function useSchoolReservationsList(params?: {
  page?: number;
  page_size?: number;
  class_id?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: schoolKeys.reservations.list(
      params as Record<string, unknown> | undefined
    ),
    queryFn: () =>
      SchoolReservationsService.list(
        params
      ),
    staleTime: 30 * 1000, // 30 seconds - reservations change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolReservation(reservationId: number | null | undefined) {
  return useQuery({
    queryKey:
      typeof reservationId === "number"
        ? schoolKeys.reservations.detail(reservationId)
        : [...schoolKeys.reservations.root(), "detail", "nil"],
    queryFn: () =>
      SchoolReservationsService.getById(
        reservationId as number
      ),
    enabled: typeof reservationId === "number" && reservationId > 0,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateSchoolReservation() {
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolReservationCreate) => SchoolReservationsService.create(payload),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(schoolKeys.reservations.root());
    },
  }, "Reservation created successfully");
}

export function useUpdateSchoolReservation(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (form: FormData) =>
      SchoolReservationsService.update(reservationId, form),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(schoolKeys.reservations.detail(reservationId));
      invalidateAndRefetch(schoolKeys.reservations.root());
    },
  }, "Reservation updated successfully");
}

export function useDeleteSchoolReservation() {
  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      SchoolReservationsService.delete(reservationId),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(schoolKeys.reservations.root());
    },
  }, "Reservation deleted successfully");
}

export function useUpdateSchoolReservationStatus(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: ({
      status,
      remarks,
    }: {
      status: SchoolReservationStatusEnum;
      remarks?: string;
    }) =>
      SchoolReservationsService.updateStatus(reservationId, status, remarks),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(schoolKeys.reservations.detail(reservationId));
      invalidateAndRefetch(schoolKeys.reservations.root());
    },
  }, "Reservation status updated successfully");
}

export function useSchoolReservationsDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.reservations.root(), "dashboard"],
    queryFn: () => SchoolReservationsService.getDashboard(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSchoolReservationsRecent(limit?: number) {
  return useQuery({
    queryKey: [...schoolKeys.reservations.root(), "recent", { limit }],
    queryFn: () => SchoolReservationsService.getRecent(limit),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateSchoolReservationConcession(reservationId: number) {
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) =>
      SchoolReservationsService.updateConcession(reservationId, payload),
    onSuccess: () => {
      // Use debounced invalidateAndRefetch to prevent UI freeze
      invalidateAndRefetch(schoolKeys.reservations.detail(reservationId));
      invalidateAndRefetch(schoolKeys.reservations.root());
    },
  }, "Reservation concession updated successfully");
}
