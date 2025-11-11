import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuditLogsService } from "@/lib/services/general/audit-logs.service";
import type {
  ActivitySummaryParams,
  AuditLogReadableParams,
  AuditLogDeleteParams,
  AuditLogDeleteByIdsParams,
} from "@/lib/types/general/audit-logs";
import { useToast } from "@/hooks/use-toast";
import { CacheUtils } from "@/lib/api";

/**
 * Hook for getting activity summary from audit logs
 * @param params - Query parameters for filtering activity summary
 * @returns Query result with activity summaries
 */
export const useActivitySummary = (params?: ActivitySummaryParams) => {
  return useQuery({
    queryKey: ["audit-logs", "activity-summary", params],
    queryFn: () => AuditLogsService.getActivitySummary(params),
    staleTime: 0, // Always refetch when invalidated
  });
};

/**
 * Hook for getting readable audit logs
 * @param params - Query parameters for filtering readable logs
 * @returns Query result with readable audit logs
 */
export const useReadableLogs = (params?: AuditLogReadableParams) => {
  return useQuery({
    queryKey: ["audit-logs", "readable", params],
    queryFn: () => AuditLogsService.getReadableLogs(params),
    staleTime: 0, // Always refetch when invalidated
  });
};

/**
 * Hook for deleting audit logs by date range
 * @returns Mutation for deleting logs by date range
 */
export const useDeleteLogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AuditLogDeleteParams) =>
      AuditLogsService.deleteLogs(params),
    onSuccess: async (response) => {
      toast({
        title: "Logs Deleted",
        description: response.message || "Audit logs have been deleted successfully.",
        variant: "success",
      });
      
      // CRITICAL: Clear API-level cache first (this was the root cause!)
      // The API layer caches GET requests, so we need to clear it before refetching
      CacheUtils.clearByPattern(/GET:.*\/audit-logs/i);
      
      // Remove all audit-logs queries from React Query cache
      queryClient.removeQueries({
        queryKey: ["audit-logs"],
        exact: false,
      });
      
      // Force refetch all active queries (they will now fetch fresh data from API)
      await queryClient.refetchQueries({
        queryKey: ["audit-logs"],
        exact: false,
        type: "active",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description:
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to delete audit logs.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting audit logs by IDs
 * @returns Mutation for deleting logs by audit IDs
 */
export const useDeleteLogsByIds = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AuditLogDeleteByIdsParams) =>
      AuditLogsService.deleteLogsByIds(params),
    onSuccess: async (response) => {
      toast({
        title: "Logs Deleted",
        description: response.message || "Audit logs have been deleted successfully.",
        variant: "success",
      });
      
      // CRITICAL: Clear API-level cache first (this was the root cause!)
      // The API layer caches GET requests, so we need to clear it before refetching
      CacheUtils.clearByPattern(/GET:.*\/audit-logs/i);
      
      // Remove all audit-logs queries from React Query cache
      queryClient.removeQueries({
        queryKey: ["audit-logs"],
        exact: false,
      });
      
      // Force refetch all active queries (they will now fetch fresh data from API)
      await queryClient.refetchQueries({
        queryKey: ["audit-logs"],
        exact: false,
        type: "active",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description:
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to delete audit logs.",
        variant: "destructive",
      });
    },
  });
};
