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
import { ArrowUpDown, Search, Filter, ChevronLeft, ChevronRight, Download, Plus, Loader2, X, Clock } from 'lucide-react';
import { LoadingStates } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTableState } from '@/lib/hooks/common/useTableState';

interface FilterOption {
  value: string;
  label: string;
}

interface EnhancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  description?: string;
  searchKey?: keyof TData;
  searchPlaceholder?: string;
  selectable?: boolean;
  className?: string;
  // Export functionality
  exportable?: boolean;
  onExport?: () => void;
  // Add functionality
  onAdd?: () => void;
  addButtonText?: string;
  addButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  // Additional filters
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  // Performance props
  enableVirtualization?: boolean;
  virtualThreshold?: number;
  loading?: boolean;
  // Search options
  showSearch?: boolean;
  enableDebounce?: boolean;
  debounceDelay?: number;
  highlightSearchResults?: boolean;
  searchSuggestions?: string[];
}

function EnhancedDataTableComponent<TData>({
  data,
  columns,
  title,
  description,
  searchKey,
  searchPlaceholder = "Search...",
  selectable = false,
  className,
  exportable = false,
  onExport,
  onAdd,
  addButtonText = "Add New",
  addButtonVariant = "default",
  filters = [],
  enableVirtualization = false,
  virtualThreshold = 100,
  loading = false,
  showSearch = true,
  enableDebounce = true,
  debounceDelay = 300,
  highlightSearchResults = true,
  searchSuggestions = [],
}: EnhancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounced search functionality
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] = useState(globalFilter);
  const [isExporting, setIsExporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounce search term for better performance
  useEffect(() => {
    if (!enableDebounce) {
      setDebouncedGlobalFilter(globalFilter);
      setIsSearching(false);
      return;
    }

    if (globalFilter) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedGlobalFilter(globalFilter);
      setIsSearching(false);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [globalFilter, enableDebounce, debounceDelay]);

  // Clear search function
  const clearSearch = useCallback(() => {
    setGlobalFilter('');
    setShowSuggestions(false);
    setIsSearching(false);
  }, []);

  // Clear search history function
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((searchTerm: string) => {
    if (searchTerm) {
      setSearchHistory(prev => {
        if (!prev.includes(searchTerm)) {
          return [searchTerm, ...prev.slice(0, 4)]; // Keep last 5 searches
        }
        return prev;
      });
    }
  }, []);

  // Handle search with history
  const handleSearch = useCallback((value: string) => {
    setGlobalFilter(value);
    if (value.trim()) {
      addToSearchHistory(value.trim());
    }
  }, [addToSearchHistory]);

  // Highlight search terms in text
  const highlightText = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm || !highlightSearchResults) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
  }, [highlightSearchResults]);

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector('[data-testid="input-search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      if (e.key === 'Escape' && globalFilter) {
        clearSearch();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        clearSearchHistory();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [globalFilter, clearSearch, clearSearchHistory]);

  // Reset to first page when data changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, [data]);

  // Apply additional filters (non-search filters)
  const filteredData = useMemo(() => {
    let result = data;

    // Apply additional filters
    filters.forEach((filter) => {
      if (filter.value && filter.value !== 'all') {
        result = result.filter((item) => {
          const value = (item as any)[filter.key];
          return value === filter.value;
        });
      }
    });

    return result;
  }, [data, filters]);

  const table = useReactTable({
    data: filteredData,
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
    globalFilterFn: (row, columnId, value) => {
      if (!value) return true;
      if (searchKey) {
        const cellValue = (row.original as any)[searchKey];
        return cellValue?.toString().toLowerCase().includes(value.toLowerCase()) ?? false;
      }
      return row.getValue(columnId)?.toString().toLowerCase().includes(value.toLowerCase()) ?? false;
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter: enableDebounce ? debouncedGlobalFilter : globalFilter,
      pagination,
    },
  });


  const truncateText = useCallback((text: string, maxLength: number = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Export functionality
  const handleExport = useCallback(async () => {
    if (onExport) {
      onExport();
      return;
    }

    setIsExporting(true);
    
    try {
      // Use requestIdleCallback for non-blocking export
      await new Promise<void>((resolve) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            performExport();
            resolve();
          });
        } else {
          setTimeout(() => {
            performExport();
            resolve();
          }, 0);
        }
      });
    } finally {
      setIsExporting(false);
    }
  }, [onExport, filteredData, columns, title]);

  const performExport = useCallback(() => {
    const csvContent = [
      columns.map(col => (col as any).header || (col as any).accessorKey).join(','),
      ...filteredData.map(row => 
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
  }, [filteredData, columns, title]);


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
             {description && (
               <p className="text-sm text-muted-foreground">{description}</p>
             )}
           </div>
           {showSearch && (
             <div className="relative group w-full max-w-md">
               {/* Search Container with Compact Design */}
               <div className="relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:shadow-md focus-within:shadow-blue-500/10">
                 <div className="flex items-center px-3 py-2">
                   {/* Search Icon */}
                   <div className="flex-shrink-0 mr-2">
                     {isSearching ? (
                       <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                     ) : (
                       <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                     )}
                   </div>
                   
                   {/* Search Input */}
                   <input
                     type="text"
                     placeholder={searchPlaceholder}
                     value={globalFilter ?? ''}
                     onChange={(e) => handleSearch(e.target.value)}
                     onFocus={() => setShowSuggestions(true)}
                     onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                     className="flex-1 bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-normal"
                     data-testid="input-search"
                   />
                   
                   {/* Clear Button */}
                   {globalFilter && (
                     <button
                       onClick={clearSearch}
                       className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200 group"
                       data-testid="button-clear-search"
                     >
                       <X className="h-3 w-3 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                     </button>
                   )}
                 </div>
                 
                 {/* Search Results Badge */}
                 {globalFilter && (
                   <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-md">
                     {table.getFilteredRowModel().rows.length}
                   </div>
                 )}
               </div>
               
               {/* Search Suggestions Dropdown */}
               {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && !globalFilter && (
                 <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                   <div className="p-1.5">
                     {/* Search History */}
                     {searchHistory.length > 0 && (
                       <>
                         <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center justify-between">
                           <div className="flex items-center space-x-1">
                             <Clock className="h-3 w-3" />
                             <span>Recent searches:</span>
                           </div>
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               clearSearchHistory();
                             }}
                             className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                             title="Clear search history"
                           >
                             Clear
                           </button>
                         </div>
                         <div className="space-y-0.5 mb-2">
                           {searchHistory.slice(0, 3).map((term, index) => (
                             <button
                               key={`history-${index}`}
                               onClick={() => {
                                 setGlobalFilter(term);
                                 setShowSuggestions(false);
                               }}
                               className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200 flex items-center space-x-2"
                             >
                               <Clock className="h-3 w-3 text-slate-400" />
                               <span>{term}</span>
                             </button>
                           ))}
                         </div>
                       </>
                     )}
                     
                     {/* Quick Search Suggestions */}
                     {searchSuggestions.length > 0 && (
                       <>
                         <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center space-x-1">
                           <Search className="h-3 w-3" />
                           <span>Quick searches:</span>
                         </div>
                         <div className="space-y-0.5">
                           {searchSuggestions.slice(0, 5).map((suggestion, index) => (
                             <button
                               key={`suggestion-${index}`}
                               onClick={() => {
                                 setGlobalFilter(suggestion);
                                 setShowSuggestions(false);
                               }}
                               className="w-full text-left px-2 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200 flex items-center space-x-2"
                             >
                               <Search className="h-3 w-3 text-slate-400" />
                               <span>{suggestion}</span>
                             </button>
                           ))}
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               )}
               
               {/* Search Status */}
               {globalFilter && (
                 <div className="mt-1 flex items-center justify-between">
                   <div className="flex items-center space-x-1">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-xs text-slate-600 dark:text-slate-400">
                       {table.getFilteredRowModel().rows.length} result{table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} found
                     </span>
                   </div>
                   <div className="text-xs text-slate-500 dark:text-slate-500">
                     <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Esc</kbd> to clear
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
         <div className="flex items-center gap-2">
           {exportable && (
             <Button
               variant="outline"
               size="sm"
               onClick={handleExport}
               disabled={isExporting}
               className="hover-elevate"
             >
               {isExporting ? (
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
               ) : (
                 <Download className="h-4 w-4 mr-2" />
               )}
               {isExporting ? 'Exporting...' : 'Export'}
             </Button>
           )}
           {onAdd && (
             <Button 
               onClick={onAdd} 
               variant={addButtonVariant}
               size="sm"
               className="hover-elevate"
             >
               <Plus className="h-4 w-4 mr-2" />
               {addButtonText}
             </Button>
           )}
         </div>
       </div>

       {/* Additional Filters */}
       {filters.length > 0 && (
         <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
           {filters.map((filter) => (
             <Select
               key={filter.key}
               value={filter.value}
               onValueChange={filter.onChange}
             >
               <SelectTrigger className="w-40">
                 <SelectValue placeholder={filter.label} />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem key="all" value="all">All {filter.label}</SelectItem>
                 {filter.options.map((option) => (
                   <SelectItem key={option.value} value={option.value}>
                     {option.label}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           ))}
         </div>
       )}

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
           <div className="flex items-center space-x-3">
             <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
               {globalFilter ? (
                 <div className="flex items-center space-x-2">
                   <span>Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                   {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
                   {table.getFilteredRowModel().rows.length} results</span>
                   <div className="flex items-center space-x-1">
                     <span className="text-slate-400">for</span>
                     <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">
                       "{globalFilter}"
                     </span>
                   </div>
                 </div>
               ) : (
                 <span>
                   Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                   {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
                   {table.getFilteredRowModel().rows.length} entries
                 </span>
               )}
             </div>
             {globalFilter && (
               <div className="flex items-center space-x-3">
                 <button
                   onClick={clearSearch}
                   className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline transition-colors duration-200"
                 >
                   Clear search
                 </button>
                 {searchHistory.length > 0 && (
                   <button
                     onClick={clearSearchHistory}
                     className="text-xs text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                     title="Clear search history (Ctrl+Shift+H)"
                   >
                     Clear history
                   </button>
                 )}
               </div>
             )}
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