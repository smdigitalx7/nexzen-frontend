// DataTable V2 - Context Provider
// Manages all table state in a centralized, composable way

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import type {
  DataTableContextValue,
  PaginationState,
  PaginationInfo,
  FilterState,
  SortingState,
} from "./types";

const DataTableContext = createContext<DataTableContextValue | null>(null);

export interface DataTableProviderProps<TData> {
  children: React.ReactNode;
  data: TData[];
  loading?: boolean;
  
  // Search
  searchKey?: keyof TData;
  
  // Pagination config
  pagination?: "client" | "server" | "none";
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Server-side pagination
  totalCount?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  
  // Selection callback
  onSelectionChange?: (rows: TData[]) => void;
  onFilterChange?: (filters: FilterState) => void;
  getRowId?: (row: TData) => string | number;
}

export function DataTableProvider<TData>({
  children,
  data,
  loading = false,
  searchKey,
  pagination = "client",
  pageSize: initialPageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  totalCount: serverTotalCount,
  currentPage: serverCurrentPage,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
  onFilterChange,
  getRowId,
}: DataTableProviderProps<TData>) {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({});
  
  // Pagination state (for client-side)
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  
  // Sorting state
  const [sorting, setSorting] = useState<SortingState[]>([]);
  
  // Selection state
  const [selectedRows, setSelectedRowsState] = useState<TData[]>([]);

  // ✅ SYNC: Keep internal paginationState in sync with props for server-side mode
  React.useEffect(() => {
    if (pagination === "server") {
      setPaginationState(prev => ({
        ...prev,
        pageIndex: (serverCurrentPage ?? 1) - 1,
        pageSize: initialPageSize
      }));
    }
  }, [pagination, serverCurrentPage, initialPageSize]);

  // Set individual filter
  const setFilter = useCallback((key: string, value: string | null) => {
    setFilters((prev) => {
      const nextFilters = { ...prev, [key]: value };
      onFilterChange?.(nextFilters);
      return nextFilters;
    });
    // Reset to first page when filter changes
    if (pagination === "client") {
      setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
    } else if (onPageChange) {
      onPageChange(1);
    }
  }, [pagination, onPageChange, onFilterChange]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    onFilterChange?.({});
    if (pagination === "client") {
      setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
    } else if (onPageChange) {
      onPageChange(1);
    }
  }, [pagination, onPageChange, onFilterChange]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== "" || Object.values(filters).some(
      (v) => v !== null && v !== undefined && v !== "" && v !== "all"
    );
  }, [searchTerm, filters]);

  // Filter data (client-side only)
  const filteredData = useMemo(() => {
    // CRITICAL: Handle null/undefined data gracefully to prevent runtime crashes
    const safeData = Array.isArray(data) ? data : [];

    if (pagination === "server") {
      // Server handles filtering
      return safeData;
    }

    let result = [...safeData];

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
  }, [data, searchTerm, searchKey, filters, pagination]);

  // Calculate pagination info
  const paginationInfo: PaginationInfo = useMemo(() => {
    if (pagination === "server") {
      const totalCount = serverTotalCount ?? 0;
      const currentPage = serverCurrentPage ?? 1;
      const pageSize = initialPageSize; // Use prop directly for server mode
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
      const endIndex = Math.min(currentPage * pageSize, totalCount);

      return {
        currentPage,
        totalPages,
        pageSize,
        totalCount,
        startIndex,
        endIndex,
      };
    }

    // Client-side pagination
    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / paginationState.pageSize);
    const currentPage = paginationState.pageIndex + 1;
    const startIndex = totalCount === 0 ? 0 : paginationState.pageIndex * paginationState.pageSize + 1;
    const endIndex = Math.min(startIndex + paginationState.pageSize - 1, totalCount);

    return {
      currentPage,
      totalPages,
      pageSize: paginationState.pageSize,
      totalCount,
      startIndex,
      endIndex,
    };
  }, [pagination, serverTotalCount, serverCurrentPage, paginationState, filteredData.length, initialPageSize]);

  // Paginate data (client-side only)
  const paginatedData = useMemo(() => {
    if (pagination === "server" || pagination === "none") {
      return filteredData;
    }

    const start = paginationState.pageIndex * paginationState.pageSize;
    const end = start + paginationState.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, paginationState, pagination]);

  // Pagination actions
  const goToPage = useCallback((page: number) => {
    if (pagination === "server" && onPageChange) {
      onPageChange(page);
    } else {
      setPaginationState((prev) => ({ ...prev, pageIndex: page - 1 }));
    }
  }, [pagination, onPageChange]);

  const nextPage = useCallback(() => {
    const { currentPage, totalPages } = paginationInfo;
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [paginationInfo, goToPage]);

  const previousPage = useCallback(() => {
    const { currentPage } = paginationInfo;
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [paginationInfo, goToPage]);

  const setPagination = useCallback((state: PaginationState) => {
    if (pagination === "server") {
      // For server mode, call callbacks AND update internal state to keep UI snappy
      if (onPageChange && state.pageIndex !== paginationState.pageIndex) {
        onPageChange(state.pageIndex + 1);
      }
      if (onPageSizeChange && state.pageSize !== paginationState.pageSize) {
        onPageSizeChange(state.pageSize);
      }
      setPaginationState(state);
    } else {
      setPaginationState(state);
    }
  }, [pagination, onPageChange, onPageSizeChange, paginationState.pageSize, paginationState.pageIndex]);

  // Selection with callback
  const setSelectedRows = useCallback((rows: TData[]) => {
    setSelectedRowsState(rows);
    onSelectionChange?.(rows);
  }, [onSelectionChange]);

  const contextValue: DataTableContextValue<TData> = {
    data,
    filteredData,
    paginatedData,
    searchTerm,
    setSearchTerm: (term: string) => {
      setSearchTerm(term);
      // Reset to first page on search
      if (pagination === "client") {
        setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
      } else if (onPageChange) {
        onPageChange(1);
      }
    },
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    pagination: paginationState,
    paginationInfo,
    setPagination,
    goToPage,
    nextPage,
    previousPage,
    sorting,
    setSorting,
    selectedRows,
    setSelectedRows,
    loading,
    config: {
      pagination,
      pageSizeOptions,
      searchKey: searchKey as string | undefined,
      getRowId,
    },
  };

  return (
    <DataTableContext.Provider value={contextValue as DataTableContextValue}>
      {children}
    </DataTableContext.Provider>
  );
}

/**
 * Hook to access DataTable context
 */
export function useDataTableContext<TData = unknown>(): DataTableContextValue<TData> {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTableContext must be used within a DataTableProvider");
  }
  return context as DataTableContextValue<TData>;
}
