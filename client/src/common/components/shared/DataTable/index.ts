// DataTable V2 - Public API
// Clean exports for easy importing

// Main composed component
export { DataTable } from "./DataTable";
export type { DataTableProps } from "./DataTable";

// Individual components for composition
export { DataTableProvider, useDataTableContext } from "./DataTableProvider";
export type { DataTableProviderProps } from "./DataTableProvider";

export { DataTableCore } from "./DataTableCore";
export { DataTableToolbar } from "./DataTableToolbar";
export { DataTablePagination } from "./DataTablePagination";
export { DataTableExport } from "./DataTableExport";

// Types
export type {
  PaginationState,
  PaginationInfo,
  FilterConfig,
  FilterState,
  SortingState,
  ActionConfig,
  ExportConfig,
  DataTableContextValue,
  ColumnAccessor,
  PresetColumnType,
} from "./types";
