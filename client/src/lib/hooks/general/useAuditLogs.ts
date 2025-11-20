import { useQuery, useMutation } from "@tanstack/react-query";
import { AuditLogsService } from "@/lib/services/general/audit-logs.service";
import type {
  ActivitySummaryParams,
  AuditLogReadableParams,
  AuditLogDeleteParams,
  AuditLogDeleteByIdsParams,
} from "@/lib/types/general/audit-logs";
import { useToast } from "@/hooks/use-toast";
import { batchInvalidateAndRefetch } from "../common/useGlobalRefetch";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook for getting activity summary from audit logs
 * @param params - Query parameters for filtering activity summary
 * @returns Query result with activity summaries
 */
export const useActivitySummary = (params?: ActivitySummaryParams) => {
  const { isAuthenticated, isLoggingOut } = useAuthStore();
  
  return useQuery({
    queryKey: ["audit-logs", "activity-summary", params],
    queryFn: async () => {
      // CRITICAL: Double-check logout state INSIDE queryFn (safety net)
      const currentState = useAuthStore.getState();
      if (currentState.isLoggingOut || !currentState.isAuthenticated) {
        throw new Error("Query cancelled: logout in progress");
      }
      return AuditLogsService.getActivitySummary(params);
    },
    // CRITICAL: Disable query if logging out or not authenticated
    enabled: isAuthenticated && !isLoggingOut,
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

  return useMutation({
    mutationFn: (params: AuditLogDeleteParams) =>
      AuditLogsService.deleteLogs(params),
    onSuccess: async (response) => {
      toast({
        title: "Logs Deleted",
        description: response.message || "Audit logs have been deleted successfully.",
        variant: "success",
      });
      
      // ✅ FIX: Batch invalidate queries to prevent UI freeze
      // React Query handles caching properly, no need for API-level cache clearing
      batchInvalidateAndRefetch([["audit-logs"]]);
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

  return useMutation({
    mutationFn: (params: AuditLogDeleteByIdsParams) =>
      AuditLogsService.deleteLogsByIds(params),
    onSuccess: async (response) => {
      toast({
        title: "Logs Deleted",
        description: response.message || "Audit logs have been deleted successfully.",
        variant: "success",
      });
      
      // ✅ FIX: Batch invalidate queries to prevent UI freeze
      // React Query handles caching properly, no need for API-level cache clearing
      batchInvalidateAndRefetch([["audit-logs"]]);
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
