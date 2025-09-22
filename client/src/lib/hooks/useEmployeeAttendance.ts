import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { attendanceService } from "@/lib/services/employee-attendance.service";
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
    queryFn: () => attendanceService.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch attendance records by branch
 */
export const useEmployeeAttendanceByBranch = () => {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.listByBranch(),
    queryFn: () => attendanceService.listByBranch(),
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
    queryFn: () => attendanceService.getById(id),
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
    mutationFn: (data: EmployeeAttendanceCreate) => attendanceService.create(data),
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
    mutationFn: ({ id, data }: { id: number; data: EmployeeAttendanceUpdate }) =>
      attendanceService.update(id, data),
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
    mutationFn: (id: number) => attendanceService.remove(id),
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
