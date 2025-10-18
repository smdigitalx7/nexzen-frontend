import React, { useMemo, memo, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnhancedDataTable } from './EnhancedDataTable';
import { useTableState } from '@/lib/hooks/common/useTableState';
import { TABLE_CONFIG } from '@/lib/constants/ui';
import type { ColumnDef } from '@tanstack/react-table';

interface FilterOption {
  value: string;
  label: string;
}

interface DataTableWithFiltersProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  description?: string;
  searchKey?: keyof TData;
  exportable?: boolean;
  onAdd?: () => void;
  onExport?: () => void;
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  className?: string;
  sortable?: boolean;
  pagination?: {
    pageSize?: number;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  loading?: boolean;
  showSearch?: boolean;
  // New performance props
  enableVirtualization?: boolean;
  virtualThreshold?: number;
  enableDebounce?: boolean;
  debounceDelay?: number;
}

export const DataTableWithFilters = memo(<TData,>({
  data,
  columns,
  title,
  description,
  searchKey,
  exportable = false,
  onAdd,
  onExport,
  filters = [],
  className,
  sortable = true,
  pagination = { pageSize: 10, showSizeChanger: true, showQuickJumper: true },
  loading = false,
  showSearch = true,
  // New performance props with defaults
  enableVirtualization = true,
  virtualThreshold = 100,
  enableDebounce = true,
  debounceDelay = 300,
}: DataTableWithFiltersProps<TData>) => {
  const {
    searchTerm,
    setSearchTerm,
    hasActiveFilters,
    resetFilters,
  } = useTableState();

  // Performance optimizations
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search term for better performance
  useEffect(() => {
    if (!enableDebounce) {
      setDebouncedSearchTerm(searchTerm);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, enableDebounce, debounceDelay]);

  // Optimized filtering with memoization
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter with debounced term
    const searchValue = enableDebounce ? debouncedSearchTerm : searchTerm;
    if (searchValue && searchKey) {
      result = result.filter((item) => {
        const value = (item as any)[searchKey];
        return value?.toString().toLowerCase().includes(searchValue.toLowerCase());
      });
    }

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
  }, [data, debouncedSearchTerm, searchTerm, searchKey, filters, enableDebounce]);

  // Determine if virtualization should be used
  const shouldUseVirtualization = useMemo(() => {
    return enableVirtualization && filteredData.length > virtualThreshold;
  }, [enableVirtualization, filteredData.length, virtualThreshold]);

  // Optimized export with loading state
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-4 ${className || ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
            <Button onClick={onAdd} className="hover-elevate">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Additional Filters */}
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

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <Badge variant="secondary" className="cursor-pointer" onClick={resetFilters}>
              <Filter className="h-3 w-3 mr-1" />
              Clear Filters
            </Badge>
          )}
        </div>
      </div>

      {/* Table */}
      <EnhancedDataTable
        data={filteredData}
        columns={columns}
        searchKey={searchKey}
        exportable={exportable}
        enableVirtualization={shouldUseVirtualization}
        virtualThreshold={virtualThreshold}
        loading={loading}
      />
    </motion.div>
  );
});
