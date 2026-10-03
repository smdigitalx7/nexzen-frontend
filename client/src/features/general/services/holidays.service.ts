import { Api } from "@/core/api";
import type {
  HolidayRead,
  HolidayCreate,
  HolidayUpdate,
  HolidayListResponse,
  SeedDefaultsResponse,
} from "@/features/general/types/holidays";

export const HolidaysService = {
  /**
   * Get all holidays for the institute, optionally filtered by year and month
   */
  async getHolidays(year?: number, month?: number): Promise<HolidayListResponse> {
    const params = new URLSearchParams();
    if (year) params.append("year", year.toString());
    if (month) params.append("month", month.toString());
    const query = params.toString() ? `?${params.toString()}` : "";
    return Api.get<HolidayListResponse>(`/holidays${query}`);
  },

  /**
   * Get single holiday by ID
   */
  async getById(holidayId: number): Promise<HolidayRead> {
    return Api.get<HolidayRead>(`/holidays/${holidayId}`);
  },

  /**
   * Create a new holiday (unexpected or scheduled).
   * Automatically synchronizes employee daily biometric attendance.
   */
  async create(payload: HolidayCreate): Promise<HolidayRead> {
    return Api.post<HolidayRead>("/holidays", payload);
  },

  /**
   * Update an existing holiday.
   */
  async update(holidayId: number, payload: HolidayUpdate): Promise<HolidayRead> {
    return Api.put<HolidayRead>(`/holidays/${holidayId}`, payload);
  },

  /**
   * Delete a holiday.
   * Automatically restores employee attendance records back to original punch/absent state.
   */
  async delete(holidayId: number): Promise<{ success: boolean; message: string }> {
    return Api.delete<{ success: boolean; message: string }>(`/holidays/${holidayId}`);
  },

  /**
   * 1-Click seed of standard national & state public holidays for the year
   */
  async seedDefaults(year: number = 2026): Promise<SeedDefaultsResponse> {
    return Api.post<SeedDefaultsResponse>(`/holidays/seed-defaults?year=${year}`);
  },
};
