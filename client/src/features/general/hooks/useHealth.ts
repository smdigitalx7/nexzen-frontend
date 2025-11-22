import { useQuery } from "@tanstack/react-query";
import { HealthService } from "@/features/general/services/health.service";

/**
 * Hook for health check operations
 * 
 * ✅ OPTIMIZATION: Made on-demand - no auto-refetch
 * Health checks should only run when explicitly requested, not continuously
 */
export const useHealth = () => {
  // Liveness probe - on-demand only
  const {
    data: liveness,
    isLoading: isLoadingLiveness,
    error: livenessError,
    refetch: refetchLiveness,
  } = useQuery({
    queryKey: ["health", "liveness"],
    queryFn: () => HealthService.getLiveness(),
    enabled: false, // ✅ OPTIMIZATION: On-demand only - no auto-fetch
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 3,
  });

  // Readiness probe - on-demand only
  const {
    data: readiness,
    isLoading: isLoadingReadiness,
    error: readinessError,
    refetch: refetchReadiness,
  } = useQuery({
    queryKey: ["health", "readiness"],
    queryFn: () => HealthService.getReadiness(),
    enabled: false, // ✅ OPTIMIZATION: On-demand only - no auto-fetch
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 3,
  });

  return {
    // Liveness data
    liveness,
    isLoadingLiveness,
    livenessError,
    refetchLiveness,
    
    // Readiness data
    readiness,
    isLoadingReadiness,
    readinessError,
    refetchReadiness,
    
    // Combined health status
    isHealthy: liveness?.status === "ok" && readiness?.status === "ok",
    isDegraded: readiness?.status === "degraded",
    isUnhealthy: liveness?.status !== "ok" || readiness?.status === "error",
  };
};
