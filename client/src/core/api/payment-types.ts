/**
 * Payment API types – aligned with Payment API Frontend Integration Guide.
 * Used by Pay by Student, Pay by Reservation, and Pay by Enrollment.
 */

export type PaymentPurpose =
  | "APPLICATION_FEE"
  | "ADMISSION_FEE"
  | "BOOK_FEE"
  | "TUITION_FEE"
  | "TRANSPORT_FEE"
  | "OTHER";

export type PaymentMethodApi = "CASH" | "UPI" | "CARD";

export interface PaymentDetailItem {
  purpose: PaymentPurpose;
  paid_amount: number;
  payment_method: PaymentMethodApi;
  custom_purpose_name?: string | null;
  term_number?: number | null;
  payment_month?: string | null; // College TRANSPORT_FEE: YYYY-MM-01
}

export interface PaymentRequestPayload {
  details: PaymentDetailItem[];
  remarks?: string | null;
}

export interface PaymentSuccessContext {
  income_id: number;
  total_amount: number;
  details_count: number;
  receipt_no: string;
  student_name: string;
  father_or_guardian_mobile?: string;
}

export interface PaymentSuccessResponse {
  success: true;
  message: string;
  context: PaymentSuccessContext;
}

export function isPaymentSuccessResponse(
  data: unknown
): data is PaymentSuccessResponse {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return d.success === true && typeof d.context?.income_id === "number";
}

export function getIncomeIdFromResponse(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const ctx = (d.context ?? d.data?.context) as { income_id?: number } | undefined;
  const id = ctx?.income_id;
  return typeof id === "number" ? id : null;
}

export function getReceiptNoFromResponse(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const ctx = (d.context ?? d.data?.context) as { receipt_no?: string } | undefined;
  const no = ctx?.receipt_no;
  return typeof no === "string" ? no : null;
}
