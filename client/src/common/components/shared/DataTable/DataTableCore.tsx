// DataTable V2 - Core Table Component
// Clean, focused table rendering with TanStack Table

import { memo, useMemo, useCallback, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState as TanStackSortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Checkbox } from "@/common/components/ui/checkbox";
import { Skeleton } from "@/common/components/ui/skeleton";
import { useDataTableContext } from "./DataTableProvider";
import type { ActionConfig } from "./types";
import { cn } from "@/common/utils";
import { Button } from "@/common/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/common/components/ui/tooltip";

interface DataTableCoreProps<TData> {
  columns: ColumnDef<TData>[];
  className?: string;
  
  // Actions column
  actions?: ActionConfig<TData>[];
  actionsHeader?: string;
  
  // Selection
  selectable?: boolean;
  
  // Virtualization
  enableVirtualization?: boolean;
  virtualThreshold?: number;
  rowHeight?: number;
  
  // Empty state
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

function DataTableCoreComponent<TData>({
  columns,
  className,
  actions = [],
  actionsHeader = "Actions",
  selectable = false,
  enableVirtualization = true,
  virtualThreshold = 100,
  rowHeight = 52,
  emptyMessage = "No results found.",
}: DataTableCoreProps<TData>) {
  const {
    paginatedData,
    loading,
    sorting,
    setSorting,
    selectedRows,
    setSelectedRows,
    config,
  } = useDataTableContext<TData>();
  const { getRowId } = config;

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Build columns with optional selection and actions
  const tableColumns = useMemo(() => {
    const cols: ColumnDef<TData>[] = [];

    // Selection column
    if (selectable) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        size: 40,
      });
    }

    // Data columns
    cols.push(...columns);

    // Actions column
    if (actions.length > 0) {
      cols.push({
        id: "actions",
        header: actionsHeader,
        cell: ({ row }) => {
          const visibleActions = actions.filter(
            (action) => !action.show || action.show(row.original)
          );

          if (visibleActions.length === 0) return null;

          return (
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-1">
                {visibleActions.map((action) => {
                  const Icon = action.icon;
                  const isDisabled = action.disabled?.(row.original) ?? false;
                  const showLabel = action.showLabel ?? false;

                  const button = (
                    <Button
                      variant={showLabel ? "outline" : (action.variant || "ghost")}
                      size="sm"
                      onClick={() => !isDisabled && action.onClick(row.original)}
                      disabled={isDisabled}
                      className={cn(
                        "h-8",
                        showLabel 
                          ? "px-3 gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-700" 
                          : "px-2"
                      )}
                      aria-label={action.label}
                    >
                      <Icon className={cn("h-4 w-4", showLabel && "text-blue-600")} />
                      {showLabel ? (
                        <span className="text-sm font-medium">{action.label}</span>
                      ) : (
                        <span className="sr-only">{action.label}</span>
                      )}
                    </Button>
                  );

                  return (
                    <div key={action.id}>
                      {showLabel ? (
                        button
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>{button}</div>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            {action.label}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>
            </TooltipProvider>
          );
        },
        enableSorting: false,
        size: actions.length * 40 + 16,
      });
    }

    return cols;
  }, [columns, selectable, actions, actionsHeader]);

  // TanStack Table instance
  const table = useReactTable({
    data: paginatedData,
    columns: tableColumns,
    getRowId: (row) => getRowId ? String(getRowId(row)) : undefined as any,
    state: {
      sorting: sorting as TanStackSortingState,
      rowSelection: selectedRows.reduce((acc, row) => {
        const id = getRowId ? String(getRowId(row)) : undefined;
        if (id !== undefined) acc[id] = true;
        return acc;
      }, {} as Record<string, boolean>),
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" 
        ? updater(sorting as TanStackSortingState) 
        : updater;
      setSorting(newSorting.map(s => ({ id: s.id, desc: s.desc })));
    },
    onRowSelectionChange: (updater) => {
      const currentSelection = selectedRows.reduce((acc, row) => {
        const id = getRowId ? String(getRowId(row)) : undefined;
        if (id !== undefined) acc[id] = true;
        return acc;
      }, {} as Record<string, boolean>);

      const newSelection = typeof updater === "function"
        ? (updater as any)(currentSelection)
        : updater;
        
      const selectedIds = Object.keys(newSelection).filter(k => newSelection[k]);
      
      // Map selected IDs back to data objects
      const newSelectedRows = selectedIds.map(id => 
        paginatedData.find(item => {
          const itemId = getRowId ? String(getRowId(item)) : undefined;
          return itemId === id;
        })
      ).filter((item): item is TData => !!item);
      
      setSelectedRows(newSelectedRows);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // We handle pagination in the provider
  });

  const { rows } = table.getRowModel();

  // Virtualization
  const shouldVirtualize = enableVirtualization && rows.length > virtualThreshold;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
    enabled: shouldVirtualize,
  });

  // Render loading skeleton
  const renderLoadingSkeleton = useCallback(() => (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={`skeleton-${i}`}>
          {tableColumns.map((_, j) => (
            <TableCell key={`skeleton-${i}-${j}`}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  ), [tableColumns]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <TableRow>
      <TableCell
        colSpan={tableColumns.length}
        className="h-32 text-center text-muted-foreground"
      >
        {emptyMessage}
      </TableCell>
    </TableRow>
  ), [tableColumns.length, emptyMessage]);

  // Render table rows (virtualized or regular)
  const renderRows = useCallback(() => {
    // Show skeleton only on initial load (loading && no data)
    if (loading && rows.length === 0) return renderLoadingSkeleton();
    
    // Show empty state only if not loading and no data
    if (!loading && rows.length === 0) return renderEmptyState();
    
    // If we have no rows and we're not loading (shouldn't happen often with renderEmptyState above)
    if (rows.length === 0) return renderEmptyState();

    if (shouldVirtualize) {
      const virtualRows = rowVirtualizer.getVirtualItems();
      const totalSize = rowVirtualizer.getTotalSize();

      return (
        <>
          {/* Top padding */}
          {virtualRows[0]?.start > 0 && (
            <tr>
              <td colSpan={tableColumns.length} style={{ height: virtualRows[0].start }} />
            </tr>
          )}

          {/* Virtual rows */}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-[52px] animate-row-entry row-hover-effect"
                style={{
                  animationDelay: `${virtualRow.index * 30}ms`,
                  opacity: 0, // Controlled by animation forwards
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* Bottom padding */}
          {virtualRows[virtualRows.length - 1]?.end < totalSize && (
            <tr>
              <td
                colSpan={tableColumns.length}
                style={{ height: totalSize - virtualRows[virtualRows.length - 1].end }}
              />
            </tr>
          )}
        </>
      );
    }

    // Regular rows
    return rows.map((row, index) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className="animate-row-entry row-hover-effect"
        style={{
          animationDelay: `${index * 30}ms`,
          opacity: 0, // Controlled by animation forwards
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [
    loading,
    rows,
    shouldVirtualize,
    rowVirtualizer,
    tableColumns.length,
    renderLoadingSkeleton,
    renderEmptyState,
  ]);

  // Render sort indicator
  const renderSortIndicator = (columnId: string, canSort: boolean) => {
    if (!canSort) return null;

    const sortState = sorting.find((s) => s.id === columnId);

    if (!sortState) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }

    return sortState.desc ? (
      <ArrowDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUp className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div
      ref={tableContainerRef}
      className={cn(
        "rounded-md border overflow-auto",
        shouldVirtualize && "max-h-[600px]",
        className
      )}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  className={cn(
                    header.column.getCanSort() && "cursor-pointer select-none hover:bg-muted/80"
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {renderSortIndicator(header.column.id, header.column.getCanSort())}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
          
          {/* Progress bar for background loading */}
          {loading && rows.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden">
              <div className="h-full bg-primary animate-progress-indeterminate w-full origin-left" />
            </div>
          )}
        </TableHeader>
        <TableBody className={cn(loading && rows.length > 0 && "opacity-50 transition-opacity duration-200")}>
          {renderRows()}
        </TableBody>
      </Table>
    </div>
  );
}

export const DataTableCore = memo(DataTableCoreComponent) as typeof DataTableCoreComponent;
