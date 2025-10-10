import { useQuery } from "@tanstack/react-query";
import { CollegeReservationsService } from "@/lib/services/college/reservations.service";
import type { CollegePaginatedReservationRead, CollegeReservationRead } from "@/lib/types/college/index.ts";
import { collegeKeys } from "./query-keys";

export function useCollegeReservationsList(params?: { group_id?: number; course_id?: number; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: collegeKeys.reservations.list(params as Record<string, unknown> | undefined),
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


