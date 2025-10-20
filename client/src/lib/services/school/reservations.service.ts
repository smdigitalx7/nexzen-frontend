import { Api } from "@/lib/api";
import type { 
  SchoolReservationListResponse, 
  SchoolReservationRead, 
  SchoolReservationStatusEnum,
  SchoolReservationDashboardStats,
  SchoolRecentReservation,
  SchoolReservationConcessionUpdate
} from "@/lib/types/school";

export const SchoolReservationsService = {
  list(params?: { page?: number; page_size?: number; class_id?: number }) {
    return Api.get<SchoolReservationListResponse>(`/school/reservations`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(reservation_id: number) {
    return Api.get<SchoolReservationRead>(`/school/reservations/${reservation_id}`);
  },

  create(data: any) {
    return Api.post<SchoolReservationRead>(`/school/reservations`, data);
  },

  update(reservation_id: number, data: any) {
    return Api.put<SchoolReservationRead>(`/school/reservations/${reservation_id}`, data);
  },

  delete(reservation_id: number) {
    return Api.delete<void>(`/school/reservations/${reservation_id}`);
  },

  updateStatus(reservation_id: number, status: SchoolReservationStatusEnum, remarks?: string) {
    const fd = new FormData();
    fd.append("status", status);
    if (remarks) {
      fd.append("remarks", remarks);
    }
    return Api.putForm<SchoolReservationRead>(`/school/reservations/${reservation_id}/status`, fd);
  },

  getDashboard() {
    return Api.get<SchoolReservationDashboardStats>(`/school/reservations/dashboard`);
  },

  getRecent(limit?: number) {
    return Api.get<SchoolRecentReservation[]>(`/school/reservations/recent${limit ? `?limit=${limit}` : ''}`);
  },

  updateConcession(reservation_id: number, payload: SchoolReservationConcessionUpdate) {
    return Api.put<SchoolReservationRead>(`/school/reservations/${reservation_id}/consession`, payload);
  },
};


