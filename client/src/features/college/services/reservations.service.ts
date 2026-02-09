import { Api } from "@/core/api";
import {
  CollegeReservationCreate,
  CollegeReservationRead,
  CollegeReservationUpdate,
  CollegePaginatedReservationRead,
  CollegeReservationDashboardStats,
  CollegeRecentReservation,
  CollegeReservationView,
  ReservationStatusEnum,
} from "@/features/college/types";
import { handleCollegePayByAdmissionWithIncomeId as handleAdmissionPayment } from "@/core/api/api-college";

export interface CollegeReservationsListParams {
  group_id?: number;
  course_id?: number;
  page?: number;
  page_size?: number;
  status?: string;
  /** Full-text search (student name, reservation number). Optional. */
  search?: string | null;
}

export const CollegeReservationsService = {
  // GET /api/v1/college/reservations
  list(params?: CollegeReservationsListParams) {
    return Api.get<CollegePaginatedReservationRead>(
      `/college/reservations`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  // GET /api/v1/college/reservations/{reservation_id}
  getById(reservation_id: number) {
    return Api.get<CollegeReservationRead>(
      `/college/reservations/${reservation_id}`
    );
  },

  // GET /api/v1/college/reservations/view/{reservation_id}
  getViewById(reservation_id: number) {
    return Api.get<CollegeReservationView>(
      `/college/reservations/view/${reservation_id}`
    );
  },

  // GET /api/v1/college/reservations/dashboard
  dashboard() {
    return Api.get<CollegeReservationDashboardStats>(
      `/college/reservations/dashboard`
    );
  },

  // GET /api/v1/college/reservations/recent
  recent(limit?: number) {
    return Api.get<CollegeRecentReservation[]>(
      `/college/reservations/recent${limit ? `?limit=${limit}` : ""}`
    );
  },

  // POST /api/v1/college/reservations
  create(payload: CollegeReservationCreate) {
    return Api.post<CollegeReservationRead>(`/college/reservations`, payload);
  },

  // PUT /api/v1/college/reservations/{reservation_id}
  update(reservation_id: number, payload: CollegeReservationUpdate) {
    return Api.put<CollegeReservationRead>(
      `/college/reservations/${reservation_id}`,
      payload
    );
  },

  // DELETE /api/v1/college/reservations/{reservation_id}
  delete(reservation_id: number) {
    return Api.delete<void>(`/college/reservations/${reservation_id}`);
  },

  // PUT /api/v1/college/reservations/{reservation_id}/status
  updateStatus(
    reservation_id: number,
    payload: { status: ReservationStatusEnum; remarks?: string | null }
  ) {
    return Api.put<CollegeReservationRead>(
      `/college/reservations/${reservation_id}/status`,
      payload
    );
  },

  // PUT /api/v1/college/reservations/{reservation_id}/concessions
  // Note: Backend only accepts tuition_concession and remarks (not transport_concession)
  updateConcessions(
    reservation_id: number,
    payload: {
      tuition_concession?: number | null;
      remarks?: string | null;
    }
  ) {
    return Api.put<CollegeReservationRead>(
      `/college/reservations/${reservation_id}/concessions`,
      payload
    );
  },

  // Process admission payment and return payment response with income_id
  async processPaymentAndPrintReceipt(
    admissionNo: string,
    paymentData: any
  ): Promise<{ income_id: number; blobUrl: string }> {
    return handleAdmissionPayment(admissionNo, paymentData);
  },
};
