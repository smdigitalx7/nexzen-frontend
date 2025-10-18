import { Api } from "@/lib/api";

/**
 * AnnouncementsService - Handles all announcement-related API operations
 * 
 * Required roles for most operations: ADMIN, INSTITUTE_ADMIN, ACADEMIC, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /announcements - List all announcements
 * - GET /announcements/{id} - Get announcement by ID
 * - POST /announcements - Create new announcement
 * - PUT /announcements/{id} - Update announcement
 * - DELETE /announcements/{id} - Delete announcement
 */

export interface Announcement {
  announcement_id: number;
  branch_id: number;
  branch_type: string;
  title: string;
  content: string;
  target_audience: string;
  class_id?: number;
  bus_route_id?: number;
  announcement_type: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export interface AnnouncementCreate {
  branch_id: number;
  branch_type: string;
  title: string;
  content: string;
  target_audience: string;
  class_id?: number;
  bus_route_id?: number;
  announcement_type: string;
  priority?: string;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string;
  target_audience?: string;
  class_id?: number;
  bus_route_id?: number;
  announcement_type?: string;
  priority?: string;
}

export interface AnnouncementQuery {
  branch_id?: number;
  branch_type?: string;
  class_id?: number;
  announcement_type?: string;
}

export const AnnouncementsService = {
  /**
   * Get all announcements with optional filtering
   * @param query - Optional query parameters
   * @returns Promise<Announcement[]> - List of announcements
   */
  list(query: AnnouncementQuery = {}): Promise<Announcement[]> {
    return Api.get<Announcement[]>("/announcements", query as Record<string, string | number | boolean | null | undefined>);
  },

  /**
   * Get a specific announcement by ID
   * @param id - Announcement ID
   * @returns Promise<Announcement> - Announcement details
   */
  getById(id: number): Promise<Announcement> {
    return Api.get<Announcement>(`/announcements/${id}`);
  },

  /**
   * Create a new announcement
   * @param data - Announcement creation data
   * @returns Promise<Announcement> - Created announcement
   */
  create(data: AnnouncementCreate): Promise<Announcement> {
    return Api.post<Announcement>("/announcements", data);
  },

  /**
   * Update an existing announcement
   * @param id - Announcement ID
   * @param data - Announcement update data
   * @returns Promise<Announcement> - Updated announcement
   */
  update(id: number, data: AnnouncementUpdate): Promise<Announcement> {
    return Api.put<Announcement>(`/announcements/${id}`, data);
  },

  /**
   * Delete an announcement
   * @param id - Announcement ID
   * @returns Promise<void>
   */
  delete(id: number): Promise<void> {
    return Api.delete<void>(`/announcements/${id}`);
  },
};