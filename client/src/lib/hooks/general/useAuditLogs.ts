import { useQuery } from "@tanstack/react-query";
import { AuditLogsService } from "@/lib/services/general/audit-logs.service";
import type { ActivitySummaryParams } from "@/lib/types/general/audit-logs";

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

