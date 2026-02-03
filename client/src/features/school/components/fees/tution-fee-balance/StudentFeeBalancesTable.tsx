import { useMemo, memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Download, User, Edit, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { formatCurrency } from "@/common/utils";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/common/components/shared";
import {
  createTextColumn,
  createCurrencyColumn,
  createDateColumn,
} from "@/common/utils/factory/columnFactories";
import { ConcessionUpdateModal } from "@/common/components/shared/ConcessionUpdateModal";
import { useUpdateSchoolTuitionConcession } from "@/features/school/hooks";
import { Wallet } from "lucide-react";
import type { SchoolClassRead } from "@/features/school/types";

interface StudentFeeBalance {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  section_name: string;
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
  classes?: SchoolClassRead[];
}

// Status color mapping - moved outside component for better performance
const STATUS_COLORS = {
  'PAID': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'PARTIAL': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'OUTSTANDING': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
} as const;

const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};

// Memoized student info cell component
const StudentInfoCell = memo(({ student }: { student: StudentFeeBalance }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-blue-100 rounded-lg">
      <User className="h-4 w-4 text-blue-600" />
    </div>
    <div>
      <div className="font-medium">{student.student_name}</div>
      <div className="text-sm text-muted-foreground font-mono">{student.student_id}</div>
    </div>
  </div>
));

StudentInfoCell.displayName = "StudentInfoCell";

// Memoized paid amount cell component
const PaidAmountCell = memo(({ amount }: { amount: number }) => (
  <span className="text-green-600 font-medium">
    {formatCurrency(amount)}
  </span>
));

PaidAmountCell.displayName = "PaidAmountCell";

// Memoized outstanding amount cell component
const OutstandingAmountCell = memo(({ amount }: { amount: number }) => (
  <span className="text-red-600 font-bold">
    {formatCurrency(amount)}
  </span>
));

OutstandingAmountCell.displayName = "OutstandingAmountCell";

// Memoized status cell component
const StatusCell = memo(({ status }: { status: string }) => (
  <Badge className={getStatusColor(status)}>
    {status}
  </Badge>
));

StatusCell.displayName = "StatusCell";

export const StudentFeeBalancesTable = ({
  studentBalances,
  onViewStudent,
  onExportCSV,
  onBulkCreate,
  title = "Tuition Fee Balances",
  description = "Track individual student fee payments and outstanding amounts",
  showHeader = true,
  loading = false,
  classes = [],
}: StudentFeeBalancesTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeBalance | null>(null);
  const [concessionModalOpen, setConcessionModalOpen] = useState(false);
  const updateConcessionMutation = useUpdateSchoolTuitionConcession(selectedStudent?.id || 0);

  const handleOpenConcession = useCallback((student: StudentFeeBalance) => {
    setSelectedStudent(student);
    setConcessionModalOpen(true);
  }, []);

  const handleUpdateConcession = async (amount: number) => {
    if (!selectedStudent) return;
    await updateConcessionMutation.mutateAsync({ concession_amount: amount });
  };

  // Memoized columns definition
  const columns: ColumnDef<StudentFeeBalance>[] = useMemo(() => [
    {
      id: 'student_info',
      header: 'Student',
      cell: ({ row }) => <StudentInfoCell student={row.original} />,
    },
    createTextColumn<StudentFeeBalance>("class_name", { header: "Class" }),
    createTextColumn<StudentFeeBalance>("section_name", { header: "Section" }),
    createCurrencyColumn<StudentFeeBalance>("total_fee", { header: "Total Fee" }),
    {
      id: 'paid_amount',
      header: 'Paid Amount',
      cell: ({ row }) => <PaidAmountCell amount={row.original.paid_amount} />,
    },
    {
      id: 'outstanding_amount',
      header: 'Outstanding',
      cell: ({ row }) => <OutstandingAmountCell amount={row.original.outstanding_amount} />,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusCell status={row.original.status} />,
    },
    createDateColumn<StudentFeeBalance>("last_payment_date", { 
      header: "Last Payment",
      className: "text-sm text-muted-foreground"
    }),
  ], []);

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: onViewStudent
    },
    {
      type: 'custom' as const,
      label: 'Concession',
      icon: Wallet,
      variant: 'outline' as "outline",
      onClick: handleOpenConcession
    }
  ], [onViewStudent, handleOpenConcession]);

  // Memoized summary statistics
  const summaryStats = useMemo(() => {
    const totalCollected = studentBalances.reduce((sum, s) => sum + s.paid_amount, 0);
    const totalOutstanding = studentBalances.reduce((sum, s) => sum + s.outstanding_amount, 0);
    const totalStudents = studentBalances.length;

    return {
      totalCollected,
      totalOutstanding,
      totalStudents
    };
  }, [studentBalances]);


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
        onExport={onExportCSV}
        onAdd={onBulkCreate}
        addButtonText="Bulk Create"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        loading={loading}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summaryStats.totalCollected)}
          </div>
          <div className="text-sm text-muted-foreground">Total Collected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(summaryStats.totalOutstanding)}
          </div>
          <div className="text-sm text-muted-foreground">Total Outstanding</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {summaryStats.totalStudents}
          </div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
      </div>

      <ConcessionUpdateModal
        isOpen={concessionModalOpen}
        onClose={() => setConcessionModalOpen(false)}
        onUpdate={handleUpdateConcession}
        currentConcession={0} // Note: The table doesn't have current concession, we might need it for a better UX
        studentName={selectedStudent?.student_name}
      />
    </motion.div>
  );
};

export default StudentFeeBalancesTable;
