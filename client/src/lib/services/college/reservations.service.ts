import { Api } from "@/lib/api";

export interface CollegeReservationsListParams {
  group_id?: number;
  course_id?: number;
  page?: number;
  pageSize?: number;
}

export const CollegeReservationsService = {
  // GET /api/v1/college/reservations
  list(params?: CollegeReservationsListParams) {
    return Api.get<unknown>(`/college/reservations`, params as Record<string, string | number | boolean | null | undefined> | undefined);
  },

  // GET /api/v1/college/reservations/{reservation_id}
  getById(reservation_id: number) {
    return Api.get<unknown>(`/college/reservations/${reservation_id}`);
  },
};


