import { useState, useMemo, useEffect, memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
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
} from "@tanstack/react-table";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  X,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { Loader } from "@/components/ui/ProfessionalLoader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as ExcelJS from "exceljs";

import { cn } from "@/lib/utils";

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
interface ActionButton<TData = unknown> {
  id: string;
  label: string | ((row: TData) => string);
  icon: React.ComponentType<{ className?: string }> | ((row: TData) => React.ComponentType<{ className?: string }>);
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string | ((row: TData) => string);
  onClick: (row: TData) => void;
  show?: (row: TData) => boolean;
  disabled?: (row: TData) => boolean;
}

/**
 * Action button group for predefined button types
 * @example
 * {
 *   type: 'view',
 *   onClick: (row) => handleView(row)
 * }
 */
interface ActionButtonGroup<TData = unknown> {
  type: "view" | "edit" | "delete" | "custom";
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
  addButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost";
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
  customGlobalFilterFn?: <TData>(
    row: TData,
    columnId: string,
    value: string
  ) => boolean;
  // Action buttons
  actionButtons?: ActionButton<TData>[];
  actionButtonGroups?: ActionButtonGroup<TData>[];
  showActions?: boolean;
  actionColumnHeader?: string;
  showActionLabels?: boolean;
  customAddButton?: React.ReactNode;
  // ✅ FIX: Add refreshKey prop to force table refresh when data updates
  refreshKey?: number | string;
}

function EnhancedDataTableComponent<TData>({
  data,
  columns,
  title,
  searchKey,
  searchPlaceholder = "Search...",
  className,
  exportable = false,
  onExport,
  onAdd,
  addButtonText = "Add New",
  addButtonVariant = "default",
  filters = [],
  enableVirtualization = true,
  virtualThreshold = 100,
  loading = false,
  showSearch = true,
  enableDebounce = true,
  debounceDelay = 300,
  searchSuggestions = [],
  customGlobalFilterFn,
  actionButtons = [],
  actionButtonGroups = [],
  showActions = false,
  actionColumnHeader = "Actions",
  showActionLabels = true,
  customAddButton,
  refreshKey, // ✅ FIX: Add refreshKey to force refresh
}: EnhancedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounced search functionality
  const [debouncedGlobalFilter, setDebouncedGlobalFilter] =
    useState(globalFilter);
  const [isExporting, setIsExporting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Refs for virtualization
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

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
    setGlobalFilter("");
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
      setSearchHistory((prev) => {
        if (!prev.includes(searchTerm)) {
          return [searchTerm, ...prev.slice(0, 4)]; // Keep last 5 searches
        }
        return prev;
      });
    }
  }, []);

  // Handle search with history
  const handleSearch = useCallback(
    (value: string) => {
      setGlobalFilter(value);
      if (value.trim()) {
        addToSearchHistory(value.trim());
      }
    },
    [addToSearchHistory]
  );

  // Highlight search terms in text (sanitized) - kept for potential future use
  // const highlightText = useCallback(
  //   (text: string, searchTerm: string) => {
  //     if (!searchTerm || !highlightSearchResults) return text;
  //     return sanitizeHighlight(text, searchTerm);
  //   },
  //   [highlightSearchResults]
  // );

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        // Focus search input
        const searchInput = document.querySelector(
          '[data-testid="input-search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      if (e.key === "Escape" && globalFilter) {
        clearSearch();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "H") {
        e.preventDefault();
        clearSearchHistory();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [globalFilter, clearSearch, clearSearchHistory]);

  // Reset to first page when data changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [data]);

  // Generate action column if actions are enabled
  const generateActionColumn = useCallback((): ColumnDef<TData> | null => {
    if (
      !showActions ||
      (actionButtons.length === 0 && actionButtonGroups.length === 0)
    ) {
      return null;
    }

    return {
      id: "actions",
      header: actionColumnHeader,
      cell: ({ row }) => {
        const allButtons: ActionButton<TData>[] = [];

        // Add individual action buttons
        actionButtons.forEach((button) => {
          if (!button.show || button.show(row.original)) {
            allButtons.push(button);
          }
        });

        // Add action button groups
        actionButtonGroups.forEach((group) => {
          if (!group.show || group.show(row.original)) {
            const button: ActionButton<TData> = {
              id: group.type,
              label:
                group.label ||
                group.type.charAt(0).toUpperCase() + group.type.slice(1),
              icon: group.icon || getDefaultIcon(group.type),
              variant: group.variant || getDefaultVariant(group.type),
              size: "sm",
              className: group.className || getDefaultClassName(group.type),
              onClick: group.onClick,
            };
            allButtons.push(button);
          }
        });

        if (allButtons.length === 0) return null;

        return (
          <div className="flex items-center">
            {allButtons.map((button, index) => {
              // Handle dynamic icon - can be a component or a function that returns a component
              const Icon: React.ComponentType<{ className?: string }> = 
                typeof button.icon === 'function' && button.icon.length > 0 
                  ? (button.icon as (row: TData) => React.ComponentType<{ className?: string }>)(row.original)
                  : (button.icon as React.ComponentType<{ className?: string }>);
              
              // Handle dynamic label - can be a string or a function that returns a string
              const label = typeof button.label === 'function' 
                ? (button.label as (row: TData) => string)(row.original)
                : (button.label as string);
              
              // Handle dynamic className - can be a string or a function that returns a string
              const className = typeof button.className === 'function' 
                ? (button.className as (row: TData) => string)(row.original)
                : (button.className as string | undefined);
              
              const isDisabled = button.disabled ? button.disabled(row.original) : false;
              const iconClassName = isDisabled ? "h-2 w-2 animate-spin" : "h-2 w-2";
              
              return (
                <Button
                  key={`${button.id}-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => !isDisabled && button.onClick(row.original)}
                  disabled={isDisabled}
                  className={cn(
                    showActionLabels
                      ? "h-5 px-2.5 py-0.5 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm"
                      : "h-5 w-5 p-4 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-sm",
                    index > 0 && "ml-2",
                    className
                  )}
                  title={label}
                  aria-label={label}
                >
                  <Icon className={iconClassName} />
                  {showActionLabels && (
                    <span className="ml-0.2 text-xs font-medium ">
                      {label}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        );
      },
    };
  }, [
    showActions,
    actionButtons,
    actionButtonGroups,
    actionColumnHeader,
    showActionLabels,
  ]);

  // Helper functions for default styling
  const getDefaultIcon = (type: string) => {
    switch (type) {
      case "view":
        return Eye;
      case "edit":
        return Edit;
      case "delete":
        return Trash2;
      default:
        return MoreHorizontal;
    }
  };

  const getDefaultVariant = (
    type: string
  ): "default" | "destructive" | "outline" | "secondary" | "ghost" => {
    switch (type) {
      case "delete":
        return "ghost";
      case "edit":
        return "ghost";
      case "view":
        return "ghost";
      default:
        return "ghost";
    }
  };

  const getDefaultClassName = (type: string) => {
    switch (type) {
      case "view":
        return "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20";
      case "edit":
        return "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20";
      case "delete":
        return "text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20";
      default:
        return "text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800";
    }
  };

  // Memoize expensive computations
  const memoizedColumns = useMemo(() => {
    const actionColumn = generateActionColumn();
    return actionColumn ? [...columns, actionColumn] : columns;
  }, [columns, generateActionColumn]);

  // ✅ FIX: Include refreshKey in memoization to force refresh when data updates
  // Also use data length and JSON stringify to detect actual data changes
  const memoizedFilteredData = useMemo(() => {
    let result = data;

    // Apply additional filters
    filters.forEach((filter) => {
      if (filter.value && filter.value !== "all") {
      result = result.filter((item) => {
        const value = (item as Record<string, unknown>)[filter.key];
        return value === filter.value;
      });
      }
    });

    return result;
  }, [data, filters, refreshKey, data.length]); // ✅ Add refreshKey and data.length to detect changes

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
    globalFilterFn:
      customGlobalFilterFn ||
      ((row, columnId, value: string) => {
        if (!value) return true;
        const searchValue = String(value).toLowerCase();
        if (searchKey) {
          const cellValue = (row.original as Record<string, unknown>)[searchKey as string];
          if (cellValue === null || cellValue === undefined) return false;
          const cellValueStr = String(cellValue).toLowerCase();
          return cellValueStr.includes(searchValue);
        }
        const cellValue = row.getValue(columnId);
        if (cellValue === null || cellValue === undefined) return false;
        const cellValueStr = String(cellValue).toLowerCase();
        return cellValueStr.includes(searchValue);
      }),
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter: enableDebounce ? debouncedGlobalFilter : globalFilter,
      pagination,
    },
  });

  // Virtualization setup
  const rows = table.getRowModel().rows;
  const shouldVirtualize =
    enableVirtualization && rows.length > virtualThreshold;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 10, // Number of rows to render outside visible area
    enabled: shouldVirtualize,
  }) as Virtualizer<HTMLDivElement, Element>;

  // Truncate text helper - kept for potential future use
  // const truncateText = useCallback((text: string, maxLength: number = 20) => {
  //   if (!text || text.length <= maxLength) return text;
  //   return text.substring(0, maxLength) + "...";
  // }, []);

  // Export functionality
  const performExport = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(title || "Data Export");

      // Professional worksheet properties
      worksheet.properties.defaultRowHeight = 20;
      worksheet.properties.defaultColWidth = 18;

      // Professional neutral color scheme - Corporate-grade design
      const colors = {
        primary: { argb: "FF374151" }, // Gray-700 - Professional Dark Gray
        primaryDark: { argb: "FF1F2937" }, // Gray-800 - Very Dark Gray
        secondary: { argb: "FFF8F9FA" }, // Gray-50 - Very Light Gray
        text: { argb: "FF111827" }, // Gray-900 - Very Dark Text (High Contrast)
        textSecondary: { argb: "FF4B5563" }, // Gray-600 - Secondary Text
        border: { argb: "FFD1D5DB" }, // Gray-300 - Standard Border
        borderDark: { argb: "FF6B7280" }, // Gray-500 - Dark Border
        success: { argb: "FF059669" }, // Green-600
        warning: { argb: "FFD97706" }, // Amber-600
        error: { argb: "FFDC2626" }, // Red-600
        white: { argb: "FFFFFFFF" },
        headerBg: { argb: "FF374151" }, // Gray-700 - Professional Dark Gray Header
        headerText: { argb: "FFFFFFFF" }, // White - High Contrast
        headerBorder: { argb: "FF1F2937" }, // Gray-800 - Dark Border
        alternateRow: { argb: "FFF9FAFB" }, // Gray-50 - Very Light Gray
      };

      // Filter out action columns
      const exportableColumns = columns.filter((col) => {
        const typedCol = col as ColumnDef<TData> & { accessorKey?: string; header?: unknown };
        const hasAccessorKey = !!typedCol.accessorKey;
        const headerStr = typeof typedCol.header === "string" 
          ? typedCol.header 
          : typeof typedCol.header === "function" 
          ? col.id ?? "" 
          : String(typedCol.header ?? "");
        const isActionColumn =
          col.id?.toLowerCase().includes("action") ||
          col.id?.toLowerCase().includes("actions") ||
          headerStr.toLowerCase().includes("action");
        return hasAccessorKey && !isActionColumn;
      });

      // Add modern clean title section
      if (title) {
        const titleRow = worksheet.addRow([title]);
        titleRow.height = 30;
        titleRow.font = {
          bold: true,
          size: 16,
          color: colors.text,
          name: "Segoe UI",
        };
        titleRow.alignment = {
          horizontal: "left",
          vertical: "middle",
        };
        titleRow.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: colors.white,
        };

        // Merge title cells
        worksheet.mergeCells(1, 1, 1, exportableColumns.length);

        // Clean border - only bottom
        const titleCell = worksheet.getCell(1, 1);
        titleCell.border = {
          bottom: { style: "medium", color: colors.headerBg },
        };

        worksheet.addRow([]); // Empty row for spacing
      }

      // Add export metadata with clean styling
      const now = new Date();
      const exportDate = `${now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} at ${now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
      
      const metadataRow = worksheet.addRow([
        `Generated: ${exportDate} | Total Records: ${memoizedFilteredData.length}`,
      ]);
      metadataRow.height = 20;
      metadataRow.font = {
        size: 9,
        color: colors.textSecondary,
        name: "Segoe UI",
      };
      metadataRow.alignment = {
        horizontal: "right",
        vertical: "middle",
      };

      // Merge metadata cells
      worksheet.mergeCells(
        title ? 3 : 1,
        1,
        title ? 3 : 1,
        exportableColumns.length
      );

      const metadataCell = worksheet.getCell(title ? 3 : 1, 1);
      metadataCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: colors.white,
      };
      metadataCell.border = {
        bottom: { style: "thin", color: colors.border },
      };

      worksheet.addRow([]); // Empty row for spacing

      // Add professional headers
      const headers = exportableColumns.map((col) => {
        if (typeof col.header === "string") return col.header;
        if (typeof col.header === "function") return col.id ?? "";
        const typedCol = col as ColumnDef<TData> & { accessorKey?: string };
        return typedCol.accessorKey ?? col.id ?? "";
      });

      const headerRowIndex = title ? 5 : 3;
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 24; // More compact header height
      headerRow.font = {
        bold: true,
        size: 11,
        color: colors.headerText,
        name: "Segoe UI",
      };
      headerRow.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: colors.headerBg,
      };

      // Apply professional header styling to each cell
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: "medium", color: colors.headerBorder },
          bottom: { style: "medium", color: colors.headerBorder },
          left: { style: "thin", color: colors.border },
          right: { style: "thin", color: colors.border },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: colors.headerBg,
        };
      });

      // Add data rows with professional styling
      memoizedFilteredData.forEach((row, index) => {
        const rowData = exportableColumns.map((col) => {
          const typedCol = col as ColumnDef<TData> & { accessorKey?: string };
          const key = typedCol.accessorKey;
          if (key) {
            const value = (row as Record<string, unknown>)[key];
            // Professional data formatting
            if (value === null || value === undefined) return "-";
            if (typeof value === "boolean") return value ? "Yes" : "No";
            if (typeof value === "object") {
              // Handle dates - more compact format
              if (value instanceof Date) {
                return value.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              }
              // Handle objects and arrays
              try {
                return JSON.stringify(value).replace(/[{}"]/g, "").slice(0, 40); // Reduced from 50
              } catch {
                return String(value);
              }
            }
            // Format numbers with commas
            if (typeof value === "number") {
              if (Number.isInteger(value)) {
                return value.toLocaleString("en-US");
              }
              return value.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
            }
            return String(value).trim();
          }
          return "";
        });

        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 20; // More compact row height
        dataRow.alignment = { vertical: "middle" };

        // Professional alternating row colors
        const isEvenRow = index % 2 === 0;
        const rowFillColor = isEvenRow ? colors.white : colors.alternateRow;

        // Apply professional cell styling
        dataRow.eachCell((cell, colNumber) => {
          const col = exportableColumns[colNumber - 1];
          const typedCol = col as ColumnDef<TData> & { accessorKey?: string };
          const colKey = typedCol.accessorKey?.toLowerCase() || '';
          
          cell.font = {
            size: 10,
            color: colors.text,
            name: "Segoe UI",
          };
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: false, // Disable wrap for compact design
          };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: rowFillColor,
          };
          cell.border = {
            top: { style: "thin", color: colors.border },
            left: { style: "thin", color: colors.border },
            bottom: { style: "thin", color: colors.border },
            right: { style: "thin", color: colors.border },
          };

          // Right-align numeric values
          const value = cell.value;
          if (
            typeof value === "number" ||
            (!isNaN(Number(value)) && value !== "")
          ) {
            cell.alignment = {
              ...cell.alignment,
              horizontal: "right",
            };
            cell.numFmt =
              typeof value === "number" && !Number.isInteger(value)
                ? "#,##0.00"
                : "#,##0";
          }
          
          // Conditional formatting for status/payment columns
          const cellValue = String(cell.value || '').toUpperCase();
          if (colKey.includes('status') || colKey.includes('payment')) {
            if (cellValue.includes('CONFIRMED') || cellValue.includes('PAID') || cellValue === 'YES') {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFECFDF5" }, // Light green background
              };
              cell.font = {
                ...cell.font,
                color: { argb: "FF059669" }, // Green text
                bold: true,
              };
            } else if (cellValue.includes('PENDING') || cellValue.includes('UNPAID') || cellValue === 'NO') {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFFBEB" }, // Light yellow background
              };
              cell.font = {
                ...cell.font,
                color: { argb: "FFD97706" }, // Amber text
                bold: true,
              };
            }
          }
        });
      });

      // Optimized column width calculation - More compact design
      worksheet.columns.forEach((column, index) => {
        if (column && column.eachCell) {
          const col = exportableColumns[index];
          const colKey = typeof col.accessorKey === 'string' ? col.accessorKey.toLowerCase() : '';
          const colHeader = typeof col.header === 'string' ? col.header : String(col.header || '');
          
          let maxLength = 10;
          column.eachCell({ includeEmpty: false }, (cell) => {
            if (cell && cell.value) {
              const cellValue = String(cell.value);
              const cellLength = cellValue.length;
              if (cellLength > maxLength) {
                // Reduced max length for compact design
                maxLength = Math.min(cellLength, 40); // Reduced from 60 to 40
              }
            }
          });

          // Smart width calculation based on column type
          let optimalWidth = Math.max(maxLength + 2, 10);
          
          // Adjust for specific column types
          if (colKey.includes('status')) {
            optimalWidth = Math.min(Math.max(optimalWidth, 12), 18); // Status: 12-18
          } else if (colKey.includes('date')) {
            optimalWidth = Math.min(Math.max(optimalWidth, 12), 18); // Date: 12-18
          } else if (colKey.includes('no') || colKey.includes('id')) {
            optimalWidth = Math.min(Math.max(optimalWidth, 15), 25); // ID: 15-25
          } else if (colKey.includes('name')) {
            optimalWidth = Math.min(Math.max(optimalWidth, 20), 35); // Name: 20-35
          } else if (colKey.includes('amount') || colKey.includes('fee') || colKey.includes('payment')) {
            optimalWidth = Math.min(Math.max(optimalWidth, 15), 20); // Amount: 15-20
          } else {
            optimalWidth = Math.min(Math.max(optimalWidth, 10), 35); // Default: 10-35
          }

          // Set column width with optimized limits
          column.width = optimalWidth;

          // Set alignment for header
          if (headerRow.getCell(index + 1)) {
            headerRow.getCell(index + 1).alignment = {
              horizontal: "left",
              vertical: "middle",
            };
          }
        }
      });

      // Add professional summary footer
      const summaryRowIndex = worksheet.rowCount + 1;
      const summaryRow = worksheet.addRow([
        `Total Records: ${memoizedFilteredData.length}`,
      ]);
      summaryRow.height = 26;
      summaryRow.font = {
        bold: true,
        size: 11,
        color: colors.text, // Dark gray text for readability
        name: "Segoe UI",
      };
      summaryRow.alignment = {
        horizontal: "right",
        vertical: "middle",
      };
      summaryRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" }, // Gray-100 - Light neutral background
      };

      // Merge summary cells
      worksheet.mergeCells(
        summaryRowIndex,
        1,
        summaryRowIndex,
        exportableColumns.length
      );

      const summaryCell = worksheet.getCell(summaryRowIndex, 1);
      summaryCell.border = {
        top: { style: "medium", color: colors.borderDark },
        bottom: { style: "thin", color: colors.border },
        left: { style: "thin", color: colors.border },
        right: { style: "thin", color: colors.border },
      };
      // Update summary background to neutral gray
      summaryCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF3F4F6" }, // Gray-100 - Light neutral background
      };

      // Add freeze panes for better navigation
      if (title) {
        worksheet.views = [
          {
            state: "frozen",
            ySplit: headerRowIndex,
            xSplit: 0,
            topLeftCell: `A${headerRowIndex + 1}`,
            activeCell: `A${headerRowIndex + 1}`,
            showGridLines: true,
          },
        ];
      } else {
        worksheet.views = [
          {
            state: "frozen",
            ySplit: headerRowIndex - 1,
            xSplit: 0,
            topLeftCell: `A${headerRowIndex}`,
            activeCell: `A${headerRowIndex}`,
            showGridLines: true,
          },
        ];
      }

      // Professional page setup
      worksheet.pageSetup = {
        orientation: "landscape",
        paperSize: 9, // A4
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: {
          left: 0.5,
          right: 0.5,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
        printArea: `A1:${String.fromCharCode(64 + exportableColumns.length)}${worksheet.rowCount}`,
      };

      // Add print titles (repeat header on each page)
      worksheet.pageSetup.printTitlesRow = `${headerRowIndex}:${headerRowIndex}`;

      // Professional header and footer
      worksheet.headerFooter = {
        oddHeader: `&C&B&"Segoe UI,Regular"&14${title || "Data Export"}`,
        oddFooter: `&L&"Segoe UI,Regular"&10Generated on ${new Date().toLocaleDateString()}&R&"Segoe UI,Regular"&10Page &P of &N`,
        evenHeader: `&C&B&"Segoe UI,Regular"&14${title || "Data Export"}`,
        evenFooter: `&L&"Segoe UI,Regular"&10Generated on ${new Date().toLocaleDateString()}&R&"Segoe UI,Regular"&10Page &P of &N`,
      };

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const sanitizedTitle = (title || "data")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      link.download = `${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (_error) {
      // Fallback to CSV if Excel export fails
      const exportableColumns = columns.filter((col: any) => {
        const hasAccessorKey = !!col.accessorKey;
        const isActionColumn =
          col.id?.toLowerCase().includes("action") ||
          col.id?.toLowerCase().includes("actions") ||
          col.header?.toString().toLowerCase().includes("action");
        return hasAccessorKey && !isActionColumn;
      });

      const csvContent = [
        exportableColumns
          .map((col: any) => col.header || col.accessorKey)
          .join(","),
        ...memoizedFilteredData.map((row) =>
          exportableColumns
            .map((col: any) => {
              const key = col.accessorKey;
              if (key) {
                const value = (row as Record<string, unknown>)[key];
                if (value === null || value === undefined) return "";
                return String(value).replace(/"/g, '""');
              }
              return "";
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const sanitizedTitle = (title || "data")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      link.download = `${sanitizedTitle}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [memoizedFilteredData, columns, title]);

  const handleExport = useCallback(async () => {
    if (onExport) {
      onExport();
      return;
    }

    setIsExporting(true);

    try {
      // Use requestIdleCallback for non-blocking export
      await new Promise<void>((resolve) => {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => {
            void performExport();
            resolve();
          });
        } else {
          setTimeout(() => {
            void performExport();
            resolve();
          }, 0);
        }
      });
    } finally {
      setIsExporting(false);
    }
  }, [onExport, performExport]);

  // Loading state
  if (loading) {
    return (
      <div className="py-8">
        <Loader.Data message="Loading data..." />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-4 w-full", className)}
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
                      <div className="text-blue-500">
                        <Loader.Button size="sm" />
                      </div>
                    ) : (
                      <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    )}
                  </div>

                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={globalFilter ?? ""}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
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
                  {globalFilter
                    ? `${table.getFilteredRowModel().rows.length} results found`
                    : ""}
                </div>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions &&
                (searchSuggestions.length > 0 || searchHistory.length > 0) &&
                !globalFilter && (
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
                            {searchSuggestions
                              .slice(0, 5)
                              .map((suggestion, index) => (
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
                      {table.getFilteredRowModel().rows.length} result
                      {table.getFilteredRowModel().rows.length !== 1
                        ? "s"
                        : ""}{" "}
                      found
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-500">
                    <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                      Esc
                    </kbd>{" "}
                    to clear
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
              onClick={() => { void handleExport(); }}
              disabled={isExporting}
              className=""
            >
              {isExporting ? (
                <span className="mr-2">
                  <Loader.Button size="sm" />
                </span>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Exporting..." : "Export Excel"}
            </Button>
          )}
          {customAddButton ? (
            customAddButton
          ) : onAdd ? (
            <Button
              onClick={onAdd}
              variant={addButtonVariant}
              size="sm"
              className=""
            >
              <Plus className="h-4 w-4 mr-2" />
              {addButtonText}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Additional Filters */}
      {filters.length > 0 && (
        <div className="flex items-center gap-4 p-4">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Filters:
          </div>
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
                <SelectItem
                  key="all"
                  value="all"
                  className="hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  All {filter.label}
                </SelectItem>
                {filter.options
                  .filter(
                    (option) => option.value && option.value.trim() !== ""
                  ) // Filter out empty values
                  .map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
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
        <div
          ref={tableContainerRef}
          className={cn(
            "overflow-x-auto scrollbar-hide",
            shouldVirtualize && "overflow-y-auto max-h-[600px]"
          )}
          role="region"
          aria-label="Data table"
        >
          <Table className="w-full" role="table">
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-b border-slate-200 dark:border-slate-700"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "sticky top-0 z-10 bg-slate-50 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 py-4 text-left",
                        header.column.getCanSort() &&
                          "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200",
                        header.index === 0 ? "pl-6 pr-3" : "px-3"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        minWidth: "120px",
                        maxWidth: "500px",
                        width:
                          header.column.getSize() > 0
                            ? `${header.column.getSize()}px`
                            : "auto",
                      }}
                      data-testid={`header-${header.id}`}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                      tabIndex={header.column.getCanSort() ? 0 : -1}
                      onKeyDown={(e) => {
                        if (
                          header.column.getCanSort() &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          header.column.getToggleSortingHandler()?.(e);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
            <TableBody
              ref={tableBodyRef}
              className="bg-white dark:bg-slate-900"
              style={
                shouldVirtualize
                  ? {
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: "relative",
                    }
                  : undefined
              }
            >
              {rows?.length ? (
                shouldVirtualize && rowVirtualizer ? (
                  // Virtualized rendering
                  (() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const virtualizer = rowVirtualizer as Virtualizer<HTMLDivElement, Element>;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                    return virtualizer.getVirtualItems().map((virtualRow: { index: number; size: number; start: number }) => {
                      const rowIndex = typeof virtualRow.index === 'number' ? virtualRow.index : Number(virtualRow.index ?? 0);
                      if (isNaN(rowIndex) || rowIndex < 0 || rowIndex >= rows.length) return null;
                      const row = rows[rowIndex];
                      if (!row) return null;
                      const size = typeof virtualRow.size === 'number' ? virtualRow.size : Number(virtualRow.size ?? 60);
                      const start = typeof virtualRow.start === 'number' ? virtualRow.start : Number(virtualRow.start ?? 0);
                      return (
                        <motion.tr
                          key={row.id}
                          data-index={rowIndex}
                          ref={(node) => {
                            if (node) {
                              // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                              virtualizer.measureElement(node);
                            }
                          }}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 group"
                        data-state={row.getIsSelected() && "selected"}
                        data-testid={`row-${row.id}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "py-4 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200",
                              cell.column.getIndex() === 0
                                ? "pl-6 pr-3"
                                : "px-3"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[400px]",
                                // Only truncate if the cell content is text-based
                                (() => {
                                  const value = cell.getValue();
                                  return typeof value === "string" &&
                                    value &&
                                    value.length > 50
                                    ? "truncate"
                                    : "break-words";
                                })()
                              )}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </motion.tr>
                      );
                    });
                  })()
                ) : (
                  // Non-virtualized rendering (for small lists)
                  rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 group"
                      data-state={row.getIsSelected() && "selected"}
                      data-testid={`row-${row.id}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "py-4 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200",
                            cell.column.getIndex() === 0 ? "pl-6 pr-3" : "px-3"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[400px]",
                              // Only truncate if the cell content is text-based
                              (() => {
                                const value = cell.getValue();
                                return typeof value === "string" &&
                                  value &&
                                  value.length > 50
                                  ? "truncate"
                                  : "break-words";
                              })()
                            )}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center bg-white"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="text-slate-600 dark:text-slate-300 font-medium text-lg">
                        No results found
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 max-w-lg text-center">
                        Try adjusting your search criteria or filters to find
                        what you&apos;re looking for
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
                <span>
                  Showing{" "}
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) *
                      table.getState().pagination.pageSize,
                    table.getFilteredRowModel().rows.length
                  )}{" "}
                  of {table.getFilteredRowModel().rows.length} results
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-slate-400">for</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-semibold">
                    &quot;{globalFilter}&quot;
                  </span>
                </div>
              </div>
            ) : (
              <span>
                Showing{" "}
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}{" "}
                to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} entries
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
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
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
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Show:
            </span>
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => {
                const newPageSize = Number(value);
                setPagination((prev) => ({
                  ...prev,
                  pageSize: newPageSize,
                  pageIndex: 0,
                }));
              }}
            >
              <SelectTrigger
                className="w-20 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                data-testid="select-page-size"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                <SelectItem
                  key="10"
                  value="10"
                  className="hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  10
                </SelectItem>
                <SelectItem
                  key="25"
                  value="25"
                  className="hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  25
                </SelectItem>
                <SelectItem
                  key="50"
                  value="50"
                  className="hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  50
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const EnhancedDataTable = memo(
  EnhancedDataTableComponent
) as typeof EnhancedDataTableComponent;
