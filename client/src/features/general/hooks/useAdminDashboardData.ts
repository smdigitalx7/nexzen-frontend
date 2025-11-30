import { useAdminDashboard } from "@/features/general/hooks";
import { useActivitySummary } from "@/features/general/hooks/useAuditLogs";

export const useAdminDashboardData = () => {
  const { data: dashboardData, loading, error } = useAdminDashboard();

  // Fetch recent audit log activity summary (last 24 hours, maximum 5 records)
  const { data: auditLogSummary = [] } = useActivitySummary({
    hours_back: 24,
    limit: 5,
  });

  // Ensure we only show maximum 5 records
  const displaySummary = auditLogSummary.slice(0, 5);

  return {
    dashboardData,
    loading,
    error,
    auditLogSummary: displaySummary,
  };
};
