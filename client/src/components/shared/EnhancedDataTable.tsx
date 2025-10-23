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
import { ArrowUpDown, Search, Filter, ChevronLeft, ChevronRight, Download, Plus, Loader2, X, Clock, Eye, Edit, Trash2, Shield, MoreHorizontal } from 'lucide-react';
import { LoadingStates } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as ExcelJS from 'exceljs';

import { cn } from '@/lib/utils';


interface FilterOption {
  value: string;
  label: string;
}

/**
 * Action button configuration for individual buttons
 * @example
 * {
 *   id: 'custom-action',
 *   label: 'Custom Action',
 *   icon: CustomIcon,
 *   variant: 'outline',
 *   onClick: (row) => handleCustomAction(row)
 * }
 */
interface ActionButton<TData = any> {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick: (row: TData) => void;
  show?: (row: TData) => boolean;
}

/**
 * Action button group for predefined button types
 * @example
 * {
 *   type: 'view',
 *   onClick: (row) => handleView(row)
 * }
 */
interface ActionButtonGroup<TData = any> {
  type: 'view' | 'edit' | 'delete' | 'custom';
  onClick: (row: TData) => void;
  show?: (row: TData) => boolean;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  className?: string;
}

interface EnhancedDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
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
  customGlobalFilterFn?: (row: any, columnId: string, value: string) => boolean;
  // Action buttons
  actionButtons?: ActionButton<TData>[];
  actionButtonGroups?: ActionButtonGroup<TData>[];
  showActions?: boolean;
  actionColumnHeader?: string;
  showActionLabels?: boolean;
}

function EnhancedDataTableComponent<TData>({
  data,
  columns,
  title,
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
  customGlobalFilterFn,
  actionButtons = [],
  actionButtonGroups = [],
  showActions = false,
  actionColumnHeader = "Actions",
  showActionLabels = true,
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

  // Generate action column if actions are enabled
  const generateActionColumn = useCallback((): ColumnDef<TData> | null => {
    if (!showActions || (actionButtons.length === 0 && actionButtonGroups.length === 0)) {
      return null;
    }

    return {
      id: "actions",
      header: actionColumnHeader,
      cell: ({ row }) => {
        const allButtons: ActionButton[] = [];

        // Add individual action buttons
        actionButtons.forEach(button => {
          if (!button.show || button.show(row.original)) {
            allButtons.push(button);
          }
        });

        // Add action button groups
        actionButtonGroups.forEach(group => {
          if (!group.show || group.show(row.original)) {
            const button: ActionButton = {
              id: group.type,
              label: group.label || group.type.charAt(0).toUpperCase() + group.type.slice(1),
              icon: group.icon || getDefaultIcon(group.type),
              variant: group.variant || getDefaultVariant(group.type),
              size: "sm",
              className: group.className || getDefaultClassName(group.type),
              onClick: group.onClick
            };
            allButtons.push(button);
          }
        });

        if (allButtons.length === 0) return null;

       return (
         <div className="flex items-center">
           {allButtons.map((button, index) => {
             const Icon = button.icon;
             return (
               <Button
                 key={`${button.id}-${index}`}
                 variant="ghost"
                 size="sm"
                 onClick={() => button.onClick(row.original)}
                 className={cn(
                   showActionLabels 
                     ? "h-5 px-1 py-0.5 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm"
                     : "h-5 w-5 p-0 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm",
                   index > 0 && "ml-0.5",
                   button.className
                 )}
                 title={button.label}
               >
                 <Icon className="h-3 w-3" />
                 {showActionLabels && (
                   <span className="ml-0.5 text-xs font-medium">
                     {button.label}
                   </span>
                 )}
               </Button>
             );
           })}
         </div>
       );
      },
    };
  }, [showActions, actionButtons, actionButtonGroups, actionColumnHeader, showActionLabels]);

  // Helper functions for default styling
  const getDefaultIcon = (type: string) => {
    switch (type) {
      case 'view': return Eye;
      case 'edit': return Edit;
      case 'delete': return Trash2;
      default: return MoreHorizontal;
    }
  };

  const getDefaultVariant = (type: string): "default" | "destructive" | "outline" | "secondary" | "ghost" => {
    switch (type) {
      case 'delete': return "ghost";
      case 'edit': return "ghost";
      case 'view': return "ghost";
      default: return "ghost";
    }
  };

  const getDefaultClassName = (type: string) => {
    switch (type) {
      case 'view': return "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20";
      case 'edit': return "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20";
      case 'delete': return "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20";
      default: return "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800";
    }
  };

  // Memoize expensive computations
  const memoizedColumns = useMemo(() => {
    const actionColumn = generateActionColumn();
    return actionColumn ? [...columns, actionColumn] : columns;
  }, [columns, generateActionColumn]);

  const memoizedFilteredData = useMemo(() => {
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
    data: memoizedFilteredData,
    columns: memoizedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: customGlobalFilterFn || ((row, columnId, value) => {
      if (!value) return true;
      if (searchKey) {
        const cellValue = (row.original as any)[searchKey];
        return cellValue?.toString().toLowerCase().includes(value.toLowerCase()) ?? false;
      }
      return row.getValue(columnId)?.toString().toLowerCase().includes(value.toLowerCase()) ?? false;
    }),
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
  }, [onExport, memoizedFilteredData, columns, title]);

  const performExport = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(title || 'Data Export');

      // Set up professional worksheet properties
      worksheet.properties.defaultRowHeight = 22;
      worksheet.properties.defaultColWidth = 15;

      // Add title row with enhanced corporate styling
      if (title) {
        const titleRow = worksheet.addRow([title]);
        titleRow.font = { 
          bold: true, 
          size: 18, 
          color: { argb: 'FF1A252F' },
          name: 'Segoe UI'
        };
        titleRow.height = 40;
        titleRow.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true
        };
        titleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
        titleRow.border = {
          top: { style: 'thick', color: { argb: 'FF2C3E50' } },
          bottom: { style: 'thick', color: { argb: 'FF2C3E50' } },
          left: { style: 'thick', color: { argb: 'FF2C3E50' } },
          right: { style: 'thick', color: { argb: 'FF2C3E50' } }
        };
        worksheet.addRow([]); // Empty row
      }

      // Add export metadata with enhanced styling
      const exportDate = new Date().toLocaleString();
      const metadataRow = worksheet.addRow([`Generated on: ${exportDate}`]);
      metadataRow.font = { 
        size: 11, 
        color: { argb: 'FF6C757D' },
        italic: true,
        name: 'Segoe UI'
      };
      metadataRow.height = 20;
      metadataRow.alignment = { horizontal: 'right', vertical: 'middle' };
      metadataRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F3F4' }
      };
      worksheet.addRow([]); // Empty row

      // Filter out action columns (columns without accessorKey or with id containing 'action')
      const exportableColumns = columns.filter(col => {
        const hasAccessorKey = !!(col as any).accessorKey;
        const isActionColumn = col.id?.toLowerCase().includes('action') || 
                              col.id?.toLowerCase().includes('actions') ||
                              (col as any).header?.toString().toLowerCase().includes('action');
        return hasAccessorKey && !isActionColumn;
      });

      // Add headers with professional styling
      const headers = exportableColumns.map(col => {
        if (typeof col.header === 'string') return col.header;
        if (typeof col.header === 'function') return col.id;
        return (col as any).accessorKey || col.id;
      });
      
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { 
        bold: true, 
        size: 12, 
        color: { argb: 'FFFFFFFF' },
        name: 'Segoe UI'
      };
      headerRow.height = 32;
      headerRow.alignment = { 
        horizontal: 'center', 
        vertical: 'middle',
        wrapText: true
      };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1A252F' }
      };
      headerRow.border = {
        top: { style: 'medium', color: { argb: 'FF2C3E50' } },
        bottom: { style: 'medium', color: { argb: 'FF2C3E50' } },
        left: { style: 'medium', color: { argb: 'FF2C3E50' } },
        right: { style: 'medium', color: { argb: 'FF2C3E50' } }
      };

      // Add data rows with professional alternating styling
      memoizedFilteredData.forEach((row, index) => {
        const rowData = exportableColumns.map(col => {
          const key = (col as any).accessorKey;
          if (key) {
            const value = (row as any)[key];
            // Handle different data types
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return value;
          }
          return '';
        });
        
        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 24;
        dataRow.alignment = { vertical: 'middle' };
        
        // Enhanced alternating row colors
        if (index % 2 === 0) {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' }
          };
        } else {
          dataRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8F9FA' }
          };
        }
        
        // Enhanced cell styling
        dataRow.eachCell((cell, colNumber) => {
          cell.font = { 
            size: 11, 
            color: { argb: 'FF1A252F' },
            name: 'Segoe UI'
          };
          cell.alignment = { 
            vertical: 'middle',
            horizontal: 'left',
            wrapText: true
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFDEE2E6' } },
            left: { style: 'thin', color: { argb: 'FFDEE2E6' } },
            bottom: { style: 'thin', color: { argb: 'FFDEE2E6' } },
            right: { style: 'thin', color: { argb: 'FFDEE2E6' } }
          };
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        if (column && column.eachCell) {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            if (cell && cell.value) {
              const columnLength = String(cell.value).length;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            } else {
              if (10 > maxLength) {
                maxLength = 10;
              }
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        }
      });

      // Add enhanced summary footer
      const totalRows = memoizedFilteredData.length;
      const summaryRow = worksheet.addRow([`Total Records: ${totalRows}`]);
      summaryRow.font = { 
        bold: true, 
        size: 12, 
        color: { argb: 'FF1A252F' },
        name: 'Segoe UI'
      };
      summaryRow.height = 28;
      summaryRow.alignment = { horizontal: 'right', vertical: 'middle' };
      summaryRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF1F3F4' }
      };
      summaryRow.border = {
        top: { style: 'thick', color: { argb: 'FF2C3E50' } },
        bottom: { style: 'thick', color: { argb: 'FF2C3E50' } },
        left: { style: 'thick', color: { argb: 'FF2C3E50' } },
        right: { style: 'thick', color: { argb: 'FF2C3E50' } }
      };

      // Add freeze panes for better navigation
      if (title) {
        worksheet.views = [{ state: 'frozen', ySplit: 4 }]; // Freeze title, metadata, and header rows
      } else {
        worksheet.views = [{ state: 'frozen', ySplit: 2 }]; // Freeze metadata and header rows
      }

      // Set professional page setup
      worksheet.pageSetup = {
        orientation: 'landscape',
        paperSize: 9, // A4
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3
        }
      };

      // Add print titles
      worksheet.pageSetup.printTitlesRow = '1:3'; // Repeat first 3 rows on each page

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'data'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      // Fallback to CSV if Excel export fails
    const csvContent = [
      columns.map(col => (col as any).header || (col as any).accessorKey).join(','),
      ...memoizedFilteredData.map(row => 
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
    }
  }, [memoizedFilteredData, columns, title]);


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
      className={cn('space-y-4 w-full', className)}
    >
       {/* Header */}
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full">
           <div className="space-y-1">
             {title && (
               <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
                 {title}
               </h2>
             )}
           </div>
           {showSearch && (
             <div className="relative group flex-1 w-full sm:w-auto sm:mr-8">
               {/* Search Container */}
               <div className="relative bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-200 focus-within:border-blue-500 dark:focus-within:border-blue-400">
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
                     aria-label="Search table data"
                     aria-describedby="search-results-count"
                     role="searchbox"
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
                   <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                     {table.getFilteredRowModel().rows.length}
                   </div>
                 )}
                 {/* Hidden element for screen readers */}
                 <div id="search-results-count" className="sr-only">
                   {globalFilter ? `${table.getFilteredRowModel().rows.length} results found` : ''}
                 </div>
               </div>
               
               {/* Search Suggestions Dropdown */}
               {showSuggestions && (searchSuggestions.length > 0 || searchHistory.length > 0) && !globalFilter && (
                 <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg z-50 overflow-hidden">
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
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
           {exportable && (
             <Button
               variant="outline"
               size="sm"
               onClick={handleExport}
               disabled={isExporting}
               className=""
             >
               {isExporting ? (
                 <Loader2 className="h-4 w-4 mr-2 animate-spin" />
               ) : (
                 <Download className="h-4 w-4 mr-2" />
               )}
                 {isExporting ? 'Exporting...' : 'Export Excel'}
             </Button>
           )}
           {onAdd && (
             <Button 
               onClick={onAdd} 
               variant={addButtonVariant}
               size="sm"
               className=""
             >
               <Plus className="h-4 w-4 mr-2" />
               {addButtonText}
             </Button>
           )}
         </div>
       </div>

       {/* Additional Filters */}
       {filters.length > 0 && (
         <div className="flex items-center gap-4 p-4">
           <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Filters:</div>
           {filters.map((filter) => (
             <Select
               key={filter.key}
               value={filter.value}
               onValueChange={filter.onChange}
             >
               <SelectTrigger className="w-48 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                 <SelectValue placeholder={filter.label} />
               </SelectTrigger>
               <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600">
                 <SelectItem key="all" value="all" className="hover:bg-slate-100 dark:hover:bg-slate-700">All {filter.label}</SelectItem>
                 {filter.options
                   .filter(option => option.value && option.value.trim() !== '') // Filter out empty values
                   .map((option) => (
                     <SelectItem key={option.value} value={option.value} className="hover:bg-slate-100 dark:hover:bg-slate-700">
                       {option.label}
                     </SelectItem>
                   ))}
               </SelectContent>
             </Select>
           ))}
         </div>
       )}

       {/* Table */}
         <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
           <div className="overflow-x-auto" role="region" aria-label="Data table">
             <Table className="w-full" role="table">
             <TableHeader className="bg-slate-50 dark:bg-slate-800">
               {table.getHeaderGroups().map((headerGroup) => (
                 <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200 dark:border-slate-700">
                   {headerGroup.headers.map((header) => (
                     <TableHead
                       key={header.id}
                       className={cn(
                         'sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 py-4 text-left',
                         header.column.getCanSort() && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200',
                         header.index === 0 ? 'pl-6 pr-3' : 'px-3'
                       )}
                       onClick={header.column.getToggleSortingHandler()}
                       style={{ 
                         minWidth: '120px', 
                         maxWidth: '500px',
                         width: header.column.getSize() > 0 ? `${header.column.getSize()}px` : 'auto'
                       }}
                       data-testid={`header-${header.id}`}
                       aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : 'none'}
                       tabIndex={header.column.getCanSort() ? 0 : -1}
                       onKeyDown={(e) => {
                         if (header.column.getCanSort() && (e.key === 'Enter' || e.key === ' ')) {
                           e.preventDefault();
                           header.column.getToggleSortingHandler()?.(e);
                         }
                       }}
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
                       <TableCell key={cell.id} className={cn(
                         "py-4 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200",
                         cell.column.getIndex() === 0 ? 'pl-6 pr-3' : 'px-3'
                       )}>
                        <div className={cn(
                          "max-w-[400px]",
                          // Only truncate if the cell content is text-based
                          (() => {
                            const value = cell.getValue();
                            return typeof value === 'string' && value && value.length > 50 ? "truncate" : "break-words";
                          })()
                        )}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </TableCell>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 text-center bg-white dark:bg-slate-900">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <Filter className="h-10 w-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                        No results found
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">
                        Try adjusting your search criteria or filters to find what you're looking for
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
           </div>
        </div>

       {/* Pagination */}
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
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
           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
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