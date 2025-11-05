import { useQuery } from "@tanstack/react-query";
import { AnnouncementsService } from "@/lib/services/general/announcements.service";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { useMutationWithSuccessToast } from "../common/use-mutation-with-toast";
import { useGlobalRefetch } from "../common/useGlobalRefetch";

// Types
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

// Query Keys
const ANNOUNCEMENT_KEYS = {
  all: ["announcements"] as const,
  lists: () => [...ANNOUNCEMENT_KEYS.all, "list"] as const,
  list: (query?: AnnouncementQuery) => [...ANNOUNCEMENT_KEYS.lists(), query] as const,
  details: () => [...ANNOUNCEMENT_KEYS.all, "detail"] as const,
  detail: (id: number) => [...ANNOUNCEMENT_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all announcements with optional filtering
 */
export const useAnnouncements = (query?: AnnouncementQuery) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.list(query),
    queryFn: async () => {
      return await AnnouncementsService.list(query || {});
    },
    staleTime: QUERY_STALE_TIME,
    retry: 2,
  });
};

/**
 * Hook to fetch a single announcement by ID
 */
export const useAnnouncement = (id: number) => {
  return useQuery({
    queryKey: ANNOUNCEMENT_KEYS.detail(id),
    queryFn: async () => {
      return await AnnouncementsService.getById(id);
    },
    enabled: !!id,
    staleTime: QUERY_STALE_TIME,
  });
};

/**
 * Hook to create a new announcement
 */
export const useCreateAnnouncement = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async (data: AnnouncementCreate) => {
      return await AnnouncementsService.create(data);
    },
    onSuccess: () => {
      invalidateEntity("announcements");
    },
  }, "Announcement created successfully");
};

/**
 * Hook to update an announcement
 */
export const useUpdateAnnouncement = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async ({ id, data }: { id: number; data: AnnouncementUpdate }) => {
      return await AnnouncementsService.update(id, data);
    },
    onSuccess: () => {
      invalidateEntity("announcements");
    },
  }, "Announcement updated successfully");
};

/**
 * Hook to delete an announcement
 */
export const useDeleteAnnouncement = () => {
  const { invalidateEntity } = useGlobalRefetch();

  return useMutationWithSuccessToast({
    mutationFn: async (id: number) => {
      return await AnnouncementsService.delete(id);
    },
    onSuccess: () => {
      invalidateEntity("announcements");
    },
  }, "Announcement deleted successfully");
};
