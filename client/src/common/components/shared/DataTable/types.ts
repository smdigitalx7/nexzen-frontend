// DataTable V2 - Types and Interfaces
// Clean, focused type definitions for the new modular DataTable

import type { ColumnDef } from "@tanstack/react-table";

/**
 * Pagination state for both client and server-side pagination
 */
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  startIndex: number;
  endIndex: number;
}

/**
 * Filter configuration for the toolbar
 */
export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "search" | "date" | "dateRange";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface FilterState {
  [key: string]: string | null | undefined;
}

/**
 * Sorting state
 */
export interface SortingState {
  id: string;
  desc: boolean;
}

/**
 * Action button configuration
 */
export interface ActionConfig<TData> {
  id: string;
  label: string | ((row: TData) => string);
  icon: React.ComponentType<{ className?: string }>;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  className?: string | ((row: TData) => string);
  show?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
  /**
   * If true, shows the label text alongside the icon. If false or undefined, shows only the icon with a tooltip.
   */
  showLabel?: boolean;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  enabled: boolean;
  filename?: string;
  sheetName?: string;
  onExport?: () => void | Promise<void>;
}

/**
 * Main DataTable props - intentionally slim
 */
export interface DataTableProps<TData> {
  // Required
  data: TData[];
  columns: ColumnDef<TData>[];
  
  // Optional features
  title?: string;
  loading?: boolean;
  
  // Search
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  showSearch?: boolean;
  
  // Filters
  filters?: FilterConfig[];
  
  // Pagination
  pagination?: "client" | "server" | "none";
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Server-side pagination props
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  currentPage?: number;
  
  // Actions
  actions?: ActionConfig<TData>[];
  
  // Export
  export?: ExportConfig;
  
  // Add button
  onAdd?: () => void;
  addButtonText?: string;
  
  // Selection
  selectable?: boolean;
  onSelectionChange?: (rows: TData[]) => void;
  onFilterChange?: (filters: FilterState) => void;
  getRowId?: (row: TData) => string | number;
  
  // Styling
  className?: string;
}

/**
 * DataTable context value
 */
export interface DataTableContextValue<TData = unknown> {
  // Data
  data: TData[];
  filteredData: TData[];
  paginatedData: TData[];
  
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  
  // Filters
  filters: FilterState;
  setFilter: (key: string, value: string | null) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  
  // Pagination
  pagination: PaginationState;
  paginationInfo: PaginationInfo;
  setPagination: (state: PaginationState) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Sorting
  sorting: SortingState[];
  setSorting: (sorting: SortingState[]) => void;
  
  // Selection
  selectedRows: TData[];
  setSelectedRows: (rows: TData[]) => void;
  
  // Loading
  loading: boolean;
  
  // Configuration
  config: {
    pagination: "client" | "server" | "none";
    pageSizeOptions: number[];
    searchKey?: string;
    getRowId?: (row: TData) => string | number;
  };
}

/**
 * Column helper types for consistent column definitions
 */
export type ColumnAccessor<TData, TValue = unknown> = {
  accessorKey: keyof TData;
  header: string;
  cell?: (value: TValue, row: TData) => React.ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  size?: number;
};

/**
 * Preset column types for common fields
 */
export type PresetColumnType = 
  | "index"
  | "text"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "status"
  | "badge"
  | "actions";
