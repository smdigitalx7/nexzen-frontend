import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdvancesService } from '@/lib/services/general/advances.service';
import type { 
  AdvanceRead, 
  AdvanceCreate, 
  AdvanceUpdate,
  AdvanceListResponse,
  AdvanceDashboardStats,
  RecentAdvance
} from '@/lib/types/general/advances';

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

export const useAdvancesByBranch = (pageSize: number = 10, page: number = 1, month?: number, year?: number, status?: string) => {
  return useQuery({
    queryKey: advanceKeys.byBranch({ pageSize, page, month, year, status }),
    queryFn: () => AdvancesService.listByBranch(pageSize, page, month, year, status),
  });
};

export const useAdvance = (id: number) => {
  return useQuery({
    queryKey: advanceKeys.detail(id),
    queryFn: () => AdvancesService.getById(id),
    enabled: !!id,
  });
};

export const useAdvanceDashboard = () => {
  return useQuery({
    queryKey: advanceKeys.dashboard(),
    queryFn: () => AdvancesService.getDashboard(),
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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AdvanceCreate) => AdvancesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: advanceKeys.dashboard() });
    },
  });
};

export const useUpdateAdvance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdvanceUpdate }) => 
      AdvancesService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: advanceKeys.dashboard() });
    },
  });
};

export const useUpdateAdvanceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      AdvancesService.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: advanceKeys.dashboard() });
    },
  });
};

export const useUpdateAdvanceAmountPaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, amount_paid }: { id: number; amount_paid: number }) => 
      AdvancesService.updateAmountPaid(id, amount_paid),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: advanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: advanceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: advanceKeys.dashboard() });
    },
  });
};
