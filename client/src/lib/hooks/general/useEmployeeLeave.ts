import { useQuery } from '@tanstack/react-query';
import { EmployeeLeaveService } from '@/lib/services/general/employee-leave.service';
import type { 
  EmployeeLeaveRead, 
  EmployeeLeaveCreate, 
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
  EmployeeLeaveListResponse,
  LeaveDashboardStats,
  RecentLeave
} from '@/lib/types/general/employee-leave';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';
import { useGlobalRefetch } from '../common/useGlobalRefetch';

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

export const useEmployeeLeavesByBranch = (pageSize: number = 10, page: number = 1, leaveStatus?: string, month?: number, year?: number) => {
  return useQuery({
    queryKey: employeeLeaveKeys.byBranch({ pageSize, page, leaveStatus, month, year }),
    queryFn: () => EmployeeLeaveService.listByBranch(pageSize, page, leaveStatus, month, year),
  });
};

export const useEmployeeLeaveById = (id: number) => {
  return useQuery({
    queryKey: employeeLeaveKeys.detail(id),
    queryFn: () => EmployeeLeaveService.getById(id),
    enabled: !!id,
  });
};

export const useLeaveDashboard = () => {
  return useQuery({
    queryKey: employeeLeaveKeys.dashboard(),
    queryFn: () => EmployeeLeaveService.getDashboard(),
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
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => EmployeeLeaveService.approve(id),
    onSuccess: () => {
      invalidateEntity("leaves");
    },
  }, "Leave request approved successfully");
};

export const useRejectEmployeeLeave = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, data }: { id: number; data: EmployeeLeaveReject }) => 
      EmployeeLeaveService.reject(id, data),
    onSuccess: () => {
      invalidateEntity("leaves");
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
