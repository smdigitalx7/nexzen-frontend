import { Api } from "@/lib/api";
import type { PublicDropdownsResponse } from "@/lib/types/general/dropdowns";

/**
 * DropdownsService - Handles all public dropdowns API operations
 * 
 * No authentication required for public dropdowns
 * 
 * Available endpoints:
 * - GET /dropdowns/enums - Get public dropdown enums
 */
export const DropdownsService = {
  /**
   * Get all public enum values for dropdowns
   * @returns Promise<PublicDropdownsResponse> - All available enum values
   */
  getPublicDropdowns(): Promise<PublicDropdownsResponse> {
    return Api.get<PublicDropdownsResponse>("/dropdowns/enums", undefined, undefined);
  },
};
