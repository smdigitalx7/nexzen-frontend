import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { User, Wallet, Eye, Search } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Badge } from "@/common/components/ui/badge";
import { formatCurrency } from "@/common/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ConcessionUpdateModal } from "@/common/components/shared/ConcessionUpdateModal";
import { useUpdateCollegeTuitionConcession } from "@/features/college/hooks/use-college-tuition-balances";
import { ActionConfig, FilterConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';

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
  concession_amount: number;
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
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  // Pagination props (if needed for college tables using server-side pagination)
  pagination?: "client" | "server" | "none";
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
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
  searchValue,
  onSearchChange,
  pagination = "client",
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: StudentFeeBalancesTableProps) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeBalance | null>(null);
  const [concessionModalOpen, setConcessionModalOpen] = useState(false);
  const updateConcessionMutation = useUpdateCollegeTuitionConcession(selectedStudent?.id || 0);

  const handleOpenConcession = useCallback((student: StudentFeeBalance) => {
    setSelectedStudent(student);
    setConcessionModalOpen(true);
  }, []);

  const handleUpdateConcession = async (amount: number) => {
    if (!selectedStudent) return;
    await updateConcessionMutation.mutateAsync({ concession_amount: amount });
  };

  const uniqueClasses = Array.from(new Set(studentBalances.map(s => s.class_name)));

  const columns: ColumnDef<StudentFeeBalance>[] = useMemo(() => [
    {
      id: 'student_info',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold">{row.original.student_name}</div>
            <div className="text-sm text-slate-500 font-mono">{row.original.student_id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "class_name",
      header: "Class",
      cell: ({ row }) => <Badge variant="outline" className="bg-slate-50">{row.getValue("class_name")}</Badge>
    },
    {
      accessorKey: "total_fee",
      header: "Total Fee",
      cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.total_fee || 0)}</span>
    },
    {
      accessorKey: 'paid_amount',
      header: 'Paid Amount',
      cell: ({ row }) => (
        <span className="text-green-600 font-semibold font-mono">
          {formatCurrency(row.original.paid_amount || 0)}
        </span>
      ),
    },
    {
      accessorKey: 'outstanding_amount',
      header: 'Outstanding',
      cell: ({ row }) => (
        <span className="text-red-600 font-bold font-mono">
          {formatCurrency(row.original.outstanding_amount || 0)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "last_payment_date",
      header: "Last Payment",
      cell: ({ row }) => {
        const date = row.original.last_payment_date;
        if (!date) return '-';
        return <span className="text-sm text-slate-500">{date}</span>;
      }
    },
  ], []);

  const actions: ActionConfig<StudentFeeBalance>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      onClick: (row) => onViewStudent(row)
    },
    {
      id: 'concession',
      label: 'Concession',
      icon: Wallet,
      onClick: (row) => handleOpenConcession(row)
    }
  ], [onViewStudent, handleOpenConcession]);

  const filters: FilterConfig[] = [
    {
      key: 'class_name',
      label: 'Class',
      type: 'select',
      options: uniqueClasses.map(className => ({ value: className, label: className })),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'PAID', label: 'Paid' },
        { value: 'PARTIAL', label: 'Partial' },
        { value: 'OUTSTANDING', label: 'Outstanding' }
      ],
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <DataTable
        data={studentBalances}
        columns={columns}
        actions={actions}
        filters={filters}
        title={title}
        searchKey="student_name"
        searchPlaceholder="Search students..."
        loading={loading}
        onAdd={onBulkCreate}
        addButtonText="Bulk Create"
        export={{ enabled: true, filename: 'fee_balances' }}
        pagination={pagination}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        showSearch={!onSearchChange}
        toolbarLeftContent={
          onSearchChange && (
            <div className="w-full sm:flex-1 min-w-[200px] max-w-sm">
              <Input
                placeholder="Search by student name or admission no..."
                value={searchValue || ""}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-9 w-full"
                leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          )
        }
      />

      <ConcessionUpdateModal
        isOpen={concessionModalOpen}
        onClose={() => setConcessionModalOpen(false)}
        onUpdate={handleUpdateConcession}
        currentConcession={selectedStudent?.concession_amount ?? 0}
        studentName={selectedStudent?.student_name}
      />
    </motion.div>
  );
};

export default StudentFeeBalancesTable;