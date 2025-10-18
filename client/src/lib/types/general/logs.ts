/**
 * Logs Types
 * 
 * Types for system logs API endpoints
 * Base path: /api/v1/logs
 */

export interface LogFile {
  name: string;
  size: number;
  modified: string;
  category: string;
}

export interface LogFilesResponse {
  log_files: LogFile[];
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  module?: string;
  user_id?: number;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  raw?: boolean;
}

export interface LogsResponse {
  category: string;
  total_lines: number;
  returned_lines: number;
  filters: {
    level?: string;
    search?: string;
    lines_requested: number;
  };
  logs: LogEntry[];
}

export interface LogStats {
  total_logs: number;
  recent_logs: number;
  level_distribution: Record<string, number>;
  most_common_level?: string;
}

export interface LogStatsResponse {
  category: string;
  time_range_hours: number;
  stats: LogStats;
}

export interface GlobalSearchResponse {
  query: string;
  results: Record<string, LogEntry[]>;
  total_matches: number;
}

export interface LogQueryParams {
  lines?: number;
  level?: string;
  search?: string;
  hours?: number;
  lines_per_file?: number;
}
