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
import { ArrowUpDown, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingStates } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  selectable?: boolean;
  className?: string;
  // New performance props
  enableVirtualization?: boolean;
  virtualThreshold?: number;
  loading?: boolean;
}

function EnhancedDataTableComponent<TData>({
  data,
  columns,
  title,
  searchKey,
  searchPlaceholder = "Search...",
  selectable = false,
  className,
  enableVirtualization = false,
  virtualThreshold = 100,
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


  const truncateText = useCallback((text: string, maxLength: number = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);


  // Loading state
  if (loading) {
    return (
      <div className="py-8">
        <LoadingStates.Data message="Loading data..." />
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
       <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
         <div className="flex items-center gap-6">
           <div className="space-y-1">
             {title && (
               <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                 {title}
               </h2>
             )}
           </div>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 dark:text-slate-300 h-4 w-4 z-10 pointer-events-none" />
             <Input
               placeholder={searchPlaceholder}
               value={globalFilter ?? ''}
               onChange={(e) => setGlobalFilter(e.target.value)}
               className="pl-10 w-80 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-slate-400 dark:hover:border-slate-500"
               data-testid="input-search"
             />
           </div>
         </div>
         <div className="flex items-center gap-2">
         </div>
       </div>

       {/* Table */}
         <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg bg-white dark:bg-slate-900">
           <Table>
             <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
               {table.getHeaderGroups().map((headerGroup) => (
                 <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200 dark:border-slate-700">
                   {headerGroup.headers.map((header) => (
                     <TableHead
                       key={header.id}
                       className={cn(
                         'sticky top-0 z-10 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 font-bold text-slate-700 dark:text-slate-300 py-4 px-6',
                         header.column.getCanSort() && 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200'
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
                             className="text-slate-500 dark:text-slate-400"
                           >
                             <ArrowUpDown className="h-4 w-4" />
                           </motion.div>
                         )}
                       </div>
                     </TableHead>
                   ))}
                 </TableRow>
               ))}
             </TableHeader>
            <TableBody className="bg-white dark:bg-slate-900">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 group"
                    data-state={row.getIsSelected() && 'selected'}
                    data-testid={`row-${row.id}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="truncate max-w-[200px] py-4 px-6 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center bg-slate-50 dark:bg-slate-800">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <Filter className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 font-medium">
                        No results found
                      </div>
                      <div className="text-sm text-slate-400 dark:text-slate-500">
                        Try adjusting your filters or search criteria
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

       {/* Pagination */}
         <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
           <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
             Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
             {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
             {table.getFilteredRowModel().rows.length} entries
           </div>
           <div className="flex items-center gap-3">
             <Button
               variant="outline"
               size="sm"
               onClick={() => table.previousPage()}
               disabled={!table.getCanPreviousPage()}
               className="hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               data-testid="button-previous-page"
             >
               <ChevronLeft className="h-4 w-4 mr-2" />
               Previous
             </Button>
             <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600">
               <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                 Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
               </span>
             </div>
             <Button
               variant="outline"
               size="sm"
               onClick={() => table.nextPage()}
               disabled={!table.getCanNextPage()}
               className="hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               data-testid="button-next-page"
             >
               Next
               <ChevronRight className="h-4 w-4 ml-2" />
             </Button>
             <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Show:</span>
               <Select 
                 value={pagination.pageSize.toString()} 
                 onValueChange={(value) => {
                   const newPageSize = Number(value);
                   setPagination(prev => ({ ...prev, pageSize: newPageSize, pageIndex: 0 }));
                 }}
               >
                 <SelectTrigger className="w-20 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600" data-testid="select-page-size">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                   <SelectItem key="10" value="10" className="hover:bg-slate-100 dark:hover:bg-slate-700">10</SelectItem>
                   <SelectItem key="25" value="25" className="hover:bg-slate-100 dark:hover:bg-slate-700">25</SelectItem>
                   <SelectItem key="50" value="50" className="hover:bg-slate-100 dark:hover:bg-slate-700">50</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
         </div>

    </motion.div>
  );
}

export const EnhancedDataTable = memo(EnhancedDataTableComponent) as typeof EnhancedDataTableComponent;