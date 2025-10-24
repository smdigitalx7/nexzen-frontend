import { useAuthStore } from "@/store/authStore";

// For the simple API, we need to use /api/v1 since the proxy forwards /api to the external server
// and the external server expects /v1 paths
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "/api/v1";

// Debug: Log API configuration on module load

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  noAuth?: boolean;
  // internal flag to avoid infinite refresh loops
  _isRetry?: boolean;
}

function buildQuery(query?: ApiRequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const s = params.toString();
  return s ? `?${s}` : "";
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;

function scheduleProactiveRefresh() {
  const { token, tokenExpireAt } = useAuthStore.getState();
  if (!token || !tokenExpireAt) return;
  const now = Date.now();
  // Refresh 60 seconds before expiry
  const refreshInMs = Math.max(0, tokenExpireAt - now - 60_000);
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  refreshTimer = setTimeout(async () => {
    try {
      await tryRefreshToken(useAuthStore.getState().token);
      // reschedule after refresh
      scheduleProactiveRefresh();
    } catch {
      // ignore; on-demand refresh still handles failures
    }
  }, refreshInMs);
}

function clearProactiveRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

async function tryRefreshToken(
  oldAccessToken: string | null
): Promise<string | null> {
  if (!oldAccessToken || isRefreshing) return null;

  isRefreshing = true;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oldAccessToken}`,
      },
      credentials: "include",
    });
    if (!res.ok) {
      // If refresh fails, clear auth state to prevent infinite loops
      console.warn("Token refresh failed, clearing auth state");
      useAuthStore.getState().logout();
      return null;
    }
    const data = await res.json();
    const newToken = (data?.access_token as string) || null;
    const expireIso = (data?.expiretime as string) || null;
    const expireAtMs = expireIso ? new Date(expireIso).getTime() : null;
    if (newToken) {
      useAuthStore.getState().setTokenAndExpiry(newToken, expireAtMs);
      scheduleProactiveRefresh();
    }
    return newToken;
  } catch (error) {
    console.warn("Token refresh error, clearing auth state:", error);
    useAuthStore.getState().logout();
    return null;
  } finally {
    isRefreshing = false;
  }
}

export async function api<T = unknown>({
  method = "GET",
  path,
  body,
  query,
  headers = {},
  noAuth = false,
  _isRetry = false,
}: ApiRequestOptions): Promise<T> {
  const state = useAuthStore.getState();
  const token = state.token;

  const url = `${API_BASE_URL}${path}${buildQuery(query)}`;

  if (token) {
    // Check token expiry
    if (state.tokenExpireAt) {
      const isExpired = Date.now() > state.tokenExpireAt;
    }
  }

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!noAuth && token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  } else if (!noAuth && !token) {
    console.warn(`⚠️ No token available for authenticated request to ${path}`);
  }

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : ((await res.text()) as unknown as T);

  // If this was a login call, store token and schedule proactive refresh
  if (path === "/auth/login" && res.ok && isJson) {
    const access = (data as any)?.access_token as string | undefined;
    const expireIso = (data as any)?.expiretime as string | undefined;
    if (access && expireIso) {
      useAuthStore
        .getState()
        .setTokenAndExpiry(access, new Date(expireIso).getTime());
      scheduleProactiveRefresh();
    }
  }

  // Attempt refresh on 401 or 403 once for authenticated calls
  // 403 can also indicate token expiration in some API implementations
  if (!noAuth && (res.status === 401 || res.status === 403) && !_isRetry) {
    const refreshed = await tryRefreshToken(token);
    if (refreshed) {
      return api<T>({
        method,
        path,
        body,
        query,
        headers,
        noAuth,
        _isRetry: true,
      });
    }
  }

  if (!res.ok) {
    const message =
      (isJson && ((data as any)?.detail || (data as any)?.message)) ||
      res.statusText ||
      "Request failed";
    const error = new Error(message as string);
    (error as any).status = res.status;
    throw error;
  }

  return data as T;
}

export const Api = {
  get: <T>(
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>
  ) => api<T>({ method: "GET", path, query, headers }),
  post: <T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
    opts?: Partial<ApiRequestOptions>
  ) => api<T>({ method: "POST", path, body, headers, noAuth: opts?.noAuth }),
  put: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    api<T>({ method: "PUT", path, body, headers }),
  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    api<T>({ method: "PATCH", path, body, headers }),
  delete: <T>(
    path: string,
    query?: ApiRequestOptions["query"],
    headers?: Record<string, string>
  ) => api<T>({ method: "DELETE", path, query, headers }),

  // FormData helper (avoids JSON content-type)
  postForm: async <T>(
    path: string,
    formData: FormData,
    headers?: Record<string, string>
  ) => {
    const state = useAuthStore.getState();
    const token = state.token;
    const url = `${API_BASE_URL}${path}`;
    const requestHeaders: Record<string, string> = {
      ...headers,
    };
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: "POST",
      headers: requestHeaders, // don't set Content-Type; browser will add multipart boundary
      body: formData,
      credentials: "include",
    });
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson
      ? await res.json()
      : ((await res.text()) as unknown as T);
    if (!res.ok) {
      const message =
        (isJson && ((data as any)?.detail || (data as any)?.message)) ||
        res.statusText ||
        "Request failed";
      throw new Error(message as string);
    }
    return data as T;
  },

  putForm: async <T>(
    path: string,
    formData: FormData,
    headers?: Record<string, string>
  ) => {
    const state = useAuthStore.getState();
    const token = state.token;
    const url = `${API_BASE_URL}${path}`;
    const requestHeaders: Record<string, string> = {
      ...headers,
    };
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(url, {
      method: "PUT",
      headers: requestHeaders,
      body: formData,
      credentials: "include",
    });
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson
      ? await res.json()
      : ((await res.text()) as unknown as T);
    if (!res.ok) {
      const message =
        (isJson && ((data as any)?.detail || (data as any)?.message)) ||
        res.statusText ||
        "Request failed";
      throw new Error(message as string);
    }
    return data as T;
  },
};

export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Handles payment processing and automatic receipt printing
 *
 * This function:
 * 1. Calls the payment API with blob response type
 * 2. Receives PDF as binary data
 * 3. Creates a Blob URL and opens PDF in new window
 * 4. Automatically triggers print dialog
 * 5. Cleans up the Blob URL after printing
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data to send
 * @returns Promise that resolves when payment is complete and print dialog is shown
 */
// Updated to return blobUrl for modal display
export async function handlePayAndPrint(
  admissionNo: string,
  payload: any
): Promise<string> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    console.log("💰 Processing payment for admission:", admissionNo);

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

    console.log(
      "✅ Payment successful! Content-Type:",
      response.headers.get("content-type")
    );

    // Parse JSON response to get income_id
    const paymentData = await response.json();
    console.log("📦 Payment response data:", paymentData);

    const income_id = paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    console.log("🆔 Income ID received:", income_id);

    // Now call regenerate receipt endpoint to get PDF
    console.log("📄 Generating receipt for income_id:", income_id);
    const blobUrl = await handleRegenerateReceipt(income_id);

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
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    console.log("💰 Processing admission payment for:", admissionNo);

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

    console.log(
      "✅ Admission payment successful! Content-Type:",
      response.headers.get("content-type")
    );

    // Parse JSON response to get income_id
    const paymentData = await response.json();
    console.log("📦 Payment response data:", paymentData);

    const income_id = paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    console.log("🆔 Income ID received:", income_id);

    // Now call regenerate receipt endpoint to get PDF
    console.log("📄 Generating receipt for income_id:", income_id);
    const blobUrl = await handleRegenerateReceipt(income_id);

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

/**
 * Handles receipt regeneration and automatic printing
 *
 * This function:
 * 1. Calls the regenerate receipt API with blob response type
 * 2. Receives PDF as binary data
 * 3. Creates a Blob URL and opens PDF in new window
 * 4. Automatically triggers print dialog
 * 5. Cleans up the Blob URL after printing
 *
 * @param incomeId - The income ID for receipt regeneration
 * @returns Promise that resolves when receipt is regenerated and print dialog is shown
 */
export async function handleRegenerateReceipt(
  incomeId: number
): Promise<string> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error(
      "Authentication token is required for receipt regeneration"
    );
  }

  const url = `${API_BASE_URL}/school/income/${incomeId}/regenerate-receipt`;

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
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Step 3: Get the PDF as binary data (blob)
    const pdfBlob = await response.blob();
    console.log("📄 Receipt PDF Blob received. Size:", pdfBlob.size, "bytes");

    // Verify we received a PDF
    if (!pdfBlob.type.includes("pdf") && pdfBlob.size === 0) {
      throw new Error("Invalid PDF received from server");
    }

    // Step 4: Create a Blob URL for the PDF
    const pdfBlobWithType = new Blob([pdfBlob], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(pdfBlobWithType);
    console.log("🔗 Receipt Blob URL created:", blobUrl);

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

/**
 * Handles payment processing by reservation and returns PDF receipt with income_id
 *
 * This function:
 * 1. Calls the reservation payment API with reservation_no
 * 2. Receives JSON response with income_id and payment data
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 *
 * @param reservationNo - The reservation number for the payment
 * @param payload - The payment data (PayFeeByReservationRequest format)
 * @returns Promise that resolves with an object containing blobUrl (for PDF receipt), income_id (from backend), and paymentData (full response)
 */
export async function handlePayByReservation(
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
): Promise<{ blobUrl: string; income_id: number; paymentData: any }> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee-by-reservation/${reservationNo}`;

  try {
    console.log("💰 Processing reservation payment for:", reservationNo);
    console.log("📦 Payment payload:", payload);

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

    console.log(
      "✅ Payment successful! Content-Type:",
      response.headers.get("content-type")
    );

    // Parse JSON response to get income_id
    const paymentData = await response.json();
    console.log("📦 Payment response data:", paymentData);

    const income_id = paymentData.data?.context?.income_id || paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    console.log("🆔 Income ID received:", income_id);

    // Now call regenerate receipt endpoint to get PDF
    console.log("📄 Generating receipt for income_id:", income_id);
    const blobUrl = await handleRegenerateReceipt(income_id);

    return { blobUrl, income_id, paymentData };
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
 * Handles payment processing by admission and returns PDF receipt
 *
 * This function:
 * 1. Calls the admission payment API with admission_no
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
      payment_method: "CASH" | "ONLINE";
      term_number?: number; // Required for TUITION_FEE and TRANSPORT_FEE
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

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    console.log("💰 Processing admission payment for:", admissionNo);
    console.log("📦 Payment payload:", payload);

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

    console.log(
      "✅ Payment successful! Content-Type:",
      response.headers.get("content-type")
    );

    // Parse JSON response to get income_id
    const paymentData = await response.json();
    console.log("📦 Payment response data:", paymentData);

    const income_id = paymentData.data?.context?.income_id || paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    console.log("🆔 Income ID received:", income_id);

    // Now call regenerate receipt endpoint to get PDF
    console.log("📄 Generating receipt for income_id:", income_id);
    const blobUrl = await handleRegenerateReceipt(income_id);

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
 * 1. Calls the admission payment API with admission_no
 * 2. Receives JSON response with income_id and payment data
 * 3. Calls regenerate receipt endpoint to get PDF
 * 4. Creates a Blob URL for modal display
 * 5. Returns income_id, blobUrl, and full payment data
 *
 * @param admissionNo - The admission number for the payment
 * @param payload - The payment data (PayFeeByAdmissionRequest format)
 * @returns Promise that resolves with an object containing income_id, blobUrl (for PDF receipt), and paymentData (full response)
 */
export async function handlePayByAdmissionWithIncomeId(
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
      payment_method: "CASH" | "ONLINE";
      term_number?: number; // Required for TUITION_FEE and TRANSPORT_FEE
      custom_purpose_name?: string; // Required for OTHER purpose
    }>;
    remarks?: string;
  }
): Promise<{ income_id: number; blobUrl: string; paymentData: any }> {
  const state = useAuthStore.getState();
  const token = state.token;

  if (!token) {
    throw new Error("Authentication token is required for payment processing");
  }

  const url = `${API_BASE_URL}/school/income/pay-fee/${admissionNo}`;

  try {
    console.log("💰 Processing admission payment for:", admissionNo);
    console.log("📦 Payment payload:", payload);

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

    console.log(
      "✅ Payment successful! Content-Type:",
      response.headers.get("content-type")
    );

    // Parse JSON response to get income_id
    const paymentData = await response.json();
    console.log("📦 Payment response data:", paymentData);

    const income_id = paymentData.data?.context?.income_id || paymentData.context?.income_id;

    if (!income_id) {
      throw new Error("Payment successful but income_id not found in response context");
    }

    console.log("🆔 Income ID received:", income_id);

    // Now call regenerate receipt endpoint to get PDF
    console.log("📄 Generating receipt for income_id:", income_id);
    const blobUrl = await handleRegenerateReceipt(income_id);

    return {
      income_id,
      blobUrl,
      paymentData, // Include full payment data for debugging/additional info
    };
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

// Expose helpers for lifecycle
export const AuthTokenTimers = {
  scheduleProactiveRefresh,
  clearProactiveRefresh,
};
