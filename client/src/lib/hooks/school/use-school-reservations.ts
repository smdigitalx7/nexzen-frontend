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
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: SchoolReservationCreate) => SchoolReservationsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);
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
      }).catch(console.error);
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);
    },
  }, "Reservation updated successfully");
}

export function useDeleteSchoolReservation() {
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (reservationId: number) =>
      SchoolReservationsService.delete(reservationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() }).catch(console.error);
      qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);
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
      // Invalidate specific reservation detail
      qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      }).catch(console.error);
      
      // Invalidate all reservation queries (list, detail, dashboard, recent)
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() }).catch(console.error);
      
      // Refetch ALL reservation queries (list, detail, dashboard, recent)
      qc.refetchQueries({ 
        queryKey: schoolKeys.reservations.root(), 
        exact: false 
      }).catch(console.error);
      
      // Refetch all active reservation queries
      qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);
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
  const qc = useQueryClient();
  return useMutationWithSuccessToast({
    mutationFn: (payload: any) =>
      SchoolReservationsService.updateConcession(reservationId, payload),
    onSuccess: () => {
      // Invalidate specific reservation detail
      qc.invalidateQueries({
        queryKey: schoolKeys.reservations.detail(reservationId),
      }).catch(console.error);
      
      // Invalidate all reservation queries (list, detail, dashboard, recent)
      qc.invalidateQueries({ queryKey: schoolKeys.reservations.root() }).catch(console.error);
      
      // Refetch ALL reservation queries (list, detail, dashboard, recent)
      qc.refetchQueries({ 
        queryKey: schoolKeys.reservations.root(), 
        exact: false 
      }).catch(console.error);
      
      // Refetch all active reservation queries
      qc.refetchQueries({ queryKey: schoolKeys.reservations.root(), type: 'active' }).catch(console.error);
    },
  }, "Reservation concession updated successfully");
}
