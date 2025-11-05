import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import type {
  SchoolReservationListResponse,
  SchoolReservationRead,
  SchoolReservationStatusEnum,
} from "@/lib/types/school";
import { schoolKeys } from "./query-keys";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";

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
  });
}

export function useCreateSchoolReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (form: FormData) => SchoolReservationsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  }, "Reservation created successfully");
}

export function useUpdateSchoolReservation(reservationId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (form: FormData) =>
      SchoolReservationsService.update(reservationId, form),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      });
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  }, "Reservation updated successfully");
}

export function useDeleteSchoolReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      SchoolReservationsService.delete(reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  }, "Reservation deleted successfully");
}

export function useUpdateSchoolReservationStatus(reservationId: number) {
  const qc = useQueryClient();
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
      qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      });
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  }, "Reservation status updated successfully");
}

export function useSchoolReservationsDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.reservations.root(), "dashboard"],
    queryFn: () => SchoolReservationsService.getDashboard(),
  });
}

export function useSchoolReservationsRecent(limit?: number) {
  return useQuery({
    queryKey: [...schoolKeys.reservations.root(), "recent", { limit }],
    queryFn: () => SchoolReservationsService.getRecent(limit),
  });
}

export function useUpdateSchoolReservationConcession(reservationId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) =>
      SchoolReservationsService.updateConcession(reservationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      });
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  }, "Reservation concession updated successfully");
}
