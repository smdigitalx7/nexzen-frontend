import { useState, useMemo, useEffect } from 'react';
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
import { ArrowUpDown, Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  searchKey?: keyof TData;
  exportable?: boolean;
  selectable?: boolean;
  className?: string;
}

export function EnhancedDataTable<TData>({
  data,
  columns,
  title,
  searchKey,
  exportable = false,
  selectable = false,
  className
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

  const handleExport = () => {
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
    
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

      {/* Table */}
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
              table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
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

      {/* Pagination */}
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
    </motion.div>
  );
}