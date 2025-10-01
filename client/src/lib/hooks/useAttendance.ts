import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import type { EmployeeAttendanceRead, EmployeeAttendanceCreate, EmployeeAttendanceUpdate } from "@/lib/types/attendance";

const keys = {
  all: ["attendance", "all"] as const,
  branch: ["attendance", "branch"] as const,
  detail: (id: number) => ["attendance", id] as const,
};

export function useAttendanceAll() {
  return useQuery<EmployeeAttendanceRead[]>({ 
    queryKey: keys.all, 
    queryFn: async () => {
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      const attendance = await employeeAttendanceUseCases.getAllEmployeeAttendance();
      
      // Convert clean architecture response to legacy format
      return attendance.map((attendanceEntity: any) => ({
        attendance_id: attendanceEntity.id,
        employee_id: attendanceEntity.employeeId,
        branch_id: attendanceEntity.branchId,
        date: attendanceEntity.attendanceDate,
        status: attendanceEntity.status,
      }));
    }
  });
}

export function useAttendanceByBranch() {
  return useQuery<EmployeeAttendanceRead[]>({ 
    queryKey: keys.branch, 
    queryFn: async () => {
      try {
        console.log("🔍 useAttendanceByBranch: Starting to fetch attendance...");
        const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
        const attendance = await employeeAttendanceUseCases.getAllEmployeeAttendance();
        console.log("🔍 useAttendanceByBranch: Got attendance:", attendance.length, 'records');
        console.log("🔍 useAttendanceByBranch: Raw attendance data:", attendance);
        
        // Convert clean architecture response to legacy format
        const mappedAttendance = attendance.map(attendanceEntity => ({
          attendance_id: attendanceEntity.id,
          employee_id: attendanceEntity.employeeId,
          branch_id: attendanceEntity.branchId,
          date: attendanceEntity.attendanceDate,
          status: attendanceEntity.status,
        }));
        console.log("🔍 useAttendanceByBranch: Mapped attendance:", mappedAttendance.length, 'records');
        console.log("🔍 useAttendanceByBranch: Mapped attendance data:", mappedAttendance);
        return mappedAttendance;
      } catch (error) {
        console.error("❌ useAttendanceByBranch: Error fetching attendance:", error);
        throw error;
      }
    }
  });
}

export function useAttendance(id: number) {
  return useQuery<EmployeeAttendanceRead>({ 
    queryKey: keys.detail(id), 
    queryFn: async () => {
      console.log(`Fetching student attendance ${id} with clean architecture...`);
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      const attendanceEntity = await employeeAttendanceUseCases.getEmployeeAttendanceById(id);
      
      if (!attendanceEntity) {
        throw new Error('Student attendance not found');
      }
      
      // Convert clean architecture response to legacy format
      return {
        attendance_id: attendanceEntity.id,
        employee_id: attendanceEntity.employeeId,
        branch_id: attendanceEntity.branchId,
        date: attendanceEntity.attendanceDate,
        status: attendanceEntity.status,
      };
    }, 
    enabled: Number.isFinite(id) 
  });
}

export function useCreateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: EmployeeAttendanceCreate) => {
      console.log("Creating student attendance with clean architecture...");
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      const attendance = await employeeAttendanceUseCases.createEmployeeAttendance({
        employeeId: payload.employee_id,
        attendanceDate: new Date(payload.date),
        status: payload.status as any,
        branchId: 1, // Default branch
      });
      
      // Return the response data directly
      return attendance;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
    },
  });
}

export function useUpdateAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: EmployeeAttendanceUpdate }) => {
      console.log(`Updating student attendance ${id} with clean architecture...`);
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      const attendance = await employeeAttendanceUseCases.updateEmployeeAttendance({
        id,
        status: payload.status as any,
      });
      
      // Return the response data directly
      return attendance;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
      qc.invalidateQueries({ queryKey: keys.detail(v.id) });
    },
  });
}

export function useDeleteAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting student attendance ${id} with clean architecture...`);
      const employeeAttendanceUseCases = ServiceLocator.getEmployeeAttendanceUseCases();
      await employeeAttendanceUseCases.deleteEmployeeAttendance(id);
      
      // Return mock response for compatibility
      return {
        attendance_id: id,
        employee_id: 0,
        branch_id: 1,
        date: new Date().toISOString(),
        status: 'DELETED' as any,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.branch });
    },
  });
}
