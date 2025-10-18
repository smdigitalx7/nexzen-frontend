import { useQuery } from "@tanstack/react-query";
import { HealthService } from "@/lib/services/general/health.service";

/**
 * Hook for health check operations
 */
export const useHealth = () => {
  // Liveness probe
  const {
    data: liveness,
    isLoading: isLoadingLiveness,
    error: livenessError,
    refetch: refetchLiveness,
  } = useQuery({
    queryKey: ["health", "liveness"],
    queryFn: () => HealthService.getLiveness(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });

  // Readiness probe
  const {
    data: readiness,
    isLoading: isLoadingReadiness,
    error: readinessError,
    refetch: refetchReadiness,
  } = useQuery({
    queryKey: ["health", "readiness"],
    queryFn: () => HealthService.getReadiness(),
    refetchInterval: 30000, // Refetch every 30 seconds
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
