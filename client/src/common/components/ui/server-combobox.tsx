"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react"

import { cn } from "@/common/utils"
import { Button } from "@/common/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/common/components/ui/popover"

export interface ServerComboboxProps<T> {
  // Data props
  items: T[];
  isLoading?: boolean;
  value?: string;
  onSelect: (value: string) => void;
  
  // Display props
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  
  // Mapping props (to handle generic objects)
  valueKey?: keyof T;
  labelKey?: keyof T | ((item: T) => string);
  
  // Advanced props
  onSearch?: (query: string) => void;
  width?: string;
  onDropdownOpen?: (isOpen: boolean) => void;
  modal?: boolean;
}

export function ServerCombobox<T extends Record<string, any>>({
  items = [],
  isLoading = false,
  value,
  onSelect,
  placeholder = "Select item...",
  searchPlaceholder = "Search...",
  emptyText = "No items found.",
  className,
  disabled = false,
  valueKey = "value" as keyof T,
  labelKey = "label" as keyof T,
  onSearch,
  width = "w-full",
  onDropdownOpen,
  modal = false,
}: ServerComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Handle local filtering if no onSearch prop is provided
  const filteredItems = React.useMemo(() => {
    if (onSearch) return items;
    if (!searchQuery) return items;
    
    return items.filter(item => {
      const label = typeof labelKey === 'function' 
        ? labelKey(item)
        : String(item[labelKey]);
      return label.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [items, onSearch, searchQuery, labelKey]);

  // Handle search input
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  // Find selected item label
  const selectedItem = items.find(
    (item) => String(item[valueKey]) === value
  );
  
  const getLabel = (item: T) => {
    return typeof labelKey === 'function' ? labelKey(item) : String(item[labelKey]);
  };

  const selectedLabel = selectedItem ? getLabel(selectedItem) : placeholder;

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onDropdownOpen) {
      onDropdownOpen(newOpen);
    }
    if (!newOpen) {
      setSearchQuery("");
    }
  };

  const handleItemClick = (itemValue: string) => {
    onSelect(itemValue === value ? "" : itemValue);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", width, !value && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel}</span>
          {isLoading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 rounded-md", width)} align="start">
        <div className="flex w-full flex-col overflow-hidden bg-popover text-popover-foreground rounded-md">
          {/* Search Input */}
          <div className="flex items-center border-b px-3">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin opacity-50" />
            ) : (
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            )}
            <input
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          {/* Items List */}
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1 ">
            {!isLoading && filteredItems.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
            )}
            
            {!isLoading && filteredItems.map((item) => {
              const itemValue = String(item[valueKey]);
              const itemLabel = getLabel(item);
              const isSelected = value === itemValue;
              
              return (
                <div
                  key={itemValue}
                  onClick={() => handleItemClick(itemValue)}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {itemLabel}
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
