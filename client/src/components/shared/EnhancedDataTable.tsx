import { useState, useMemo, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { ArrowUpDown, Search, Download, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  searchKey?: keyof TData;
  exportable?: boolean;
  selectable?: boolean;
  className?: string;
  // New performance props
  enableVirtualization?: boolean;
  virtualThreshold?: number;
  isMobile?: boolean;
  loading?: boolean;
}

function EnhancedDataTableComponent<TData>({
  data,
  columns,
  title,
  searchKey,
  exportable = false,
  selectable = false,
  className,
  enableVirtualization = false,
  virtualThreshold = 100,
  isMobile = false,
  loading = false,
}: EnhancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Reset to first page when data changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination,
    },
  });

  const handleExport = useCallback(() => {
    const csvContent = [
      columns.map(col => (col as any).header || (col as any).accessorKey).join(','),
      ...data.map(row => 
        columns.map(col => {
          const key = (col as any).accessorKey;
          return key ? (row as any)[key] : '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title || 'data'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, columns, title]);

  const truncateText = useCallback((text: string, maxLength: number = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Mobile card view component
  const MobileCardView = useCallback(() => {
    if (!isMobile) return null;

    return (
      <div className="space-y-4">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row, index) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <Card className="p-4 hover-elevate">
                <div className="space-y-3">
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    const column = cell.column.columnDef;
                    const header = typeof column.header === 'string' ? column.header : column.id;
                    const value = flexRender(column.cell, cell.getContext());
                    
                    return (
                      <div key={cell.id} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground min-w-0 flex-1">
                          {header}:
                        </span>
                        <span className="text-sm text-right min-w-0 flex-1 ml-2">
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-muted-foreground">No results found.</p>
          </div>
        )}
      </div>
    );
  }, [isMobile, table]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading data...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
          <p className="text-sm text-muted-foreground mt-1">
            {table.getFilteredRowModel().rows.length} of {data.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="hover-elevate"
              data-testid="button-export"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select 
            value={pagination.pageSize.toString()} 
            onValueChange={(value) => {
              const newPageSize = Number(value);
              setPagination(prev => ({ ...prev, pageSize: newPageSize, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-24" data-testid="select-page-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table - Mobile or Desktop */}
      {isMobile ? (
        <MobileCardView />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'sticky top-0 z-10 bg-muted/50 font-semibold',
                        header.column.getCanSort() && 'cursor-pointer hover:bg-muted/70'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ minWidth: '120px', maxWidth: '300px' }}
                      data-testid={`header-${header.id}`}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ArrowUpDown className="h-3 w-3" />
                          </motion.div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="hover:bg-muted/50 hover-elevate"
                    data-state={row.getIsSelected() && 'selected'}
                    data-testid={`row-${row.id}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="truncate max-w-[200px]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="text-muted-foreground">
                      <Filter className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      No results found.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination - Only show on desktop or when not in mobile card view */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="hover-elevate"
              data-testid="button-previous-page"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground px-2">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="hover-elevate"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile pagination */}
      {isMobile && table.getPageCount() > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="hover-elevate"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="hover-elevate"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export const EnhancedDataTable = memo(EnhancedDataTableComponent) as typeof EnhancedDataTableComponent;