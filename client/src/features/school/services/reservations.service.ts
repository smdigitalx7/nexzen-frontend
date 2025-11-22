import { Api } from "@/core/api";
import { handleRegenerateReceipt } from "@/core/api";
import { handleAdmissionPayment } from "@/core/api/api-school";
import type {
  SchoolReservationListResponse,
  SchoolReservationRead,
  SchoolReservationStatusEnum,
  SchoolReservationDashboardStats,
  SchoolRecentReservation,
  SchoolReservationConcessionUpdate,
  SchoolReservationUpdate,
} from "@/features/school/types";

export const SchoolReservationsService = {
  list(params?: {
    page?: number;
    page_size?: number;
    class_id?: number;
    status?: string;
  }) {
    return Api.get<SchoolReservationListResponse>(
      `/school/reservations`,
      params as
        | Record<string, string | number | boolean | null | undefined>
        | undefined
    );
  },

  getById(reservation_id: number) {
    return Api.get<SchoolReservationRead>(
      `/school/reservations/${reservation_id}`
    );
  },

  create(data: any) {
    return Api.post<SchoolReservationRead>(`/school/reservations`, data);
  },

  update(reservation_id: number, data: SchoolReservationUpdate) {
    return Api.put<SchoolReservationRead>(
      `/school/reservations/${reservation_id}`,
      data
    );
  },

  delete(reservation_id: number) {
    return Api.delete<void>(`/school/reservations/${reservation_id}`);
  },

  updateStatus(
    reservation_id: number,
    status: SchoolReservationStatusEnum,
    remarks?: string
  ) {
    return Api.put<SchoolReservationRead>(
      `/school/reservations/${reservation_id}/status`,
      {
        status,
        remarks: remarks || null,
      }
    );
  },

  getDashboard() {
    return Api.get<SchoolReservationDashboardStats>(
      `/school/reservations/dashboard`
    );
  },

  getRecent(limit?: number) {
    return Api.get<SchoolRecentReservation[]>(
      `/school/reservations/recent${limit ? `?limit=${limit}` : ""}`
    );
  },

  updateConcession(
    reservation_id: number,
    payload: SchoolReservationConcessionUpdate
  ) {
    return Api.put<SchoolReservationRead>(
      `/school/reservations/${reservation_id}/concessions`,
      payload
    );
  },

  /**
   * Process admission payment and return payment response with income_id
   *
   * @param admissionNo - The admission number for the payment
   * @param paymentData - The payment information (amount, method, etc.)
   * @returns Promise that resolves with payment response including income_id and blobUrl
   */
  async processPaymentAndPrintReceipt(
    admissionNo: string,
    paymentData: any
  ): Promise<{ income_id: number; blobUrl: string }> {
    return handleAdmissionPayment(admissionNo, paymentData);
  },

  /**
   * Regenerate receipt for existing income record and return blob URL
   *
   * @param incomeId - The income ID for receipt regeneration
   * @returns Promise that resolves with blob URL for receipt display
   */
  async regenerateReceipt(incomeId: number): Promise<string> {
    return handleRegenerateReceipt(incomeId);
  },
};
