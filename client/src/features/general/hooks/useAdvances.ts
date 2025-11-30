import { useQuery, useMutation } from '@tanstack/react-query';
import { AdvancesService } from '@/features/general/services/advances.service';
import type { 
  AdvanceRead, 
  AdvanceCreate, 
  AdvanceUpdate,
  AdvanceStatusUpdate,
  AdvanceAmountPaidUpdate,
  AdvanceListResponse,
  AdvanceDashboardStats,
  RecentAdvance
} from '@/features/general/types/advances';
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";

// Query keys
export const advanceKeys = {
  all: ['advances'] as const,
  lists: () => [...advanceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...advanceKeys.lists(), { filters }] as const,
  details: () => [...advanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...advanceKeys.details(), id] as const,
  dashboard: () => [...advanceKeys.all, 'dashboard'] as const,
  recent: (limit?: number) => [...advanceKeys.all, 'recent', { limit }] as const,
  byBranch: (filters: Record<string, any>) => [...advanceKeys.all, 'by-branch', { filters }] as const,
};

// Hooks for fetching data
export const useAdvancesAll = (pageSize: number = 10, page: number = 1, month?: number, year?: number, status?: string) => {
  return useQuery({
    queryKey: advanceKeys.list({ pageSize, page, month, year, status }),
    queryFn: () => AdvancesService.listAll(pageSize, page, month, year, status),
  });
};

export const useAdvancesByBranch = (pageSize: number = 10, page: number = 1, month?: number, year?: number, status?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: advanceKeys.byBranch({ pageSize, page, month, year, status }),
    queryFn: () => AdvancesService.listByBranch(pageSize, page, month, year, status),
    enabled, // Allow conditional query execution to prevent unnecessary fetches
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdvance = (id: number) => {
  return useQuery({
    queryKey: advanceKeys.detail(id),
    queryFn: () => AdvancesService.getById(id),
    enabled: !!id,
  });
};

export const useAdvanceDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: advanceKeys.dashboard(),
    queryFn: () => AdvancesService.getDashboard(),
    enabled, // ✅ FIX: Only fetch when enabled (tab is active)
  });
};

export const useRecentAdvances = (limit: number = 5) => {
  return useQuery({
    queryKey: advanceKeys.recent(limit),
    queryFn: () => AdvancesService.getRecent(limit),
  });
};

// Mutation hooks
export const useCreateAdvance = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: AdvanceCreate) => AdvancesService.create(data),
    onSuccess: () => {
      invalidateEntity("advances");
    },
  }, "Advance created successfully");
};

export const useUpdateAdvance = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: AdvanceUpdate }) => 
      AdvancesService.update(id, payload),
    onSuccess: () => {
      invalidateEntity("advances");
    },
  }, "Advance updated successfully");
};

export const useUpdateAdvanceStatus = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: AdvanceStatusUpdate }) => 
      AdvancesService.updateStatus(id, payload),
    onSuccess: () => {
      invalidateEntity("advances");
    },
  }, "Advance status updated successfully");
};

export const useUpdateAdvanceAmountPaid = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: AdvanceAmountPaidUpdate }) => 
      AdvancesService.updateAmountPaid(id, payload),
    onSuccess: () => {
      invalidateEntity("advances");
    },
  }, "Advance payment updated successfully");
};
