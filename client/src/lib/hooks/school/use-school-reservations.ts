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
    mutationFn: (payload: SchoolReservationCreate) => SchoolReservationsService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' });
    },
  }, "Reservation created successfully");
}

export function useUpdateSchoolReservation(reservationId: number) {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (form: FormData) =>
      SchoolReservationsService.update(reservationId, form),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      });
      void qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' });
    },
  }, "Reservation updated successfully");
}

export function useDeleteSchoolReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      SchoolReservationsService.delete(reservationId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' });
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
      void qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      });
      void qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' });
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
      void qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      });
      void qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
      void qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' });
    },
  }, "Reservation concession updated successfully");
}
