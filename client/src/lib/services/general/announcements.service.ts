import { Api } from "@/lib/api";
import type { Announcement, AnnouncementCreate, AnnouncementUpdate } from "@/lib/hooks/general/useAnnouncements";

export const AnnouncementsService = {
  // GET /api/v1/announcements/
  list(params: { 
    branch_id?: number; 
    branch_type?: string; 
    class_id?: number; 
    announcement_type?: string; 
  }): Promise<Announcement[]> {
    const qs = new URLSearchParams();
    if (params.branch_id) qs.append('branch_id', params.branch_id.toString());
    if (params.branch_type) qs.append('branch_type', params.branch_type);
    if (params.class_id) qs.append('class_id', params.class_id.toString());
    if (params.announcement_type) qs.append('announcement_type', params.announcement_type);
    
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return Api.get<Announcement[]>(`/announcements${suffix}`);
  },

  // GET /api/v1/announcements/{id}
  getById(id: number): Promise<Announcement> {
    return Api.get<Announcement>(`/announcements/${id}`);
  },

  // POST /api/v1/announcements/
  create(payload: AnnouncementCreate): Promise<Announcement> {
    return Api.post<Announcement>('/announcements/', payload);
  },

  // PUT /api/v1/announcements/{id}
  update(id: number, payload: AnnouncementUpdate): Promise<Announcement> {
    return Api.put<Announcement>(`/announcements/${id}`, payload);
  },

  // DELETE /api/v1/announcements/{id}
  delete(id: number): Promise<void> {
    return Api.delete(`/announcements/${id}`);
  },
};
