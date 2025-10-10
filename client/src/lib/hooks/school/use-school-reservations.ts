import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import type { SchoolReservationListResponse, SchoolReservationRead, SchoolReservationStatusEnum } from "@/lib/types/school";
import { schoolKeys } from "./query-keys";

export function useSchoolReservationsList(params?: { page?: number; page_size?: number; class_id?: number }) {
  return useQuery({
    queryKey: schoolKeys.reservations.list(params as Record<string, unknown> | undefined),
    queryFn: () => SchoolReservationsService.list(params) as Promise<SchoolReservationListResponse>,
  });
}

export function useSchoolReservation(reservationId: number | null | undefined) {
  return useQuery({
    queryKey: typeof reservationId === "number" ? schoolKeys.reservations.detail(reservationId) : [...schoolKeys.reservations.root(), "detail", "nil"],
    queryFn: () => SchoolReservationsService.getById(reservationId as number) as Promise<SchoolReservationRead>,
    enabled: typeof reservationId === "number" && reservationId > 0,
  });
}

export function useCreateSchoolReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => SchoolReservationsService.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  });
}

export function useUpdateSchoolReservation(reservationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => SchoolReservationsService.update(reservationId, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.detail(reservationId) });
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  });
}

export function useDeleteSchoolReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: number) => SchoolReservationsService.delete(reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  });
}

export function useUpdateSchoolReservationStatus(reservationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: SchoolReservationStatusEnum) => SchoolReservationsService.updateStatus(reservationId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.detail(reservationId) });
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  });
}

export function useSchoolReservationsDashboard() {
  return useQuery({
    queryKey: [...schoolKeys.reservations.root(), "dashboard"],
    queryFn: () => SchoolReservationsService.getDashboard(),
  });
}

export function useSchoolReservationsRecent() {
  return useQuery({
    queryKey: [...schoolKeys.reservations.root(), "recent"],
    queryFn: () => SchoolReservationsService.getRecent() as Promise<SchoolReservationRead[]>,
  });
}

export function useUpdateSchoolReservationConcession(reservationId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => SchoolReservationsService.updateConcession(reservationId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.detail(reservationId) });
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() });
    },
  });
}


