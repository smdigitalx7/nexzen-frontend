// DataTable V2 - useDataTable Hook
// Simplified hook for common DataTable usage patterns

import { useState, useMemo, useCallback } from "react";
import type { FilterState, PaginationState } from "../components/shared/DataTable/types";

interface UseDataTableOptions<TData> {
  data: TData[];
  searchKey?: keyof TData;
  initialPageSize?: number;
  initialFilters?: FilterState;
}

interface UseDataTableReturn<TData> {
  // Data
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
  totalPages: number;
  totalCount: number;
  currentPage: number;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Selection
  selectedRows: TData[];
  setSelectedRows: (rows: TData[]) => void;
  clearSelection: () => void;
}

/**
 * Hook for managing DataTable state outside of the component
 * Useful when you need programmatic control over the table
 */
export function useDataTable<TData>({
  data,
  searchKey,
  initialPageSize = 10,
  initialFilters = {},
}: UseDataTableOptions<TData>): UseDataTableReturn<TData> {

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [selectedRows, setSelectedRows] = useState<TData[]>([]);

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchKey) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) => {
        const value = (item as Record<string, unknown>)[searchKey as string];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(lowerSearch);
      });
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = (item as Record<string, unknown>)[key];
          return String(itemValue) === value;
        });
      }
    });

    return result;
  }, [data, searchTerm, searchKey, filters]);

  // Pagination calculations
  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);
  const currentPage = pagination.pageIndex + 1;

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination]);

  // Filter actions
  const setFilter = useCallback((key: string, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" || Object.values(filters).some(
      (v) => v !== null && v !== undefined && v !== "" && v !== "all"
    );
  }, [searchTerm, filters]);

  // Pagination actions
  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination({ pageIndex: 0, pageSize: size });
  }, []);

  // Selection actions
  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  // Handle search with pagination reset
  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  return {
    filteredData,
    paginatedData,
    searchTerm,
    setSearchTerm: handleSetSearchTerm,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    pagination,
    totalPages,
    totalCount,
    currentPage,
    goToPage,
    setPageSize,
    selectedRows,
    setSelectedRows,
    clearSelection,
  };
}
