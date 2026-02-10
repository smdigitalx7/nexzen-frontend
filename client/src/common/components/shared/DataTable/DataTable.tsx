// DataTable V2 - Main Composed Component
// Easy-to-use component that composes all the pieces

import { memo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableProvider, type DataTableProviderProps } from "./DataTableProvider";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTableCore } from "./DataTableCore";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableExport } from "./DataTableExport";
import { Separator } from "@/common/components/ui/separator";
import type { FilterConfig, ActionConfig, ExportConfig } from "./types";
import { cn } from "@/common/utils";

export interface DataTableProps<TData> extends Omit<DataTableProviderProps<TData>, "children"> {
  // Table columns
  columns: ColumnDef<TData>[];
  
  // Title
  title?: string;
  
  // Search
  searchPlaceholder?: string;
  showSearch?: boolean;
  
  // Filters
  filters?: FilterConfig[];
  
  // Actions
  actions?: ActionConfig<TData>[];
  actionsHeader?: string;
  
  // Selection
  selectable?: boolean;
  
  // Add button
  onAdd?: () => void;
  addButtonText?: string;
  
  // Export
  export?: ExportConfig;
  
  // Virtualization
  enableVirtualization?: boolean;
  virtualThreshold?: number;
  
  // Empty state
  emptyMessage?: string;
  
  // Styling
  className?: string;
  toolbarClassName?: string;
  tableClassName?: string;
  paginationClassName?: string;
  
  // Custom content slots
  toolbarLeftContent?: React.ReactNode;
  toolbarMiddleContent?: React.ReactNode;
  toolbarRightContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
}

function DataTableInner<TData>({
  columns,
  title,
  searchPlaceholder,
  showSearch = true,
  filters,
  actions,
  actionsHeader,
  selectable = false,
  onAdd,
  addButtonText,
  export: exportConfig,
  enableVirtualization,
  virtualThreshold,
  emptyMessage,
  className,
  toolbarClassName,
  tableClassName,
  paginationClassName,
  toolbarLeftContent,
  toolbarMiddleContent,
  toolbarRightContent,
  headerContent,
  footerContent,
  data,
}: DataTableProps<TData> & { data: TData[] }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with title */}
      {(title || headerContent) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-foreground/90 whitespace-nowrap">
              {title}
            </h2>
          )}
          
          {title && headerContent && (
            <div className="hidden sm:block flex-1 h-[1.5px] bg-border/40 mx-4" />
          )}

          {headerContent}
        </div>
      )}

      {/* Toolbar */}
      <DataTableToolbar
        className={toolbarClassName}
        searchPlaceholder={searchPlaceholder}
        showSearch={showSearch}
        filters={filters}
        onAdd={onAdd}
        addButtonText={addButtonText}
        leftContent={toolbarLeftContent}
        middleContent={toolbarMiddleContent}
        rightContent={
          <>
            {toolbarRightContent}
            {exportConfig?.enabled && (
              <DataTableExport
                data={data}
                columns={columns}
                config={{
                  filename: exportConfig.filename,
                  sheetName: exportConfig.sheetName,
                  title: title,
                }}
              />
            )}
          </>
        }
      />

      {/* Table */}
      <DataTableCore
        columns={columns}
        className={tableClassName}
        actions={actions}
        actionsHeader={actionsHeader}
        selectable={selectable}
        enableVirtualization={enableVirtualization}
        virtualThreshold={virtualThreshold}
        emptyMessage={emptyMessage}
      />

      {/* Pagination */}
      <DataTablePagination className={paginationClassName} />

      {/* Footer */}
      {footerContent}
    </div>
  );
}

function DataTableComponent<TData>({
  data,
  loading,
  searchKey,
  pagination,
  pageSize,
  pageSizeOptions,
  totalCount,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  getRowId,
  ...rest
}: DataTableProps<TData>) {
  return (
    <DataTableProvider
      data={data}
      loading={loading}
      searchKey={searchKey}
      pagination={pagination}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      totalCount={totalCount}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onSelectionChange={onSelectionChange}
      getRowId={getRowId}
    >
      <DataTableInner data={data} {...rest} />
    </DataTableProvider>
  );
}

// Export memoized version
export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
