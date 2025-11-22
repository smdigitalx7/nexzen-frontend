import { Api } from "@/core/api";
import type {
  MonthlyFeeConfigRead,
  MonthlyFeeConfigCreate,
  MonthlyFeeConfigUpdate,
} from "@/features/college/types/monthly-fee-config";

/**
 * MonthlyFeeConfigService - Handles monthly fee config API operations (College only)
 * 
 * Required roles: ADMIN, ACCOUNTANT, INSTITUTE_ADMIN
 * 
 * Available endpoints:
 * - GET /college/monthly-fee-config - Get monthly fee config for current branch
 * - POST /college/monthly-fee-config - Create monthly fee config
 * - PUT /college/monthly-fee-config - Update monthly fee config (upsert)
 */
export const MonthlyFeeConfigService = {
  /**
   * Get monthly fee config for the current branch
   * @returns Promise<MonthlyFeeConfigRead> - Monthly fee config
   */
  getMonthlyFeeConfig(): Promise<MonthlyFeeConfigRead> {
    return Api.get<MonthlyFeeConfigRead>("/college/monthly-fee-config");
  },

  /**
   * Create monthly fee config for the current branch
   * @param data - Monthly fee config creation data
   * @returns Promise<MonthlyFeeConfigRead> - Created monthly fee config
   */
  createMonthlyFeeConfig(data: MonthlyFeeConfigCreate): Promise<MonthlyFeeConfigRead> {
    return Api.post<MonthlyFeeConfigRead>("/college/monthly-fee-config", data);
  },

  /**
   * Update monthly fee config for the current branch (upsert - creates if doesn't exist)
   * @param data - Monthly fee config update data
   * @returns Promise<MonthlyFeeConfigRead> - Updated monthly fee config
   */
  updateMonthlyFeeConfig(data: MonthlyFeeConfigUpdate): Promise<MonthlyFeeConfigRead> {
    return Api.put<MonthlyFeeConfigRead>("/college/monthly-fee-config", data);
  },
};

