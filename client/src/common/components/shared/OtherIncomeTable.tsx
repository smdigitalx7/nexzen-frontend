/**
 * Other Income Table Component
 * Displays other income records in a table format (DataTable V2)
 */

import React, { useMemo, useState, useCallback } from "react";
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
import { Eye, Receipt, Info, CreditCard, Clock } from "lucide-react";
import ViewDialog from "@/common/components/shared/ViewDialog";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";

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

  // View state
  const [selectedRecord, setSelectedRecord] = useState<OtherIncomeRecord | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleView = useCallback((record: OtherIncomeRecord) => {
    setSelectedRecord(record);
    setIsViewOpen(true);
  }, []);

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
        const description = row.getValue("description") as string;
        return description ? (
          <Badge variant="secondary" className="max-w-[200px] truncate">
            {description as React.ReactNode}
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
            {method as React.ReactNode}
          </Badge>
        );
      },
    },
    createCurrencyColumn<OtherIncomeRecord>("amount", {
      header: "Amount",
      className: "text-green-600 font-bold",
    }),
  ], []);

  // Action configurations
  const actions = useMemo<ActionConfig<OtherIncomeRecord>[]>(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: handleView,
    },
  ], [handleView]);

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
          actions={actions}
          actionsHeader="Actions"
          emptyMessage="No other income records found"
        />
      )}

      {/* View Details Dialog */}
      <ViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        title="Other Income Details"
        subtitle={selectedRecord?.name}
        icon={<Receipt className="h-5 w-5" />}
        iconColor="blue"
        sections={[
          {
            title: "General Information",
            icon: <Info className="h-4 w-4" />,
            fields: [
              { label: "Date", value: selectedRecord?.income_date, type: "date" },
              { label: "Receipt No", value: selectedRecord?.receipt_no },
              { label: "Name", value: selectedRecord?.name },
              { label: "Description", value: selectedRecord?.description },
            ],
          },
          {
            title: "Payment Details",
            icon: <CreditCard className="h-4 w-4" />,
            fields: [
              { label: "Amount", value: selectedRecord?.amount, type: "currency" },
              {
                label: "Payment Method",
                value: selectedRecord?.payment_method,
                type: "badge",
                badgeVariant: selectedRecord?.payment_method === "CASH" ? "success" : "info"
              },
            ],
          },
          {
            title: "Metadata",
            icon: <Clock className="h-4 w-4" />,
            fields: [
              { label: "Created By", value: selectedRecord?.created_by_name },
              { label: "Created At", value: selectedRecord?.created_at, type: "date" },
              { label: "Last Updated At", value: selectedRecord?.updated_at, type: "date" },
            ],
          },
        ]}
      />
    </motion.div>
  );
};

