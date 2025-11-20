/**
 * Other Income Table Component
 * Displays other income records in a table format
 */

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createCurrencyColumn } from "@/lib/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/lib/constants";

interface OtherIncomeRecord {
  other_income_id: number;
  branch_id: number;
  academic_year_id: number;
  name: string;
  description?: string;
  amount: number;
  receipt_no: string;
  payment_method: "CASH" | "UPI" | "CARD";
  income_date: string;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by: number;
  created_by_name?: string;
  updated_by_name?: string;
}

interface OtherIncomeTableProps {
  fetchOtherIncome: () => Promise<{ items: OtherIncomeRecord[]; total: number }>;
  onAddOtherIncome: () => void;
  enabled?: boolean;
  institutionType: "school" | "college";
}

export const OtherIncomeTable: React.FC<OtherIncomeTableProps> = ({
  fetchOtherIncome,
  onAddOtherIncome,
  enabled = true,
  institutionType,
}) => {
  const { user } = useAuthStore();
  const canAddOtherIncome =
    user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;

  const queryKey = useMemo(
    () => [`${institutionType}-other-income`],
    [institutionType]
  );

  const {
    data: otherIncomeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchOtherIncome,
    enabled: enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  // Define columns for Other Income table
  const columns: ColumnDef<OtherIncomeRecord>[] = [
    {
      accessorKey: "income_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("income_date") || row.original.created_at),
    },
    {
      accessorKey: "receipt_no",
      header: "Receipt No",
      cell: ({ row }) => row.getValue("receipt_no") || `OTHER-${row.original.other_income_id}`,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") || "-"}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description ? (
          <Badge variant="secondary" className="max-w-[200px] truncate">
            {description}
          </Badge>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "payment_method",
      header: "Payment Method",
      cell: ({ row }) => {
        const method = row.getValue("payment_method") as string;
        const colorMap: Record<string, string> = {
          CASH: "bg-green-100 text-green-700",
          UPI: "bg-blue-100 text-blue-700",
          CARD: "bg-purple-100 text-purple-700",
        };
        return (
          <Badge className={colorMap[method] || "bg-gray-100 text-gray-700"}>
            {method}
          </Badge>
        );
      },
    },
    createCurrencyColumn<OtherIncomeRecord>("amount", {
      header: "Amount",
      className: "text-green-600 font-bold",
    }),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              ❌ Error loading other income data: {error.message}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading other income data...</span>
        </div>
      )}

      {/* Empty State */}
      {!isLoading &&
        !error &&
        (!otherIncomeData?.items || otherIncomeData.items.length === 0) && (
          <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <p className="text-muted-foreground mb-4">No other income records found</p>
            {canAddOtherIncome && (
              <Button
                variant="outline"
                onClick={onAddOtherIncome}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Other Income
              </Button>
            )}
          </div>
        )}

      {/* Data Table */}
      {!isLoading && !error && otherIncomeData && otherIncomeData.items.length > 0 && (
        <EnhancedDataTable
          data={otherIncomeData.items}
          columns={columns}
          title="Other Income Records"
          searchKey="name"
          searchPlaceholder="Search by name, description, or receipt no..."
          exportable={true}
          loading={isLoading}
          showActions={false}
          customAddButton={
            canAddOtherIncome ? (
              <Button
                onClick={onAddOtherIncome}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Other Income
              </Button>
            ) : undefined
          }
        />
      )}
    </motion.div>
  );
};

