import { useAuthStore } from "@/store/authStore";
import { getApiBaseUrl } from "./api";

const API_BASE_URL = getApiBaseUrl();

/**
 * Create Other Income for School
 * @param payload - Other income data
 * @returns Promise that resolves with the created other income record
 */
export async function createSchoolOtherIncome(payload: {
  name: string;
  description?: string;
  amount: number;
  payment_method: "CASH" | "UPI" | "CARD";
  income_date: string; // YYYY-MM-DD format
}): Promise<any> {
  const state = useAuthStore.getState();
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required");
  }

  const url = `${API_BASE_URL}/school/other-income`;

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
      let errorMessage = `Failed to create other income with status ${response.status}`;

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

    return await response.json();
  } catch (error) {
    console.error("❌ Create other income failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while creating other income. Please check your connection and try again."
      );
    }
    throw error;
  }
}

/**
 * Get All Other Income for School
 * @param params - Query parameters (start_date, end_date, skip, limit)
 * @returns Promise that resolves with other income records
 */
export async function getSchoolOtherIncome(params?: {
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}): Promise<{ items: any[]; total: number }> {
  const state = useAuthStore.getState();
  const token = state.accessToken || (state as any).token;

  if (!token) {
    throw new Error("Authentication token is required");
  }

  const queryParams = new URLSearchParams();
  if (params?.start_date) queryParams.append("start_date", params.start_date);
  if (params?.end_date) queryParams.append("end_date", params.end_date);
  if (params?.skip !== undefined) queryParams.append("skip", params.skip.toString());
  if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());

  const url = `${API_BASE_URL}/school/other-income${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const contentType = response.headers.get("content-type") || "";
      let errorMessage = `Failed to fetch other income with status ${response.status}`;

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

    return await response.json();
  } catch (error) {
    console.error("❌ Get other income failed:", error);
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "Network error occurred while fetching other income. Please check your connection and try again."
      );
    }
    throw error;
  }
}

