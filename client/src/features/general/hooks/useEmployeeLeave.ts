import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { EmployeeLeaveService } from '@/features/general/services/employee-leave.service';
import type { 
  EmployeeLeaveRead, 
  EmployeeLeaveCreate, 
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
  EmployeeLeaveListResponse,
  LeaveDashboardStats,
  RecentLeave
} from '@/features/general/types/employee-leave';
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";
import { useToast } from '@/common/hooks/use-toast';

// Query keys
export const employeeLeaveKeys = {
  all: ['employee-leaves'] as const,
  lists: () => [...employeeLeaveKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeLeaveKeys.lists(), { filters }] as const,
  details: () => [...employeeLeaveKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeLeaveKeys.details(), id] as const,
  dashboard: () => [...employeeLeaveKeys.all, 'dashboard'] as const,
  recent: (limit?: number) => [...employeeLeaveKeys.all, 'recent', { limit }] as const,
  byBranch: (filters: Record<string, any>) => [...employeeLeaveKeys.all, 'by-branch', { filters }] as const,
};

// Hooks for fetching data
export const useEmployeeLeaves = (pageSize: number = 10, page: number = 1, leaveStatus?: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: employeeLeaveKeys.list({ pageSize, page, leaveStatus, month, year }),
    queryFn: () => EmployeeLeaveService.listAll(pageSize, page, leaveStatus, month, year),
  });
};

export const useEmployeeLeavesByBranch = (month?: number, year?: number, pageSize: number = 10, page: number = 1, leaveStatus?: string, enabled: boolean = true) => {
  // Default to current month/year if not provided (mandatory parameters)
  const now = new Date();
  const currentMonth = month ?? now.getMonth() + 1;
  const currentYear = year ?? now.getFullYear();
  
  return useQuery({
    queryKey: employeeLeaveKeys.byBranch({ pageSize, page, leaveStatus, month: currentMonth, year: currentYear }),
    queryFn: () => EmployeeLeaveService.listByBranch(currentMonth, currentYear, pageSize, page, leaveStatus),
    enabled, // Allow conditional query execution to prevent unnecessary fetches
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEmployeeLeaveById = (id: number) => {
  return useQuery({
    queryKey: employeeLeaveKeys.detail(id),
    queryFn: () => EmployeeLeaveService.getById(id),
    enabled: !!id,
  });
};

export const useLeaveDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeLeaveKeys.dashboard(),
    queryFn: () => EmployeeLeaveService.getDashboard(),
    enabled, // ✅ FIX: Only fetch when enabled (tab is active)
  });
};

export const useRecentLeaves = (limit: number = 5) => {
  return useQuery({
    queryKey: employeeLeaveKeys.recent(limit),
    queryFn: () => EmployeeLeaveService.getRecent(limit),
  });
};

// Mutation hooks
export const useCreateEmployeeLeave = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: EmployeeLeaveCreate) => EmployeeLeaveService.create(data),
    onSuccess: () => {
      invalidateEntity("leaves");
    },
  }, "Leave request created successfully");
};

export const useUpdateEmployeeLeave = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, data }: { id: number; data: EmployeeLeaveUpdate }) => 
      EmployeeLeaveService.update(id, data),
    onSuccess: () => {
      invalidateEntity("leaves");
    },
  }, "Leave request updated successfully");
};

export const useApproveEmployeeLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => EmployeeLeaveService.approve(id),
    onSuccess: () => {
      // ✅ COMPLETE REDESIGN: Prevent UI freezing by using refetchType: 'none' and manual refetch
      // Problem: invalidateQueries with refetchType: 'active' triggers IMMEDIATE synchronous refetches
      // Solution: Mark queries as stale WITHOUT refetching, then manually refetch with proper delays
      
      // Step 1: Mark queries as stale WITHOUT refetching (non-blocking)
      // This allows React Query to know data is stale but doesn't trigger network requests
      queryClient.invalidateQueries({
        queryKey: [...employeeLeaveKeys.all, 'by-branch'],
        exact: false,
        refetchType: 'none', // ✅ CRITICAL: Don't refetch automatically
      });
      
      // Step 2: Manually refetch table query with proper delay (non-blocking)
      // Use requestIdleCallback if available, otherwise use requestAnimationFrame + setTimeout
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            queryClient.refetchQueries({
              queryKey: [...employeeLeaveKeys.all, 'by-branch'],
              exact: false,
              type: 'active',
            });
          },
          { timeout: 1000 } // Ensure it runs even if browser is busy
        );
      } else {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.refetchQueries({
              queryKey: [...employeeLeaveKeys.all, 'by-branch'],
              exact: false,
              type: 'active',
            });
          }, 500); // Longer delay for fallback
        });
      }
      
      // Step 3: Defer dashboard stats invalidation (much longer delay - less critical)
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            queryClient.invalidateQueries({
              queryKey: employeeLeaveKeys.dashboard(),
              exact: true,
              refetchType: 'active',
            });
          },
          { timeout: 2000 } // Even longer delay for dashboard
        );
      } else {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: employeeLeaveKeys.dashboard(),
              exact: true,
              refetchType: 'active',
            });
          }, 1500);
        });
      }
    },
  }, "Leave request approved successfully");
};

export const useRejectEmployeeLeave = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, data }: { id: number; data: EmployeeLeaveReject }) => 
      EmployeeLeaveService.reject(id, data),
    onSuccess: () => {
      // ✅ COMPLETE REDESIGN: Same fix as approve - prevent UI freezing
      
      // Step 1: Mark queries as stale WITHOUT refetching (non-blocking)
      queryClient.invalidateQueries({
        queryKey: [...employeeLeaveKeys.all, 'by-branch'],
        exact: false,
        refetchType: 'none', // ✅ CRITICAL: Don't refetch automatically
      });
      
      // Step 2: Manually refetch table query with proper delay (non-blocking)
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            queryClient.refetchQueries({
              queryKey: [...employeeLeaveKeys.all, 'by-branch'],
              exact: false,
              type: 'active',
            });
          },
          { timeout: 1000 }
        );
      } else {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.refetchQueries({
              queryKey: [...employeeLeaveKeys.all, 'by-branch'],
              exact: false,
              type: 'active',
            });
          }, 500);
        });
      }
      
      // Step 3: Defer dashboard stats invalidation (much longer delay)
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(
          () => {
            queryClient.invalidateQueries({
              queryKey: employeeLeaveKeys.dashboard(),
              exact: true,
              refetchType: 'active',
            });
          },
          { timeout: 2000 }
        );
      } else {
        requestAnimationFrame(() => {
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: employeeLeaveKeys.dashboard(),
              exact: true,
              refetchType: 'active',
            });
          }, 1500);
        });
      }
    },
  }, "Leave request rejected");
};

export const useDeleteEmployeeLeave = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => EmployeeLeaveService.remove(id),
    onSuccess: () => {
      invalidateEntity("leaves");
    },
  }, "Leave request deleted successfully");
};

