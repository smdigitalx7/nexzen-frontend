import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AnnouncementsService } from "@/lib/services/announcements.service";
import { QUERY_STALE_TIME } from "@/lib/constants/query";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AnnouncementCreate) => {
      return await AnnouncementsService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.lists() });
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to update an announcement
 */
export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AnnouncementUpdate }) => {
      return await AnnouncementsService.update(id, data);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.detail(id) });
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete an announcement
 */
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      return await AnnouncementsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ANNOUNCEMENT_KEYS.lists() });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });
};
