import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2 } from "lucide-react";
import type { CollegeIncomeRead } from "@/lib/types/college";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createTextColumn, createCurrencyColumn } from "@/lib/utils/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";

interface IncomeTableProps {
  incomeData: CollegeIncomeRead[];
  onViewIncome?: (income: CollegeIncomeRead) => void;
}

export const IncomeTable = ({
  incomeData,
  onViewIncome,
}: IncomeTableProps) => {

  // Debug: Log the data to see what we're getting
  console.log("College Income Data:", incomeData);

  const uniqueReceiptNos = Array.from(new Set(incomeData.map(i => i.receipt_no).filter(Boolean)));


  // Define columns for EnhancedDataTable
  const columns: ColumnDef<CollegeIncomeRead>[] = [
    {
      id: 'created_at',
      header: 'Date',
      cell: ({ row }) => {
        const value = row.original.created_at;
        console.log("College Date cell - value:", value);
        return formatDate(value);
      },
    },
    {
      id: 'receipt_no',
      header: 'Receipt No',
      cell: ({ row }) => {
        const value = row.original.receipt_no;
        console.log("College Receipt no cell - value:", value);
        return value || "-";
      },
    },
    {
      id: 'student_name',
      header: 'Student',
      cell: ({ row }) => {
        const value = row.original.student_name;
        console.log("College Student name cell - value:", value);
        return value || "-";
      },
    },
    {
      id: 'admission_no',
      header: 'Admission No',
      cell: ({ row }) => {
        const value = row.original.admission_no;
        console.log("College Admission no cell - value:", value);
        return value || "No Enrollment";
      },
    },
    {
      id: 'roll_number',
      header: 'Roll Number',
      cell: ({ row }) => {
        const value = row.original.roll_number;
        console.log("College Roll number cell - value:", value);
        return value || "-";
      },
    },
    createCurrencyColumn<CollegeIncomeRead>("total_amount", {
      header: "Amount",
      className: "text-green-600 font-bold",
    }),
    {
      id: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const value = row.original.remarks;
        console.log("College Remarks cell - value:", value);
        return value || "-";
      },
    },
  ];

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    ...(onViewIncome ? [{
      type: 'view' as const,
      onClick: (income: CollegeIncomeRead) => {
        console.log("College View Income clicked - income:", income);
        if (!income || !income.income_id) {
          console.error("Invalid income object:", income);
          return;
        }
        onViewIncome(income);
      }
    }] : [])
  ], [onViewIncome]);

  // Prepare filter options for EnhancedDataTable
  const filterOptions = [
    {
      key: 'receipt_no',
      label: 'Receipt No',
      options: uniqueReceiptNos.map(receiptNo => ({ value: receiptNo!, label: receiptNo! })),
      value: 'all',
      onChange: (value: string) => {
        // This will be handled by EnhancedDataTable's built-in filtering
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <EnhancedDataTable
        data={incomeData}
        columns={columns}
        title="Income Records"
        searchKey="receipt_no"
        searchPlaceholder="Search by receipt no, student name, or admission no..."
        exportable={true}
        filters={filterOptions}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
      />

    </motion.div>
  );
};
