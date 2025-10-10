import { Api } from "@/lib/api";
import { CollegeReservationCreate, CollegeReservationRead, CollegeReservationUpdate, CollegePaginatedReservationRead } from "@/lib/types/college";

export interface CollegeReservationsListParams {
  group_id?: number;
  course_id?: number;
  page?: number;
  pageSize?: number;
}

export const CollegeReservationsService = {
  // GET /api/v1/college/reservations
  list(params?: CollegeReservationsListParams) {
    return Api.get<CollegePaginatedReservationRead>(`/college/reservations`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/reservations/{reservation_id}
  getById(reservation_id: number) {
    return Api.get<CollegeReservationRead>(`/college/reservations/${reservation_id}`);
  },

  // GET /api/v1/college/reservations/dashboard
  dashboard() {
    return Api.get<unknown>(`/college/reservations/dashboard`);
  },

  // GET /api/v1/college/reservations/recent
  recent() {
    return Api.get<unknown>(`/college/reservations/recent`);
  },

  // POST /api/v1/college/reservations
  create(payload: CollegeReservationCreate) {
    return Api.post<CollegeReservationRead>(`/college/reservations`, payload);
  },

  // PUT /api/v1/college/reservations/{reservation_id}
  update(reservation_id: number, payload: CollegeReservationUpdate) {
    return Api.put<CollegeReservationRead>(`/college/reservations/${reservation_id}`, payload);
  },

  // DELETE /api/v1/college/reservations/{reservation_id}
  delete(reservation_id: number) {
    return Api.delete<void>(`/college/reservations/${reservation_id}`);
  },

  // PUT /api/v1/college/reservations/{reservation_id}/status
  updateStatus(reservation_id: number, payload: Pick<CollegeReservationUpdate, "status">) {
    return Api.put<CollegeReservationRead>(`/college/reservations/${reservation_id}/status`, payload);
  },

  // PUT /api/v1/college/reservations/{reservation_id}/concessions
  updateConcessions(reservation_id: number, payload: { tuition_concession?: number | null; transport_concession?: number | null }) {
    return Api.put<CollegeReservationRead>(`/college/reservations/${reservation_id}/concessions`, payload);
  },
};


