import { Api } from "@/core/api";
import type {
  LogFilesResponse,
  LogsResponse,
  LogStatsResponse,
  GlobalSearchResponse,
  LogQueryParams,
} from "@/features/general/types/logs";

/**
 * LogsService - Handles all system logs API operations
 * 
 * No authentication required for log operations
 * 
 * Available endpoints:
 * - GET /logs - List available log files
 * - GET /logs/{category} - Get logs from specific category
 * - GET /logs/{category}/stats - Get log statistics
 * - GET /logs/search/global - Search across all logs
 */
export const LogsService = {
  /**
   * Get list of available log files
   * @returns Promise<LogFilesResponse> - List of log files
   */
  getLogFiles(): Promise<LogFilesResponse> {
    return Api.get<LogFilesResponse>("/logs");
  },

  /**
   * Get logs from a specific category
   * @param category - Log category (app, error, access, database, security)
   * @param params - Query parameters
   * @returns Promise<LogsResponse> - Logs from the category
   */
  getLogsByCategory(category: string, params?: LogQueryParams): Promise<LogsResponse> {
    return Api.get<LogsResponse>(`/logs/${category}`, params as Record<string, string | number | boolean | null | undefined>);
  },

  /**
   * Get log statistics for a category
   * @param category - Log category
   * @param hours - Number of hours to analyze (default: 24)
   * @returns Promise<LogStatsResponse> - Log statistics
   */
  getLogStats(category: string, hours: number = 24): Promise<LogStatsResponse> {
    return Api.get<LogStatsResponse>(`/logs/${category}/stats`, { hours });
  },

  /**
   * Search across all log files
   * @param query - Search term
   * @param linesPerFile - Lines per file to return (default: 20)
   * @returns Promise<GlobalSearchResponse> - Search results
   */
  searchAllLogs(query: string, linesPerFile: number = 20): Promise<GlobalSearchResponse> {
    return Api.get<GlobalSearchResponse>("/logs/search/global", { 
      query, 
      lines_per_file: linesPerFile 
    });
  },
};
