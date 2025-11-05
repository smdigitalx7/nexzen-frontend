import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "./api";

const API_BASE_URL: string = getApiBaseUrl() as string;

/**
 * College-specific payment and receipt handling functions
 */

// Type definitions for API responses
interface PaymentResponseContext {
  income_id: number;
}

interface PaymentResponseData {
  context?: PaymentResponseContext;
}

interface PaymentResponse {
  data?: PaymentResponseData;
  context?: PaymentResponseContext;
  [key: string]: unknown;
}

interface ErrorResponse {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

/**
 * Handles payment processing by admission and returns PDF receipt
 *
 * This function:
 * 1. Calls the college admission payment API with admission_no
 * 2. Receives JSON response with income_id
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data (PayFeeByAdmissionRequest format)
 * @returns Promise that resolves with blob URL for PDF receipt
 */
export async function handleCollegePayByAdmission(
  admissionNo: string,
  payload: {
    details: Array<{
      purpose:
        | "ADMISSION_FEE"
        | "BOOK_FEE"
        | "TUITION_FEE"
        | "TRANSPORT_FEE"
        | "OTHER";
      paid_amount: number; // > 0, <= 1000000, max 2 decimal places
      payment_method: "CASH" | "ONLINE";
      term_number?: number; // Required for TUITION_FEE (1, 2, or 3)
      payment_month?: string; // Required for TRANSPORT_FEE (YYYY-MM-01 format)
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<string> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/college/income/pay-fee/${admissionNo}`;

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
          const errorData = (await response.json()) as ErrorResponse;
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
    const paymentData = (await response.json()) as PaymentResponse;

    const income_id = paymentData.data?.context?.income_id ?? paymentData.context?.income_id;

    if (!income_id || typeof income_id !== 'number') {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleCollegeRegenerateReceipt(income_id);

    return blobUrl;
  } catch (error) {
    // Error handling is done by the caller
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
 * 1. Calls the college admission payment API with admission_no
 * 2. Receives JSON response with income_id and payment data
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 * 5. Returns income_id, blobUrl, and full payment data
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data (PayFeeByAdmissionRequest format)
 * @returns Promise that resolves with an object containing income_id, blobUrl (for PDF receipt), and paymentData (full response)
 */
export async function handleCollegePayByAdmissionWithIncomeId(
  admissionNo: string,
  payload: {
    details: Array<{
      purpose:
        | "ADMISSION_FEE"
        | "BOOK_FEE"
        | "TUITION_FEE"
        | "TRANSPORT_FEE"
        | "OTHER";
      paid_amount: number; // > 0, <= 1000000, max 2 decimal places
      payment_method: "CASH" | "ONLINE";
      term_number?: number; // Required for TUITION_FEE (1, 2, or 3)
      payment_month?: string; // Required for TRANSPORT_FEE (YYYY-MM-01 format)
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<{ income_id: number; blobUrl: string; paymentData: PaymentResponse }> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/college/income/pay-fee/${admissionNo}`;

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
          const errorData = (await response.json()) as ErrorResponse;
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
    const paymentData = (await response.json()) as PaymentResponse;

    const income_id = paymentData.data?.context?.income_id ?? paymentData.context?.income_id;

    if (!income_id || typeof income_id !== 'number') {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleCollegeRegenerateReceipt(income_id);

    const result = {
      income_id,
      blobUrl,
      paymentData, // Include full payment data for debugging/additional info
    };

    return result;
  } catch (error) {
    // Error handling is done by the caller

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
 * 1. Calls the college reservation payment API with reservation_no
 * 2. Receives JSON response with income_id and payment data
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 *
 * @param reservationNo - The reservation number for the payment
 * @param payload - The payment data (PayFeeByReservationRequest format)
 * @returns Promise that resolves with an object containing blobUrl (for PDF receipt), income_id (from backend), and paymentData (full response)
 */
export async function handleCollegePayByReservation(
  reservationNo: string,
  payload: {
    details: Array<{
      purpose: "APPLICATION_FEE" | "OTHER";
      paid_amount: number;
      payment_method: "CASH" | "ONLINE";
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<{ blobUrl: string; income_id: number; paymentData: PaymentResponse }> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/college/income/pay-fee-by-reservation/${reservationNo}`;

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
          const errorData = (await response.json()) as ErrorResponse;
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
    const paymentData = (await response.json()) as PaymentResponse;

    const income_id = paymentData.data?.context?.income_id ?? paymentData.context?.income_id;

    if (!income_id || typeof income_id !== 'number') {
      throw new Error("Payment successful but income_id not found in response context");
    }

    // Now call regenerate receipt endpoint to get PDF
    const blobUrl = await handleCollegeRegenerateReceipt(income_id);

    return { blobUrl, income_id, paymentData };
  } catch (error) {
    // Error handling is done by the caller
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while processing payment. Please check your connection and try again."
      );
    }
    throw error;
  }
}

/**
 * Handles college receipt regeneration and returns PDF blob URL
 *
 * This function:
 * 1. Calls the college regenerate receipt API
 * 2. Receives PDF as binary data
 * 3. Creates a Blob URL for the PDF
 * 4. Returns blobUrl for modal display
 *
 * @param incomeId - The income ID for receipt regeneration
 * @returns Promise that resolves with blob URL for PDF receipt
 */
export async function handleCollegeRegenerateReceipt(
  incomeId: number
): Promise<string> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error(
      "Authentication token is required for receipt regeneration"
    );
  }

  const url = `${API_BASE_URL}/college/income/${incomeId}/regenerate-receipt`;

  try {
    // Step 1: Call the API with blob response type to receive PDF binary data
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    // Step 2: Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Receipt regeneration failed with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText) as ErrorResponse;
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Step 3: Get the PDF as binary data (blob)
    const pdfBlob = await response.blob();

    // Verify we received a PDF
    if (!pdfBlob.type.includes("pdf") && pdfBlob.size === 0) {
      throw new Error("Invalid PDF received from server");
    }

    // Step 4: Create a Blob URL for the PDF
    const pdfBlobWithType = new Blob([pdfBlob], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(pdfBlobWithType);

    // Return the blobUrl for the caller to handle (e.g., in modal)
    return blobUrl;
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

