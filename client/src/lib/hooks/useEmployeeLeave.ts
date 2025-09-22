import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { leaveService } from "@/lib/services/employee-leave.service";
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
    queryFn: () => leaveService.list(params),
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
    queryFn: () => leaveService.listByBranch(),
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
    queryFn: () => leaveService.getById(id),
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
    queryFn: () => leaveService.getSummary(employeeId, year),
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
    mutationFn: (data: EmployeeLeaveCreate) => leaveService.create(data),
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
    mutationFn: ({ id, data }: { id: number; data: EmployeeLeaveUpdate }) =>
      leaveService.update(id, data),
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
    mutationFn: (id: number) => leaveService.approve(id),
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
    mutationFn: ({ id, data }: { id: number; data: EmployeeLeaveReject }) =>
      leaveService.reject(id, data),
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
    mutationFn: (id: number) => leaveService.remove(id),
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
