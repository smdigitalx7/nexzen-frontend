import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { useCollegeClasses } from "@/lib/hooks/college/use-college-classes";
import { useCollegeGroups } from "@/lib/hooks/college/use-college-groups";
import { useCollegeStudentTransportPaymentSummary } from "@/lib/hooks/college/use-college-transport-balances";
import type { CollegeStudentTransportPaymentSummary } from "@/lib/types/college";
import { EnhancedDataTable } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { createTextColumn, createCurrencyColumn, createDateColumn } from "@/lib/utils/columnFactories";
import { formatCurrency } from "@/lib/utils";

interface TransportFeeBalanceRow {
  id: number;
  enrollment_id: number;
  admission_no: string | null;
  student_name: string;
  class_name: string;
  group_name: string | null;
  course_name: string | null;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  months_paid_count: number;
  months_pending_count: number;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
  last_payment_date: string;
  summary: CollegeStudentTransportPaymentSummary;
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

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: { onViewStudent: (s: TransportFeeBalanceRow) => void; onExportCSV: () => void; }) {
  const { data: classes = [] } = useCollegeClasses();
  const { data: groups = [] } = useCollegeGroups();
  const [balanceClass, setBalanceClass] = useState<string>(classes[0]?.class_id?.toString() || "");
  const [balanceGroup, setBalanceGroup] = useState<string>(groups[0]?.group_id?.toString() || "");

  useEffect(() => {
    if (!balanceClass && classes.length > 0) {
      setBalanceClass(classes[0].class_id.toString());
    }
  }, [classes, balanceClass]);

  useEffect(() => {
    if (!balanceGroup && groups.length > 0) {
      setBalanceGroup(groups[0].group_id.toString());
    }
  }, [groups, balanceGroup]);

  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const groupIdNum = balanceGroup ? parseInt(balanceGroup) : undefined;
  const { data: transportSummaryData, isLoading } = useCollegeStudentTransportPaymentSummary({
    class_id: classIdNum ?? undefined,
    group_id: groupIdNum ?? undefined,
  });

  const [selectedSummary, setSelectedSummary] = useState<CollegeStudentTransportPaymentSummary | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const rows = useMemo<TransportFeeBalanceRow[]>(() => {
    return (transportSummaryData?.items || []).map((summary: CollegeStudentTransportPaymentSummary) => {
      // Handle string/number conversion for Decimal values from API
      const paidTotal = typeof summary.total_amount_paid === 'string' 
        ? parseFloat(summary.total_amount_paid) || 0 
        : summary.total_amount_paid || 0;
      const outstanding = typeof summary.total_amount_pending === 'string' 
        ? parseFloat(summary.total_amount_pending) || 0 
        : summary.total_amount_pending || 0;
      return {
        id: summary.enrollment_id,
        enrollment_id: summary.enrollment_id,
        admission_no: summary.admission_no,
        student_name: summary.student_name,
        class_name: summary.class_name || "",
        group_name: summary.group_name,
        course_name: summary.course_name,
        total_fee: paidTotal + outstanding,
        paid_amount: paidTotal,
        outstanding_amount: outstanding,
        months_paid_count: summary.months_paid_count,
        months_pending_count: summary.months_pending_count,
        status: outstanding <= 0 ? 'PAID' as const : paidTotal > 0 ? 'PARTIAL' as const : 'OUTSTANDING' as const,
        last_payment_date: summary.monthly_payments?.[summary.monthly_payments.length - 1]?.payment_created_at || new Date().toISOString(),
        summary,
      };
    });
  }, [transportSummaryData]);

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<TransportFeeBalanceRow>[] = useMemo(() => [
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
            <div className="text-sm text-muted-foreground font-mono">{row.original.admission_no || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    createTextColumn<TransportFeeBalanceRow>("class_name", { header: "Class" }),
    createTextColumn<TransportFeeBalanceRow>("group_name", { header: "Group" }),
    {
      id: 'months_paid',
      header: 'Months Paid',
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">
          {row.original.months_paid_count}
        </span>
      ),
    },
    {
      id: 'months_pending',
      header: 'Months Pending',
      cell: ({ row }) => (
        <span className="text-red-600 font-medium">
          {row.original.months_pending_count}
        </span>
      ),
    },
    createCurrencyColumn<TransportFeeBalanceRow>("total_fee", { header: "Total Fee" }),
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
    createDateColumn<TransportFeeBalanceRow>("last_payment_date", { 
      header: "Last Payment",
      className: "text-sm text-muted-foreground"
    }),
  ], []);

  const handleViewDetails = (row: TransportFeeBalanceRow) => {
    setSelectedSummary(row.summary);
    setDetailsOpen(true);
    onViewStudent(row);
  };

  // Action button groups - only view, no edit/delete
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: handleViewDetails
    }
  ], [handleViewDetails]);

  // Calculate summary statistics
  const totalCollected = rows.reduce((sum, s) => sum + s.paid_amount, 0);
  const totalOutstanding = rows.reduce((sum, s) => sum + s.outstanding_amount, 0);
  const totalStudents = rows.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Class</label>
          <Select value={balanceClass} onValueChange={setBalanceClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Group</label>
          <Select value={balanceGroup} onValueChange={setBalanceGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.group_id} value={group.group_id.toString()}>
                  {group.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={rows}
        columns={columns}
        title="Transport Fee Balances"
        searchKey="student_name"
        searchPlaceholder="Search students..."
        exportable={true}
        onExport={onExportCSV}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
        loading={isLoading}
        filters={[
          {
            key: 'class_name',
            label: 'Class',
            options: Array.from(new Set(rows.map(r => r.class_name))).map(className => ({ value: className, label: className })),
            value: 'all',
            onChange: () => {}, // Handled by EnhancedDataTable's built-in filtering
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
            onChange: () => {}, // Handled by EnhancedDataTable's built-in filtering
          }
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-sm text-muted-foreground">Total Collected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-sm text-muted-foreground">Total Outstanding</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalStudents}
          </div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transport Payment Summary</DialogTitle>
          </DialogHeader>
          {!selectedSummary ? (
            <div className="p-2 text-sm text-muted-foreground">No summary selected.</div>
          ) : (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Admission No:</span> <span className="font-medium">{selectedSummary.admission_no || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Roll Number:</span> <span className="font-medium">{selectedSummary.roll_number || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Student Name:</span> <span className="font-medium">{selectedSummary.student_name}</span></div>
                  <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{selectedSummary.class_name}</span></div>
                  <div><span className="text-muted-foreground">Group:</span> <span className="font-medium">{selectedSummary.group_name || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{selectedSummary.course_name || 'N/A'}</span></div>
                </div>
              </div>

              {/* Transport Assignment Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Transport Assignment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Bus Route:</span> <span className="font-medium">{selectedSummary.bus_route_name || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Route No:</span> <span className="font-medium">{selectedSummary.bus_route_no || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Vehicle Number:</span> <span className="font-medium">{selectedSummary.vehicle_number || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Pickup Point:</span> <span className="font-medium">{selectedSummary.pickup_point || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Start Date:</span> <span className="font-medium">{selectedSummary.transport_start_date ? new Date(selectedSummary.transport_start_date).toLocaleDateString() : 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">End Date:</span> <span className="font-medium">{selectedSummary.transport_end_date ? new Date(selectedSummary.transport_end_date).toLocaleDateString() : 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className={`font-medium ${selectedSummary.transport_assignment_active ? 'text-green-600' : 'text-red-600'}`}>{selectedSummary.transport_assignment_active ? 'Active' : 'Inactive'}</span></div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Months Paid:</span> <span className="font-medium text-green-600">{selectedSummary.months_paid_count}</span></div>
                  <div><span className="text-muted-foreground">Months Pending:</span> <span className="font-medium text-red-600">{selectedSummary.months_pending_count}</span></div>
                  <div><span className="text-muted-foreground">Total Paid:</span> <span className="font-medium text-lg text-green-600">{formatCurrency(typeof selectedSummary.total_amount_paid === 'string' ? parseFloat(selectedSummary.total_amount_paid) || 0 : selectedSummary.total_amount_paid || 0)}</span></div>
                  <div><span className="text-muted-foreground">Total Pending:</span> <span className="font-medium text-lg text-red-600">{formatCurrency(typeof selectedSummary.total_amount_pending === 'string' ? parseFloat(selectedSummary.total_amount_pending) || 0 : selectedSummary.total_amount_pending || 0)}</span></div>
                </div>
              </div>

              {/* Monthly Payments */}
              {selectedSummary.monthly_payments && selectedSummary.monthly_payments.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Monthly Payments</h3>
                  <div className="space-y-2">
                    {selectedSummary.monthly_payments.map((payment, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div><span className="text-muted-foreground">Month:</span> <span className="font-medium">{payment.payment_month ? new Date(payment.payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
                          <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">{formatCurrency(typeof payment.amount_paid === 'string' ? parseFloat(payment.amount_paid) || 0 : payment.amount_paid || 0)}</span></div>
                          <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{payment.payment_status}</span></div>
                          <div><span className="text-muted-foreground">Receipt:</span> <span className="font-medium">{payment.receipt_no || 'N/A'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expected Payments */}
              {selectedSummary.expected_payments && selectedSummary.expected_payments.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Expected Payments</h3>
                  <div className="space-y-2">
                    {selectedSummary.expected_payments.map((expected, index) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-muted-foreground">Month:</span> <span className="font-medium">{expected.expected_payment_month ? new Date(expected.expected_payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
                          <div><span className="text-muted-foreground">Status:</span> <span className="font-medium text-red-600">{expected.payment_status}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Period */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Payment Period</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">First Expected Payment:</span> <span className="font-medium">{selectedSummary.first_expected_payment_month ? new Date(selectedSummary.first_expected_payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Last Expected Payment:</span> <span className="font-medium">{selectedSummary.last_expected_payment_month ? new Date(selectedSummary.last_expected_payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
