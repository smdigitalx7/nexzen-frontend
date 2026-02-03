import type { ColumnDef } from "@tanstack/react-table";
import type { ActionButton, ActionButtonGroup, EnhancedDataTableProps, FilterOption } from "./EnhancedDataTable";
import { EnhancedDataTable } from "./EnhancedDataTable";
import { ServerSidePagination } from "./ServerSidePagination";

export interface EnhancedDataTableServerPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export interface EnhancedDataTableServerProps<TData>
  extends Omit<EnhancedDataTableProps<TData>, "enableClientSidePagination"> {
  // Keep types visible to consumers (helps inference in TSX call sites)
  columns: ColumnDef<TData>[];
  filters?: {
    key: string;
    label: string;
    options: FilterOption[];
    value: string;
    onChange: (value: string) => void;
  }[];
  actionButtons?: ActionButton<TData>[];
  actionButtonGroups?: ActionButtonGroup<TData>[];

  serverPagination?: EnhancedDataTableServerPaginationProps;
}

export function EnhancedDataTableServer<TData>({
  serverPagination,
  ...tableProps
}: EnhancedDataTableServerProps<TData>) {
  return (
    <div className="space-y-4">
      <EnhancedDataTable {...(tableProps as EnhancedDataTableProps<TData>)} enableClientSidePagination={false} />
      {serverPagination ? <ServerSidePagination {...serverPagination} /> : null}
    </div>
  );
}

