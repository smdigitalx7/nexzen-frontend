import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { SchoolIncomeService } from "@/lib/services/school/income.service";
import type { SchoolIncomeRead } from "@/lib/types/school";
import { ViewIncomeDialog } from "./ViewIncomeDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createCurrencyColumn, createActionColumn } from "@/lib/utils/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";

interface IncomeTableProps {
  incomeData: SchoolIncomeRead[];
  onExportCSV?: () => void;
  onAddIncome?: () => void;
}

export const IncomeTable = ({
  incomeData,
  onExportCSV,
  onAddIncome,
}: IncomeTableProps) => {


  // View dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewIncomeId, setViewIncomeId] = useState<number | null>(null);
  
  
  // Fetch income receipt for viewing
  const { data: viewReceipt, isLoading: isViewLoading, error: viewError } = useQuery({
    queryKey: ['school-income-receipt-view', viewIncomeId],
    queryFn: () => SchoolIncomeService.getIncomeReceipt(viewIncomeId!),
    enabled: !!viewIncomeId,
  });


  const uniqueReceiptNos = Array.from(new Set(incomeData.map(i => i.receipt_no).filter(Boolean)));

  const handleView = (income: SchoolIncomeRead) => {
    if (!income || !income.income_id) {
      console.error("Invalid income object:", income);
      return;
    }
    setViewIncomeId(income.income_id);
    setShowViewDialog(true);
  };


  // Define columns for EnhancedDataTable
  const columns: ColumnDef<SchoolIncomeRead>[] = [
    {
      id: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      id: 'receipt_no',
      header: 'Receipt No',
      cell: ({ row }) => row.getValue("receipt_no") || "-",
    },
    {
      id: 'student_name',
      header: 'Student',
      cell: ({ row }) => row.getValue("student_name") || "-",
    },
    {
      id: 'admission_no',
      header: 'Admission No',
      cell: ({ row }) => row.getValue("admission_no") || "-",
    },
    {
      id: 'roll_number',
      header: 'Roll Number',
      cell: ({ row }) => row.getValue("roll_number") || "-",
    },
    createCurrencyColumn<SchoolIncomeRead>("total_amount", { 
      header: "Amount",
      className: "text-green-600 font-bold",
    }),
    {
      id: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => row.getValue("remarks") || "-",
    },
    createActionColumn<SchoolIncomeRead>([
      {
        icon: Receipt,
        label: "View Receipt",
        onClick: (income) => {
          if (income) {
            handleView(income);
          } else {
            console.error("income is undefined");
          }
        },
      },
    ]),
  ];

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
        description="Track all income transactions and payments"
        searchKey="receipt_no"
        searchPlaceholder="Search by receipt no, student name, or admission no..."
        exportable={!!onExportCSV}
        onExport={onExportCSV}
        onAdd={onAddIncome}
        addButtonText="Add Income"
        filters={filterOptions}
      />

      {/* View Income Dialog */}
      <ViewIncomeDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        receipt={viewReceipt || null}
        isLoading={isViewLoading}
        error={viewError}
      />
    </motion.div>
  );
};
