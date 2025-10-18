import { Api } from "@/lib/api";
import type {
  HealthCheckResponse,
  LivenessResponse,
} from "@/lib/types/general/health";

/**
 * HealthService - Handles all health check API operations
 * 
 * No authentication required for health checks
 * 
 * Available endpoints:
 * - GET /health/live - Liveness probe
 * - GET /health/ready - Readiness probe with database and Redis checks
 */
export const HealthService = {
  /**
   * Liveness probe - simple health check
   * @returns Promise<LivenessResponse> - Liveness status
   */
  getLiveness(): Promise<LivenessResponse> {
    return Api.get<LivenessResponse>("/health/live", undefined, undefined);
  },

  /**
   * Readiness probe - comprehensive health check with dependencies
   * @returns Promise<HealthCheckResponse> - Readiness status with dependency checks
   */
  getReadiness(): Promise<HealthCheckResponse> {
    return Api.get<HealthCheckResponse>("/health/ready", undefined, undefined);
  },
};
