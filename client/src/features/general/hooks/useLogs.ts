import { useQuery } from "@tanstack/react-query";
import { LogsService } from "@/features/general/services/logs.service";
import type { LogQueryParams } from "@/features/general/types/logs";

/**
 * Hook for managing system logs
 */
export const useLogs = () => {
  // Get available log files
  const {
    data: logFiles,
    isLoading: isLoadingLogFiles,
    error: logFilesError,
    refetch: refetchLogFiles,
  } = useQuery({
    queryKey: ["logs", "files"],
    queryFn: () => LogsService.getLogFiles(),
  });

  return {
    // Data
    logFiles,
    isLoadingLogFiles,
    logFilesError,
    
    // Actions
    refetchLogFiles,
  };
};

/**
 * Hook for getting logs from a specific category
 */
export const useLogsByCategory = (category: string, params?: LogQueryParams) => {
  return useQuery({
    queryKey: ["logs", "category", category, params],
    queryFn: () => LogsService.getLogsByCategory(category, params),
    enabled: !!category,
  });
};

/**
 * Hook for getting log statistics
 */
export const useLogStats = (category: string, hours: number = 24) => {
  return useQuery({
    queryKey: ["logs", "stats", category, hours],
    queryFn: () => LogsService.getLogStats(category, hours),
    enabled: !!category,
  });
};

/**
 * Hook for searching all logs
 */
export const useLogSearch = (query: string, linesPerFile: number = 20) => {
  return useQuery({
    queryKey: ["logs", "search", query, linesPerFile],
    queryFn: () => LogsService.searchAllLogs(query, linesPerFile),
    enabled: !!query && query.length > 2,
  });
};
