import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import type { CollegePaginatedReservationRead, CollegeReservationCreate, CollegeReservationRead, CollegeReservationUpdate } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeReservationsList(params?: { group_id?: number; course_id?: number; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.reservations.list(params),
    queryFn: () => CollegeReservationsService.list(params) as Promise<CollegePaginatedReservationRead>,
  });
}

export function useCollegeReservation(reservationId: number | null | undefined) {
  return useQuery({
    queryKey: typeof reservationId === "number" ? collegeKeys.reservations.detail(reservationId) : [...collegeKeys.reservations.root(), "detail", "nil"],
    queryFn: () => CollegeReservationsService.getById(reservationId as number) as Promise<CollegeReservationRead>,
    enabled: typeof reservationId === "number" && reservationId > 0,
  });
}

export function useCreateCollegeReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeReservationCreate) => CollegeReservationsService.create(payload) as Promise<CollegeReservationRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.reservations.root() });
    },
  });
}

export function useUpdateCollegeReservation(reservationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CollegeReservationUpdate) => CollegeReservationsService.update(reservationId, payload) as Promise<CollegeReservationRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.reservations.detail(reservationId) });
      qc.invalidateQueries({ queryKey: collegeKeys.reservations.root() });
    },
  });
}

export function useUpdateCollegeReservationStatus(reservationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Pick<CollegeReservationUpdate, "status">) => CollegeReservationsService.updateStatus(reservationId, payload) as Promise<CollegeReservationRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.reservations.detail(reservationId) });
    },
  });
}

export function useUpdateCollegeReservationConcessions(reservationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { tuition_concession?: number | null; transport_concession?: number | null }) =>
      CollegeReservationsService.updateConcessions(reservationId, payload) as Promise<CollegeReservationRead>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collegeKeys.reservations.detail(reservationId) });
    },
  });
}


