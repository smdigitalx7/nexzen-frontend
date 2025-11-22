import { useMemo } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { formatCurrency } from "@/common/utils";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/common/components/shared";
import {
  createTextColumn,
  createCurrencyColumn,
  createDateColumn,
} from "@/common/utils/factory/columnFactories";

interface StudentFeeBalance {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  academic_year: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  admission_paid: boolean;
  books_paid: boolean;
  term_1_paid: boolean;
  term_2_paid: boolean;
  term_3_paid: boolean;
  transport_paid: boolean;
  last_payment_date: string;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

interface StudentFeeBalancesTableProps {
  studentBalances: StudentFeeBalance[];
  onViewStudent: (student: StudentFeeBalance) => void;
  onExportCSV: () => void;
  onBulkCreate?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
  loading?: boolean;
  readOnly?: boolean; // If true, hides edit and delete actions
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'OUTSTANDING':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const StudentFeeBalancesTable = ({
  studentBalances,
  onViewStudent,
  onExportCSV,
  onBulkCreate,
  title = "Student Fee Balances",
  loading = false,
}: StudentFeeBalancesTableProps) => {

  // Get unique classes for filter options
  const uniqueClasses = Array.from(new Set(studentBalances.map(s => s.class_name)));

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<StudentFeeBalance>[] = useMemo(() => [
    {
      id: 'student_info',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.student_name}</div>
            <div className="text-sm text-muted-foreground font-mono">{row.original.student_id}</div>
          </div>
        </div>
      ),
    },
    createTextColumn<StudentFeeBalance>("class_name", { header: "Class" }),
    createCurrencyColumn<StudentFeeBalance>("total_fee", { header: "Total Fee" }),
    {
      id: 'paid_amount',
      header: 'Paid Amount',
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(row.original.paid_amount)}
        </span>
      ),
    },
    {
      id: 'outstanding_amount',
      header: 'Outstanding',
      cell: ({ row }) => (
        <span className="text-red-600 font-bold">
          {formatCurrency(row.original.outstanding_amount)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    createDateColumn<StudentFeeBalance>("last_payment_date", { 
      header: "Last Payment",
      className: "text-sm text-muted-foreground"
    }),
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: StudentFeeBalance) => onViewStudent(row)
    }
  ], [onViewStudent]);

  // Prepare filter options for EnhancedDataTable
  const filterOptions = [
    {
      key: 'class_name',
      label: 'Class',
      options: uniqueClasses.map(className => ({ value: className, label: className })),
      value: 'all',
      onChange: (_value: string) => {
        // This will be handled by EnhancedDataTable's built-in filtering
      }
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'PAID', label: 'Paid' },
        { value: 'PARTIAL', label: 'Partial' },
        { value: 'OUTSTANDING', label: 'Outstanding' }
      ],
      value: 'all',
      onChange: (_value: string) => {
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
      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={studentBalances}
        columns={columns}
        title={title}
        searchKey="student_name"
        searchPlaceholder="Search students..."
        exportable={true}
        onAdd={onBulkCreate}
        addButtonText="Bulk Create"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        loading={loading}
        filters={filterOptions}
      />
    </motion.div>
  );
};

export default StudentFeeBalancesTable;