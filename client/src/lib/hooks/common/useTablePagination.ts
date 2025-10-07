import { useState, useMemo } from 'react';

interface UseTablePaginationProps {
  data: any[];
  pageSize?: number;
  initialPage?: number;
}

interface UseTablePaginationReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  paginatedData: any[];
  startIndex: number;
  endIndex: number;
  totalItems: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  goToFirst: () => void;
  goToLast: () => void;
}

export const useTablePagination = ({
  data,
  pageSize: initialPageSize = 10,
  initialPage = 1,
}: UseTablePaginationProps): UseTablePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const goToNext = () => {
    if (canGoNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevious = () => {
    if (canGoPrevious) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToFirst = () => {
    setCurrentPage(1);
  };

  const goToLast = () => {
    setCurrentPage(totalPages);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
    totalItems,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
  };
};
