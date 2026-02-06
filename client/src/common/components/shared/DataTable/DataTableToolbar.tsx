// DataTable V2 - Toolbar Component
// Search, Filters, and Actions in a unified toolbar

import { memo, useState, useEffect, useCallback } from "react";
import { Search, X, Filter, RotateCcw, Plus, Download } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Badge } from "@/common/components/ui/badge";
import { useDataTableContext } from "./DataTableProvider";
import type { FilterConfig } from "./types";
import { cn } from "@/common/utils";

interface DataTableToolbarProps {
  className?: string;
  
  // Search
  searchPlaceholder?: string;
  showSearch?: boolean;
  debounceMs?: number;
  
  // Filters
  filters?: FilterConfig[];
  
  // Actions
  onAdd?: () => void;
  addButtonText?: string;
  onExport?: () => void | Promise<void>;
  showExport?: boolean;
  
  // Custom content
  leftContent?: React.ReactNode;
  middleContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

function DataTableToolbarComponent({
  className,
  searchPlaceholder = "Search...",
  showSearch = true,
  debounceMs = 300,
  filters = [],
  onAdd,
  addButtonText = "Add New",
  onExport,
  showExport = false,
  leftContent,
  middleContent,
  rightContent,
}: DataTableToolbarProps) {
  const {
    searchTerm,
    setSearchTerm,
    filters: activeFilters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    paginationInfo,
    loading,
  } = useDataTableContext();

  // Local search state for debouncing
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [isExporting, setIsExporting] = useState(false);

  // Sync local search with context
  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchTerm) {
        setSearchTerm(localSearch);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localSearch, debounceMs, setSearchTerm, searchTerm]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    setSearchTerm("");
  }, [setSearchTerm]);

  const handleExport = useCallback(async () => {
    if (!onExport) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  }, [onExport]);

  // Count active filters (excluding search)
  const activeFilterCount = Object.values(activeFilters).filter(
    (v) => v && v !== "all"
  ).length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main toolbar row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side - Search and filters */}
        <div className="flex flex-1 items-center gap-2 flex-wrap min-w-0">
          {leftContent}

          {/* Search */}
          {showSearch && (
            <div className="w-full sm:flex-1 min-w-0">
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="h-9 w-full"
                disabled={loading}
                leftIcon={<Search className="h-4 w-4" />}
                rightIcon={
                  localSearch ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-muted -mr-1"
                      onClick={handleClearSearch}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}

          {/* Middle content slot - now sit right next to search */}
          {middleContent && (
            <div className="flex items-center gap-2">
              {middleContent}
            </div>
          )}

          {/* Filter dropdowns */}
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key]?.toString() || "all"}
              onValueChange={(value) =>
                setFilter(filter.key, value === "all" ? null : value)
              }
              disabled={loading}
            >
              <SelectTrigger className="h-9 w-auto min-w-[130px]">
                <div className="flex items-center gap-2">
                  {filter.type === "select" && (
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Right side - Reset and Actions */}
        <div className="flex items-center gap-2">
          {/* Reset filters button - now on the right side for better balance */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}

          {rightContent}

          {showExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || isExporting || paginationInfo.totalCount === 0}
              className="h-9"
            >
              <Download className={cn("h-4 w-4 mr-2", isExporting && "animate-bounce")} />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          )}

          {onAdd && (
            <Button size="sm" onClick={onAdd} disabled={loading} className="h-9">
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Results count - subtle indicator */}
      {(searchTerm || hasActiveFilters) && (
        <div className="text-sm text-muted-foreground">
          Found <span className="font-medium">{paginationInfo.totalCount}</span> results
          {searchTerm && (
            <span>
              {" "}matching "<span className="font-medium">{searchTerm}</span>"
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export const DataTableToolbar = memo(DataTableToolbarComponent);
