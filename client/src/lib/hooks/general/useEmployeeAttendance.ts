import { useQuery, useQueryClient } from '@tanstack/react-query';
import { EmployeeAttendanceService } from '@/lib/services/general/employee-attendance.service';
import type { 
  EmployeeAttendanceRead, 
  EmployeeAttendanceCreate, 
  EmployeeAttendanceUpdate,
  AttendanceListResponse,
  AttendanceDashboardStats
} from '@/lib/types/general/employee-attendance';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';

// Query keys
export const employeeAttendanceKeys = {
  all: ['employee-attendances'] as const,
  lists: () => [...employeeAttendanceKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...employeeAttendanceKeys.lists(), { filters }] as const,
  details: () => [...employeeAttendanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...employeeAttendanceKeys.details(), id] as const,
  dashboard: () => [...employeeAttendanceKeys.all, 'dashboard'] as const,
  byBranch: (filters: Record<string, any>) => [...employeeAttendanceKeys.all, 'by-branch', { filters }] as const,
};

// Hooks for fetching data
export const useAttendanceAll = (month?: number, year?: number) => {
  return useQuery({
    queryKey: employeeAttendanceKeys.list({ month, year }),
    queryFn: () => EmployeeAttendanceService.listAll(month, year),
  });
};

export const useAttendanceByBranch = (month?: number, year?: number) => {
  return useQuery({
    queryKey: employeeAttendanceKeys.byBranch({ month, year }),
    queryFn: () => EmployeeAttendanceService.listByBranch(month, year),
  });
};

export const useAttendance = (id: number) => {
  return useQuery({
    queryKey: employeeAttendanceKeys.detail(id),
    queryFn: () => EmployeeAttendanceService.getById(id),
    enabled: !!id,
  });
};

export const useAttendanceDashboard = () => {
  return useQuery({
    queryKey: employeeAttendanceKeys.dashboard(),
    queryFn: () => EmployeeAttendanceService.getDashboard(),
  });
};

// Mutation hooks
export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: EmployeeAttendanceCreate) => EmployeeAttendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.dashboard() });
    },
  }, "Attendance record created successfully");
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: EmployeeAttendanceUpdate }) => 
      EmployeeAttendanceService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.dashboard() });
    },
  }, "Attendance record updated successfully");
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => EmployeeAttendanceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeAttendanceKeys.dashboard() });
    },
  }, "Attendance record deleted successfully");
};
