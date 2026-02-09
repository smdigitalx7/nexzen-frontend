import { useAdminDashboardQuery } from "@/features/general/hooks/useAdminDashboardQuery";
import { useActivitySummary } from "@/features/general/hooks/useAuditLogs";

export const useAdminDashboardData = () => {
  const {
    dashboardData,
    loading,
    isFetching,
    error,
    refetch,
  } = useAdminDashboardQuery();

  // Fetch recent audit log activity summary (last 24 hours, maximum 5 records)
  const { data: auditLogSummary = [] } = useActivitySummary({
    hours_back: 24,
    limit: 5,
  });

  const displaySummary = auditLogSummary.slice(0, 5);

  return {
    dashboardData,
    loading,
    isFetching,
    error,
    refetch,
    auditLogSummary: displaySummary,
  };
};
