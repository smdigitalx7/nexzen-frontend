import { Api } from "@/lib/api";
import type { SchoolReservationListResponse, SchoolReservationRead, SchoolReservationStatusEnum } from "@/lib/types/school";

export const SchoolReservationsService = {
  list(params?: { page?: number; page_size?: number; class_id?: number }) {
    return Api.get<SchoolReservationListResponse>(`/school/reservations`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  getById(reservation_id: number) {
    return Api.get<SchoolReservationRead>(`/school/reservations/${reservation_id}`);
  },

  create(form: FormData) {
    return Api.postForm<SchoolReservationRead>(`/school/reservations`, form);
  },

  update(reservation_id: number, form: FormData) {
    return Api.putForm<SchoolReservationRead>(`/school/reservations/${reservation_id}`, form);
  },

  delete(reservation_id: number) {
    return Api.delete<void>(`/school/reservations/${reservation_id}`);
  },

  updateStatus(reservation_id: number, status: SchoolReservationStatusEnum) {
    const fd = new FormData();
    fd.append("status", status);
    return Api.putForm<SchoolReservationRead>(`/school/reservations/${reservation_id}/status`, fd);
  },

  getDashboard() {
    return Api.get<any>(`/school/reservations/dashboard`);
  },

  getRecent() {
    return Api.get<SchoolReservationRead[]>(`/school/reservations/recent`);
  },

  updateConcession(reservation_id: number, payload: any) {
    return Api.put<SchoolReservationRead>(`/school/reservations/${reservation_id}/consession`, payload);
  },
};


