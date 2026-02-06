// DataTable V2 - Unified Pagination Component
// Professional, consistent pagination UI for both client and server-side

import { memo } from "react";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useDataTableContext } from "./DataTableProvider";
import { cn } from "@/common/utils";

interface DataTablePaginationProps {
  className?: string;
  showPageSize?: boolean;
  showPageNumbers?: boolean;
  compact?: boolean;
}

function DataTablePaginationComponent({
  className,
  showPageSize = true,
  showPageNumbers = true,
  compact = false,
}: DataTablePaginationProps) {
  const {
    paginationInfo,
    goToPage,
    nextPage,
    previousPage,
    setPagination,
    pagination,
    loading,
    config,
  } = useDataTableContext();

  const { currentPage, totalPages, pageSize, totalCount, startIndex, endIndex } = paginationInfo;

  // Don't render if no pagination or no data
  if (config.pagination === "none" || totalPages === 0) {
    return null;
  }

  // Generate visible page numbers (max 7 pages)
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageSizeChange = (value: string) => {
    const newSize = Number(value);
    setPagination({ pageIndex: 0, pageSize: newSize });
  };

  const pageNumbers = getPageNumbers();

  if (compact) {
    // Compact mode - just prev/next with count
    return (
      <div className={cn("flex items-center justify-between py-2", className)}>
        <span className="text-sm text-muted-foreground">
          {startIndex}-{endIndex} of {totalCount}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={previousPage}
            disabled={currentPage === 1 || loading}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={nextPage}
            disabled={currentPage === totalPages || loading}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between px-2 py-4 border-t bg-background/50",
        className
      )}
    >
      {/* Left side - Results info and page size */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{startIndex}</span> to{" "}
          <span className="font-medium text-foreground">{endIndex}</span> of{" "}
          <span className="font-medium text-foreground">{totalCount}</span> results
        </span>

        {showPageSize && (
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
              disabled={loading}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right side - Navigation */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1 || loading}
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={previousPage}
          disabled={currentPage === 1 || loading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {showPageNumbers && (
          <div className="hidden md:flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground"
                    aria-hidden
                  >
                    …
                  </span>
                );
              }

              const isActive = page === currentPage;
              return (
                <Button
                  key={page}
                  variant={isActive ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    isActive && "pointer-events-none"
                  )}
                  onClick={() => goToPage(page)}
                  disabled={loading}
                  aria-label={`Page ${page}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {page}
                </Button>
              );
            })}
          </div>
        )}

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={nextPage}
          disabled={currentPage === totalPages || loading}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 hidden sm:flex"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages || loading}
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export const DataTablePagination = memo(DataTablePaginationComponent);
