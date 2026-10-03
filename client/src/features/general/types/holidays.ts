export interface HolidayRead {
  holiday_id: number;
  institute_id: number;
  holiday_name: string;
  holiday_date: string; // ISO date 'YYYY-MM-DD'
  day_of_week?: string; // e.g. "Friday", "Monday"
  description?: string | null;
  holiday_groups?: string | null;
}

export interface HolidayCreate {
  holiday_name: string;
  holiday_date: string; // 'YYYY-MM-DD'
  description?: string;
  holiday_groups?: string;
}

export interface HolidayUpdate {
  holiday_name?: string;
  holiday_date?: string;
  description?: string;
  holiday_groups?: string;
}

export interface HolidayListResponse {
  data: HolidayRead[];
  total_count: number;
  year?: number | null;
  month?: number | null;
}

export interface SeedDefaultsResponse {
  success: boolean;
  message: string;
  seeded_count: number;
  year: number;
}
