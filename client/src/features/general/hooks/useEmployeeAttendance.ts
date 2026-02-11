import { useQuery } from '@tanstack/react-query';
import { EmployeeAttendanceService } from '@/features/general/services/employee-attendance.service';
import type { 
  EmployeeAttendanceRead, 
  EmployeeAttendanceCreate, 
  EmployeeAttendanceUpdate,
  IndividualAttendanceCreateRequest,
  IndividualAttendanceUpdateRequest,
  AttendanceListResponse,
  AttendanceDashboardStats
} from '@/features/general/types/employee-attendance';
import { useMutationWithSuccessToast } from "@/common/hooks/use-mutation-with-toast";
import { useGlobalRefetch } from "@/common/hooks/useGlobalRefetch";

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

export const useAttendanceByBranch = (month?: number, year?: number, pageSize: number = 10, page: number = 1, enabled: boolean = true) => {
  // Default to current month/year if not provided (mandatory parameters)
  const now = new Date();
  const currentMonth = month ?? now.getMonth() + 1;
  const currentYear = year ?? now.getFullYear();
  
  return useQuery({
    queryKey: employeeAttendanceKeys.byBranch({ month: currentMonth, year: currentYear, pageSize, page }),
    queryFn: () => EmployeeAttendanceService.listByBranch(currentMonth, currentYear, page, pageSize),
    enabled, // Allow conditional query execution to prevent unnecessary fetches
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAttendance = (id: number) => {
  return useQuery({
    queryKey: employeeAttendanceKeys.detail(id),
    queryFn: () => EmployeeAttendanceService.getById(id),
    enabled: !!id,
  });
};

export const useAttendanceDashboard = (enabled: boolean = true) => {
  return useQuery({
    queryKey: employeeAttendanceKeys.dashboard(),
    queryFn: () => EmployeeAttendanceService.getDashboard(),
    enabled, // ✅ FIX: Only fetch when enabled (tab is active)
  });
};

// Mutation hooks
export const useCreateAttendance = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: IndividualAttendanceCreateRequest) => EmployeeAttendanceService.create(data),
    onSuccess: () => {
      invalidateEntity("employeeAttendances");
    },
  }, "Attendance record created successfully");
};

export const useUpdateAttendance = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: EmployeeAttendanceUpdate }) => 
      EmployeeAttendanceService.update(id, payload),
    onSuccess: () => {
      invalidateEntity("employeeAttendances");
    },
  }, "Attendance record updated successfully");
};

export const useUpdateIndividualAttendance = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (payload: IndividualAttendanceUpdateRequest) => 
      EmployeeAttendanceService.updateIndividual(payload),
    onSuccess: () => {
      invalidateEntity("employeeAttendances");
    },
  }, "Attendance record updated successfully");
};

export const useDeleteAttendance = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => EmployeeAttendanceService.remove(id),
    onSuccess: () => {
      invalidateEntity("employeeAttendances");
    },
  }, "Attendance record deleted successfully");
};
