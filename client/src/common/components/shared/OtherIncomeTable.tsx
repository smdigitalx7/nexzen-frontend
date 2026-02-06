/**
 * Other Income Table Component
 * Displays other income records in a table format (DataTable V2)
 */

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { formatDate } from "@/common/utils";
import { DataTable } from "@/common/components/shared/DataTable";
import { createCurrencyColumn } from "@/common/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";

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
  fetchOtherIncome: () => Promise<{ data: OtherIncomeRecord[]; total_count: number }>;
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

  // Memoize columns to prevent re-render loops
  const columns = useMemo<ColumnDef<OtherIncomeRecord>[]>(() => [
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
        const description = row.getValue("description");
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
        const method = row.getValue("payment_method");
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
  ], []);

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

      {/* Data Table V2 (handles loading and empty states) */}
      {!error && (
        <DataTable<OtherIncomeRecord>
          data={otherIncomeData?.data ?? []}
          columns={columns}
          title="Other Income Records"
          searchKey="name"
          searchPlaceholder="Search by name, description, or receipt no..."
          loading={isLoading}
          export={{ enabled: true, filename: "other-income" }}
          onAdd={canAddOtherIncome ? onAddOtherIncome : undefined}
          addButtonText={canAddOtherIncome ? "Add Other Income" : undefined}
          emptyMessage="No other income records found"
        />
      )}
    </motion.div>
  );
};

