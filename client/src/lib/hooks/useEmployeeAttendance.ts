import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ServiceLocator } from "@/core";
import {
  EmployeeAttendanceCreate,
  EmployeeAttendanceUpdate,
  AttendanceQueryParams,
} from "@/lib/types/employee-attendance";

// Query Keys
const ATTENDANCE_KEYS = {
  all: ["employee-attendance"] as const,
  lists: () => [...ATTENDANCE_KEYS.all, "list"] as const,
  list: () => [...ATTENDANCE_KEYS.lists()] as const,
  listByBranch: () => [...ATTENDANCE_KEYS.lists(), "branch"] as const,
  details: () => [...ATTENDANCE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...ATTENDANCE_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all employee attendance records
 */
export const useEmployeeAttendance = () => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.list(),
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<any>('/employee-attendances/');
      const wrapper = res.data as any;
      return (wrapper?.data ?? []) as any[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch attendance records by branch
 */
export const useEmployeeAttendanceByBranch = (branchId: number) => {
  return useQuery({
    queryKey: [...ATTENDANCE_KEYS.listByBranch(), branchId],
    queryFn: async () => {
      const api = ServiceLocator.getApiClient();
      const res = await api.get<any>('/employee-attendances/branch');
      const wrapper = res.data as any;
      return (wrapper?.data ?? []) as any[];
    },
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch a single attendance record by ID
 */
export const useEmployeeAttendanceById = (id: number) => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.detail(id),
    queryFn: async () => {
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      const attendanceEntity = await employeeAttendanceUseCases.getEmployeeAttendanceById(id);
      
      if (!attendanceEntity) {
        throw new Error('Employee attendance not found');
      }
      
      // Convert clean architecture entity to backend format
      return {
        attendance_id: attendanceEntity.id,
        institute_id: 1, // Default value
        employee_id: attendanceEntity.employeeId,
        attendance_month: new Date(attendanceEntity.attendanceDate).toISOString().split('T')[0],
        total_working_days: attendanceEntity.workingHours || 0, // Map working hours to working days
        days_present: attendanceEntity.status === 'PRESENT' ? 1 : 0, // Simplified mapping
        days_absent: attendanceEntity.status === 'ABSENT' ? 1 : 0, // Simplified mapping
        paid_leaves: 0, // Default value
        unpaid_leaves: 0, // Default value
        late_arrivals: 0, // Default value
        early_departures: 0, // Default value
        created_at: attendanceEntity.createdAt,
        updated_at: attendanceEntity.updatedAt,
        created_by: null, // Not available in entity
        updated_by: null, // Not available in entity
      };
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to create a new attendance record
 */
export const useCreateEmployeeAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EmployeeAttendanceCreate) => {
      // Send data in backend schema shape via use case
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      // Use case ultimately maps via repository to backend fields
      const result = await employeeAttendanceUseCases.createEmployeeAttendance({
        employeeId: data.employee_id,
        attendanceDate: new Date(data.attendance_month),
        status: (data.days_present ?? 0) > 0 ? 'PRESENT' as any : 'ABSENT',
        branchId: 1,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
      toast({
        title: "Success",
        description: "Attendance record created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error creating attendance record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create attendance record",
      });
    },
  });
};

/**
 * Hook to update an attendance record
 */
export const useUpdateEmployeeAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeeAttendanceUpdate }) => {
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      const attendance = await employeeAttendanceUseCases.updateEmployeeAttendance({
        id,
        status: (data.days_present ?? 0) > 0 ? 'PRESENT' as any : (data.days_absent ?? 0) > 0 ? 'ABSENT' as any : undefined,
      });
      return attendance;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.detail(id) });
      toast({
        title: "Success",
        description: "Attendance record updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating attendance record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update attendance record",
      });
    },
  });
};

/**
 * Hook to delete an attendance record
 */
export const useDeleteEmployeeAttendance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      await employeeAttendanceUseCases.deleteEmployeeAttendance(id);
      
      // Return mock response for compatibility
      return {
        attendance_id: id,
        employee_id: 0,
        attendance_date: new Date().toISOString(),
        check_in_time: null,
        check_out_time: null,
        status: 'DELETED' as any,
        working_hours: 0,
        overtime_hours: 0,
        notes: 'Deleted',
        branch_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.lists() });
      toast({
        title: "Success",
        description: "Attendance record deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting attendance record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete attendance record",
      });
    },
  });
};
