import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ServiceLocator } from "@/core";
import {
  EmployeeLeaveCreate,
  EmployeeLeaveUpdate,
  EmployeeLeaveReject,
  EmployeeLeaveQueryParams,
} from "@/lib/types/employee-leave";

// Query Keys
const LEAVE_KEYS = {
  all: ["employee-leave"] as const,
  lists: () => [...LEAVE_KEYS.all, "list"] as const,
  list: (params?: EmployeeLeaveQueryParams) => [...LEAVE_KEYS.lists(), params] as const,
  listByBranch: () => [...LEAVE_KEYS.lists(), "branch"] as const,
  details: () => [...LEAVE_KEYS.all, "detail"] as const,
  detail: (id: number) => [...LEAVE_KEYS.details(), id] as const,
  summary: (employeeId: number, year?: number) => [...LEAVE_KEYS.all, "summary", employeeId, year] as const,
};

/**
 * Hook to fetch all employee leave records with filtering
 */
export const useEmployeeLeaves = (params?: EmployeeLeaveQueryParams) => {
  return useQuery({
    queryKey: LEAVE_KEYS.list(params),
    queryFn: async () => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const leaves = await employeeLeaveUseCases.getAllEmployeeLeaves();
      
      // Convert clean architecture entities to backend format
      return leaves.map(leaveEntity => ({
        leave_id: leaveEntity.id,
        employee_id: leaveEntity.employeeId,
        leave_type: leaveEntity.leaveType,
        from_date: leaveEntity.startDate, // Already in correct format
        to_date: leaveEntity.endDate, // Already in correct format
        reason: leaveEntity.reason,
        leave_status: leaveEntity.status, // Backend uses leave_status
        total_days: leaveEntity.totalDays,
        applied_date: leaveEntity.appliedDate, // Already in correct format
        approved_by: leaveEntity.approvedBy,
        approved_date: leaveEntity.approvedDate, // Already in correct format
        rejection_reason: leaveEntity.rejectionReason,
        created_at: leaveEntity.createdAt,
        updated_at: leaveEntity.updatedAt,
        created_by: null, // Not available in entity
        updated_by: null, // Not available in entity
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch leave records by branch
 */
export const useEmployeeLeavesByBranch = () => {
  return useQuery({
    queryKey: LEAVE_KEYS.listByBranch(),
    queryFn: async () => {
      try {
        console.log("🔍 useEmployeeLeavesByBranch: Starting to fetch leaves...");
        const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
        const leaves = await employeeLeaveUseCases.getAllEmployeeLeaves();
        console.log("🔍 useEmployeeLeavesByBranch: Got leaves:", leaves.length, 'records');
        console.log("🔍 useEmployeeLeavesByBranch: Raw leaves data:", leaves);
        
        // Convert clean architecture entities to backend format
        const mappedLeaves = leaves.map(leaveEntity => ({
          leave_id: leaveEntity.id,
          employee_id: leaveEntity.employeeId,
          leave_type: leaveEntity.leaveType,
          from_date: leaveEntity.startDate, // Already in correct format
          to_date: leaveEntity.endDate, // Already in correct format
          reason: leaveEntity.reason,
          leave_status: leaveEntity.status, // Backend uses leave_status
          total_days: leaveEntity.totalDays,
          applied_date: leaveEntity.appliedDate, // Already in correct format
          approved_by: leaveEntity.approvedBy,
          approved_date: leaveEntity.approvedDate, // Already in correct format
          rejection_reason: leaveEntity.rejectionReason,
          created_at: leaveEntity.createdAt,
          updated_at: leaveEntity.updatedAt,
          created_by: null, // Not available in entity
          updated_by: null, // Not available in entity
        }));
        console.log("🔍 useEmployeeLeavesByBranch: Mapped leaves:", mappedLeaves.length, 'records');
        console.log("🔍 useEmployeeLeavesByBranch: Mapped leaves data:", mappedLeaves);
        return mappedLeaves;
      } catch (error) {
        console.error("❌ useEmployeeLeavesByBranch: Error fetching leaves:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch a single leave record by ID
 */
export const useEmployeeLeaveById = (id: number) => {
  return useQuery({
    queryKey: LEAVE_KEYS.detail(id),
    queryFn: async () => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const leaveEntity = await employeeLeaveUseCases.getEmployeeLeaveById(id);
      
      if (!leaveEntity) {
        throw new Error('Employee leave not found');
      }
      
      // Convert clean architecture entity to backend format
      return {
        leave_id: leaveEntity.id,
        employee_id: leaveEntity.employeeId,
        leave_type: leaveEntity.leaveType,
        from_date: leaveEntity.startDate, // Already in correct format
        to_date: leaveEntity.endDate, // Already in correct format
        reason: leaveEntity.reason,
        leave_status: leaveEntity.status, // Backend uses leave_status
        total_days: leaveEntity.totalDays,
        applied_date: leaveEntity.appliedDate, // Already in correct format
        approved_by: leaveEntity.approvedBy,
        approved_date: leaveEntity.approvedDate, // Already in correct format
        rejection_reason: leaveEntity.rejectionReason,
        created_at: leaveEntity.createdAt,
        updated_at: leaveEntity.updatedAt,
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
 * Hook to fetch employee leave summary
 */
export const useEmployeeLeaveSummary = (employeeId: number, year?: number) => {
  return useQuery({
    queryKey: LEAVE_KEYS.summary(employeeId, year),
    queryFn: async () => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const summary = await employeeLeaveUseCases.getEmployeeLeaveSummary(employeeId, year || new Date().getFullYear());
      
      // Convert clean architecture entity to legacy format
      return {
        total_leaves: summary.totalLeaves,
        approved_leaves: summary.approvedLeaves,
        pending_leaves: summary.pendingLeaves,
        rejected_leaves: summary.rejectedLeaves,
        total_days: summary.totalDays,
        remaining_days: summary.remainingDays,
      };
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to create a new leave record
 */
export const useCreateEmployeeLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EmployeeLeaveCreate) => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const leave = await employeeLeaveUseCases.createEmployeeLeave({
        employeeId: data.employee_id,
        leaveType: data.leave_type as any,
        startDate: new Date(data.from_date),
        endDate: new Date(data.to_date),
        reason: data.reason,
        branchId: 1,
      });
      
      return leave;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.lists() });
      toast({
        title: "Success",
        description: "Leave request created successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error creating leave record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to create leave request",
      });
    },
  });
};

/**
 * Hook to update a leave record
 */
export const useUpdateEmployeeLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeeLeaveUpdate }) => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const leave = await employeeLeaveUseCases.updateEmployeeLeave({
        id,
        leaveType: data.leave_type as any,
        startDate: new Date(data.from_date || new Date()),
        endDate: new Date(data.to_date || new Date()),
        reason: data.reason,
      });
      
      return leave;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.detail(id) });
      toast({
        title: "Success",
        description: "Leave request updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error updating leave record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update leave request",
      });
    },
  });
};

/**
 * Hook to approve a leave record
 */
export const useApproveEmployeeLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const leave = await employeeLeaveUseCases.approveEmployeeLeave({
        id,
        approvedBy: 1, // TODO: Get from auth context
      });
      
      return leave;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.detail(id) });
      toast({
        title: "Success",
        description: "Leave request approved successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error approving leave record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to approve leave request",
      });
    },
  });
};

/**
 * Hook to reject a leave record
 */
export const useRejectEmployeeLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeeLeaveReject }) => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      const leave = await employeeLeaveUseCases.rejectEmployeeLeave({
        id,
        rejectedBy: 1, // TODO: Get from auth context
        rejectionReason: data.rejection_reason,
      });
      
      return leave;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.detail(id) });
      toast({
        title: "Success",
        description: "Leave request rejected successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error rejecting leave record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to reject leave request",
      });
    },
  });
};

/**
 * Hook to delete a leave record
 */
export const useDeleteEmployeeLeave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const employeeLeaveUseCases = ServiceLocator.getEmployeeLeaveUseCases();
      await employeeLeaveUseCases.deleteEmployeeLeave(id);
      
      // Return mock response for compatibility
      return {
        leave_id: id,
        employee_id: 0,
        leave_type: 'DELETED' as any,
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        total_days: 0,
        reason: 'Deleted',
        status: 'DELETED' as any,
        applied_date: new Date().toISOString(),
        approved_by: null,
        approved_date: null,
        rejected_by: null,
        rejected_date: null,
        rejection_reason: null,
        branch_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.lists() });
      toast({
        title: "Success",
        description: "Leave request deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting leave record:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to delete leave request",
      });
    },
  });
};
