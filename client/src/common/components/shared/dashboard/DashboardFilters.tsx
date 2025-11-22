import React from 'react';
import { Search, X, Calendar, Filter } from 'lucide-react';
import { Input } from '@/common/components/ui/input';
import { Button } from '@/common/components/ui/button';
import { Calendar as CalendarComponent } from '@/common/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Badge } from '@/common/components/ui/badge';
import { cn } from '@/common/utils';
import { format } from 'date-fns';

interface DateRange {
  from?: Date;
  to?: Date;
  onDateChange?: (from: Date | undefined, to: Date | undefined) => void;
}

interface SelectFilter {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

interface DashboardFiltersProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  dateRange?: DateRange;
  selectFilters?: SelectFilter[];
  onClearFilters?: () => void;
  className?: string;
  loading?: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  dateRange,
  selectFilters = [],
  onClearFilters,
  className,
  loading = false,
}) => {
  const hasActiveFilters = searchValue || 
    (dateRange?.from || dateRange?.to) || 
    selectFilters.some(filter => filter.value);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>
        )}

        {/* Date Range Picker */}
        {dateRange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
                disabled={loading}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  dateRange.onDateChange?.(range?.from, range?.to);
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Select Filters */}
        {selectFilters.map((filter) => (
          <Select
            key={filter.key}
            value={filter.value}
            onValueChange={filter.onValueChange}
            disabled={loading}
          >
            <SelectTrigger className="w-full sm:w-auto">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2 lg:px-3"
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && !loading && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Active filters:</span>
          </div>
          
          {searchValue && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchValue}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onSearchChange?.("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(dateRange?.from || dateRange?.to) && (
            <Badge variant="secondary" className="gap-1">
              Date: {dateRange.from ? format(dateRange.from, "MMM dd") : "Start"} - {dateRange.to ? format(dateRange.to, "MMM dd") : "End"}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => dateRange.onDateChange?.(undefined, undefined)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {selectFilters
            .filter(filter => filter.value)
            .map((filter) => (
              <Badge key={filter.key} variant="secondary" className="gap-1">
                {filter.label}: {filter.options.find(opt => opt.value === filter.value)?.label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => filter.onValueChange("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
};

export default DashboardFilters;
