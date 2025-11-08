import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuditLogsService } from "@/lib/services/general/audit-logs.service";
import type {
  ActivitySummaryParams,
  AuditLogReadableParams,
  AuditLogDeleteParams,
} from "@/lib/types/general/audit-logs";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for getting activity summary from audit logs
 * @param params - Query parameters for filtering activity summary
 * @returns Query result with activity summaries
 */
export const useActivitySummary = (params?: ActivitySummaryParams) => {
  return useQuery({
    queryKey: ["audit-logs", "activity-summary", params],
    queryFn: () => AuditLogsService.getActivitySummary(params),
    staleTime: 30000, // 30 seconds - activity summaries update frequently
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
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook for previewing delete audit logs
 * @returns Mutation for previewing delete
 */
export const usePreviewDeleteLogs = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: AuditLogDeleteParams) =>
      AuditLogsService.previewDelete(params),
    onError: (error: any) => {
      toast({
        title: "Preview Failed",
        description:
          error?.response?.data?.detail ||
          error?.message ||
          "Failed to preview delete operation.",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook for deleting audit logs
 * @returns Mutation for deleting logs
 */
export const useDeleteLogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: AuditLogDeleteParams) =>
      AuditLogsService.deleteLogs(params),
    onSuccess: () => {
      toast({
        title: "Logs Deleted",
        description: "Audit logs have been deleted successfully.",
        variant: "success",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["audit-logs"],
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

