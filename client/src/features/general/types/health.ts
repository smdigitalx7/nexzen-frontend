/**
 * Health Types
 * 
 * Types for health check API endpoints
 * Base path: /api/v1/health
 */

export interface HealthCheckResponse {
  status: "ok" | "degraded" | "error";
  checks?: {
    database: boolean;
    redis_cache: boolean | "not_configured";
    redis_queue: boolean | "not_configured";
  };
}

export interface LivenessResponse {
  status: "ok";
}
