import { useAuthStore } from "@/core/auth/authStore";
import { Api } from "@/core/api";
import { getApiBaseUrl } from "./api";

// Ensure API_BASE_URL includes /api/v1 prefix
const baseUrl = getApiBaseUrl();
const API_BASE_URL = baseUrl && baseUrl.includes("/api/v1") 
  ? baseUrl 
  : baseUrl 
    ? `${baseUrl}/api/v1`
    : "/api/v1";

/**
 * School-specific payment and receipt handling functions
 */

/**
 * Handles payment processing by admission and returns PDF receipt
 *
 * This function:
 * 1. Calls the school admission payment API with admission_no
 * 2. Receives JSON response with income_id
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data (PayFeeByAdmissionRequest format)
 * @returns Promise that resolves with blob URL for PDF receipt
 */
export async function handlePayByAdmission(
  admissionNo: string,
  payload: {
    details: Array<{
      purpose:
        | "ADMISSION_FEE"
        | "BOOK_FEE"
        | "TUITION_FEE"
        | "TRANSPORT_FEE"
        | "OTHER";
      paid_amount: number;
      payment_method: "CASH" | "UPI" | "CARD";
      term_number?: number; // Required for TUITION_FEE and TRANSPORT_FEE
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<string> {
  const state = useAuthStore.getState();
  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `Payment failed with status ${response.status}`;

      if (contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response to get income_id
    const paymentData = await response.json();

    const income_id = paymentData.data?.context?.income_id || paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleSchoolRegenerateReceipt(income_id);

    return blobUrl;
  } catch (error) {
    console.error("❌ Payment processing failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while processing payment. Please check your connection and try again."
      );
    }
    throw error;
  }
}

/**
 * Handles payment processing by admission and returns both income_id and PDF receipt
 *
 * This function:
 * 1. Calls the school admission payment API with admission_no
 * 2. Receives JSON response with income_id and payment data
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 * 5. Returns income_id, blobUrl, and full payment data
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data (PayFeeByAdmissionRequest format)
 * @returns Promise that resolves with an object containing income_id, blobUrl (for PDF receipt), and paymentData (full response)
 */
export async function handleSchoolPayByAdmissionWithIncomeId(
  admissionNo: string,
  payload: {
    details: Array<{
      purpose:
        | "ADMISSION_FEE"
        | "BOOK_FEE"
        | "TUITION_FEE"
        | "TRANSPORT_FEE"
        | "OTHER";
      paid_amount: number;
      payment_method: "CASH" | "UPI" | "CARD";
      term_number?: number; // Required for TUITION_FEE and TRANSPORT_FEE
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<{ income_id: number; blobUrl: string; paymentData: any }> {
  const state = useAuthStore.getState();
  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `Payment failed with status ${response.status}`;

      if (contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response to get income_id
    const paymentData = await response.json();

    const income_id = paymentData.data?.context?.income_id || paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleSchoolRegenerateReceipt(income_id);

    const result = {
      income_id,
      blobUrl,
      paymentData, // Include full payment data for debugging/additional info
    };

    return result;
  } catch (error) {
    console.error("❌ Payment processing failed:", error);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error("Payment request timed out. Please try again.");
      } else if (error.message.includes("fetch")) {
        throw new Error(
          "Network error occurred while processing payment. Please check your connection and try again."
        );
      }
    }
    throw error;
  }
}

/**
 * Handles payment processing by reservation and returns PDF receipt with income_id
 *
 * This function:
 * 1. Calls the school reservation payment API with reservation_no
 * 2. Receives JSON response with income_id and payment data
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 *
 * @param reservation_id - The reservation ID (integer) for the payment path
 * @param payload - The payment data (PayFeeByReservationRequest format)
 * @returns Promise that resolves with an object containing blobUrl (for PDF receipt), income_id (from backend), and paymentData (full response)
 */
export async function handlePayByReservation(
  reservation_id: number,
  payload: {
    details: Array<{
      purpose: "APPLICATION_FEE" | "OTHER";
      term_number?: number | null;
      paid_amount: number;
      payment_method: "CASH" | "UPI" | "CARD";
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<{ blobUrl: string; income_id: number; paymentData: any }> {
  const state = useAuthStore.getState();
  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee-by-reservation/${reservation_id}`;

  try {
    // Backend validation: term_number must be None/omitted for APPLICATION_FEE.
    const normalizedPayload = {
      ...payload,
      details: payload.details.map((d) => ({
        ...(d.purpose === "APPLICATION_FEE"
          ? (() => {
              // drop term_number entirely
              const { term_number: _term_number, ...rest } = d;
              return rest;
            })()
          : d),
      })),
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(normalizedPayload),
      credentials: "include",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `Payment failed with status ${response.status}`;

      if (contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Backend can return either:
    // - JSON with context (income_id) (then we regenerate receipt)
    // - PDF directly (blob) (then we return it as-is)
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const paymentData = await response.json();
      const income_id =
        paymentData.data?.context?.income_id ?? paymentData.context?.income_id;

      if (!income_id) {
        throw new Error("Payment successful but income_id not found in response context");
      }

      const blobUrl = await handleSchoolRegenerateReceipt(income_id);
      return { blobUrl, income_id, paymentData };
    }

    // Non-JSON: assume PDF/binary receipt
    const pdfBlob = await response.blob();
    if (pdfBlob.size === 0) {
      throw new Error("Invalid PDF received from server");
    }
    const ensurePdfType =
      pdfBlob.type && pdfBlob.type.toLowerCase().includes("pdf")
        ? pdfBlob
        : new Blob([pdfBlob], { type: "application/pdf" });

    return { blobUrl: URL.createObjectURL(ensurePdfType), income_id: 0, paymentData: null };
  } catch (error) {
    console.error("❌ Payment processing failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while processing payment. Please check your connection and try again."
      );
    }
    throw error;
  }
}

/** Pay by Enrollment payload – BOOK_FEE, TUITION_FEE, TRANSPORT_FEE, OTHER. School: term_number required for TUITION/TRANSPORT. */
export interface SchoolPayByEnrollmentPayload {
  details: Array<{
    purpose: "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER";
    paid_amount: number;
    payment_method: "CASH" | "UPI" | "CARD";
    term_number?: number;
    custom_purpose_name?: string;
  }>;
  remarks?: string;
}

/**
 * Pay by Enrollment – recurring/term fees for an enrolled student.
 * Path: POST /school/income/pay-fee-by-enrollment/{enrollment_id}
 */
export async function handleSchoolPayByEnrollment(
  enrollmentId: number,
  payload: SchoolPayByEnrollmentPayload
): Promise<{ income_id: number; blobUrl: string; paymentData: unknown }> {
  const state = useAuthStore.getState();
  const token = state.accessToken || (state as any).token;
  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee-by-enrollment/${enrollmentId}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      let errorMessage = `Payment failed with status ${response.status}`;
      if (contentType.includes("application/json")) {
        try {
          const err = await response.json();
          errorMessage = typeof err.detail === "string" ? err.detail : Array.isArray(err.detail) ? (err.detail[0]?.msg ?? err.detail[0]?.message ?? JSON.stringify(err.detail)) : err.message ?? errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const paymentData = await response.json();
    const income_id = paymentData.data?.context?.income_id ?? paymentData.context?.income_id;
    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    const blobUrl = await handleSchoolRegenerateReceipt(income_id);
    return { income_id, blobUrl, paymentData };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") throw new Error("Payment request timed out. Please try again.");
      if (error.message.includes("fetch")) throw new Error("Network error. Please check your connection and try again.");
    }
    throw error;
  }
}

/**
 * Handles school receipt regeneration and returns PDF blob URL
 *
 * This function:
 * 1. Calls the school regenerate receipt API
 * 2. Receives PDF as binary data
 * 3. Creates a Blob URL for the PDF
 * 4. Returns blobUrl for modal display
 *
 * @param incomeId - The income ID for receipt regeneration
 * @returns Promise that resolves with blob URL for PDF receipt
 */
export async function handleSchoolRegenerateReceipt(
  incomeId: number
): Promise<string> {
  try {
    const pdfBlob = await Api.getBlob(
      `/school/income/${incomeId}/regenerate-receipt`
    );

    if (pdfBlob.size === 0) {
      throw new Error("Invalid PDF received from server");
    }

    const ensurePdfType =
      pdfBlob.type && pdfBlob.type.toLowerCase().includes("pdf")
        ? pdfBlob
        : new Blob([pdfBlob], { type: "application/pdf" });

    return URL.createObjectURL(ensurePdfType);
  } catch (error) {
    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while regenerating receipt. Please check your connection and try again."
      );
    }

    // Re-throw the original error
    throw error;
  }
}

/**
 * Handles payment processing and automatic receipt printing
 *
 * This function:
 * 1. Calls the payment API
 * 2. Receives PDF as binary data
 * 3. Returns blob URL for modal display
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data to send
 * @returns Promise that resolves with blob URL
 */
export async function handlePayAndPrint(
  admissionNo: string,
  payload: any
): Promise<string> {
  const state = useAuthStore.getState();
  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `Payment failed with status ${response.status}`;

      if (contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response to get income_id
    const paymentData = await response.json();

    const income_id = paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleSchoolRegenerateReceipt(income_id);

    // Return the blobUrl for the caller to handle (e.g., in modal)
    return blobUrl;
  } catch (error) {
    console.error("❌ Payment processing failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while processing payment. Please check your connection and try again."
      );
    }
    throw error;
  }
}

// Process admission payment and return payment response with income_id
export async function handleAdmissionPayment(
  admissionNo: string,
  payload: any
): Promise<{ income_id: number; blobUrl: string }> {
  const state = useAuthStore.getState();
  // Use accessToken directly (memory-only), fallback to token alias for backward compatibility
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `Payment failed with status ${response.status}`;

      if (contentType.includes("application/json")) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }
      } else {
        errorMessage = (await response.text()) || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response to get income_id
    const paymentData = await response.json();

    const income_id = paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleSchoolRegenerateReceipt(income_id);

    return {
      income_id,
      blobUrl,
    };
  } catch (error) {
    console.error("❌ Admission payment processing failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while processing payment. Please check your connection and try again."
      );
    }
    throw error;
  }
}

