import { useMemo, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/common/components/ui/dialog";
import { Badge } from "@/common/components/ui/badge";
import { User } from "lucide-react";
import { useCollegeStudentTransportPaymentSummary, useCollegeStudentTransportPaymentSummaryByEnrollmentId } from "@/features/college/hooks";
import { useCollegeClasses, useCollegeGroups } from "@/features/college/hooks/use-college-dropdowns";
import type { 
  CollegeStudentTransportPaymentSummaryItem,
  CollegeStudentTransportMonthlyPayment,
  CollegeStudentTransportExpectedPayment 
} from "@/features/college/types";
import { EnhancedDataTable } from "@/common/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { createTextColumn, createCurrencyColumn, createDateColumn } from "@/common/utils/factory/columnFactories";
import { formatCurrency } from "@/common/utils";

type PaymentStatus = 'FULLY_PAID' | 'PARTIALLY_PAID' | 'PENDING';

interface TransportFeeBalanceRow {
  id: number;
  enrollment_id: number;
  admission_no: string | null;
  student_name: string;
  class_name: string;
  group_name: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  months_paid_count: number;
  months_pending_count: number;
  status: PaymentStatus;
  last_payment_date: string | null;
  summaryItem: CollegeStudentTransportPaymentSummaryItem;
}

const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'FULLY_PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PARTIALLY_PAID':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'PENDING':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: {
      const _exhaustive: never = status;
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }
};

const getStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case 'FULLY_PAID':
      return 'Paid';
    case 'PARTIALLY_PAID':
      return 'Partial';
    case 'PENDING':
      return 'Pending';
    default: {
      const _exhaustive: never = status;
      return status;
    }
  }
};

interface TransportFeeBalancesPanelProps {
  onViewStudent: (s: TransportFeeBalanceRow) => void;
  onExportCSV: () => void;
}

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: TransportFeeBalancesPanelProps) {
  // State management
  const { data: classesData } = useCollegeClasses();
  const classes = classesData?.items || [];
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceGroup, setBalanceGroup] = useState<string>("");
  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: groupsData } = useCollegeGroups(classIdNum);
  const groups = groupsData?.items || [];
  const groupIdNum = balanceGroup ? parseInt(balanceGroup) : undefined;
  
  const [paymentStatus, setPaymentStatus] = useState<"all" | PaymentStatus>("all");

  // Reset group when class changes
  useEffect(() => {
    if (balanceClass) {
      setBalanceGroup("");
    }
  }, [balanceClass]);

  // Get selected class and group names for client-side filtering
  const selectedClassName = useMemo(() => {
    if (!balanceClass) return null;
    const selectedClass = classes.find((cls: any) => cls.class_id.toString() === balanceClass);
    return selectedClass?.class_name || null;
  }, [balanceClass, classes]);

  const selectedGroupName = useMemo(() => {
    if (!balanceGroup) return null;
    const selectedGroup = groups.find((grp: any) => grp.group_id.toString() === balanceGroup);
    return selectedGroup?.group_name || null;
  }, [balanceGroup, groups]);

  // Build params object - only payment_status is supported by backend API
  const summaryParams = useMemo(() => {
    // Fetch data if at least one filter is selected (even if only class/group)
    // We need to fetch all data to filter by class/group on client side
    if (!balanceClass && !balanceGroup && paymentStatus === "all") {
      return undefined;
    }
    
    const params: any = {};
    
    // Only payment_status is supported by the backend endpoint
    if (paymentStatus !== "all") {
      params.payment_status = paymentStatus;
    }
    
    // Note: class_id and group_id are not supported by the backend endpoint
    // We'll filter on the client side instead
    
    return params;
  }, [paymentStatus, balanceClass, balanceGroup]);

  const { data: transportSummaryData, isLoading } = useCollegeStudentTransportPaymentSummary(summaryParams);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedSummary, isLoading: isLoadingDetails } = useCollegeStudentTransportPaymentSummaryByEnrollmentId(selectedEnrollmentId);

  const rows = useMemo<TransportFeeBalanceRow[]>(() => {
    if (!transportSummaryData?.items) {
      return [];
    }
    
    // Map and filter the data
    let mappedRows = transportSummaryData.items.map((item: CollegeStudentTransportPaymentSummaryItem): TransportFeeBalanceRow => {
      // Safely convert numeric values, handling string, null, undefined cases
      const totalFee = typeof item.total_fee === 'string' 
        ? parseFloat(item.total_fee) || 0 
        : (item.total_fee || 0);
      
      const paidAmount = typeof item.paid_amount === 'string' 
        ? parseFloat(item.paid_amount) || 0 
        : (item.paid_amount || 0);
      
      const outstandingAmount = typeof item.outstanding === 'string' 
        ? parseFloat(item.outstanding) || 0 
        : (item.outstanding || 0);
      
      return {
        id: item.enrollment_id,
        enrollment_id: item.enrollment_id,
        admission_no: item.admission_no,
        student_name: item.student,
        class_name: item.class,
        group_name: item.group,
        total_fee: totalFee,
        paid_amount: paidAmount,
        outstanding_amount: outstandingAmount,
        months_paid_count: item.months_paid,
        months_pending_count: item.months_pending,
        status: item.status,
        last_payment_date: item.last_payment,
        summaryItem: item,
      };
    });

    // Apply client-side filtering for class and group
    if (selectedClassName) {
      mappedRows = mappedRows.filter(row => row.class_name === selectedClassName);
    }
    
    if (selectedGroupName) {
      mappedRows = mappedRows.filter(row => row.group_name === selectedGroupName);
    }
    
    return mappedRows;
  }, [transportSummaryData, selectedClassName, selectedGroupName]);

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
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    createDateColumn<TransportFeeBalanceRow>("last_payment_date", { 
      header: "Last Payment",
      className: "text-sm text-muted-foreground"
    }),
  ], []);

  const handleViewDetails = useCallback((row: TransportFeeBalanceRow) => {
    setSelectedEnrollmentId(row.enrollment_id);
    setDetailsOpen(true);
    onViewStudent(row);
  }, [onViewStudent]);

  // Action button groups - only view, no edit/delete
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: handleViewDetails
    }
  ], [handleViewDetails]);

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
          <label htmlFor="transport-balance-class" className="text-sm font-medium mb-2 block">Class</label>
          <Select 
            value={balanceClass} 
            onValueChange={(value) => {
              setBalanceClass(value);
              setBalanceGroup(""); // Reset group when class changes
            }}
          >
            <SelectTrigger id="transport-balance-class">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls: any) => (
                <SelectItem key={cls.class_id} value={cls.class_id.toString()}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label htmlFor="transport-balance-group" className="text-sm font-medium mb-2 block">Group</label>
          <Select 
            value={balanceGroup} 
            onValueChange={setBalanceGroup}
            disabled={!balanceClass}
          >
            <SelectTrigger id="transport-balance-group">
              <SelectValue placeholder={balanceClass ? "Select group" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {groups.map((grp: any) => (
                <SelectItem key={grp.group_id} value={grp.group_id.toString()}>
                  {grp.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label htmlFor="transport-balance-status" className="text-sm font-medium mb-2 block">Payment Status</label>
          <Select 
            value={paymentStatus} 
            onValueChange={(value: string) => {
              setPaymentStatus(value === "all" ? "all" : value as PaymentStatus);
            }}
          >
            <SelectTrigger id="transport-balance-status">
              <SelectValue placeholder="Filter by payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
              <SelectItem value="FULLY_PAID">Fully Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced Data Table */}
      {!balanceClass && !balanceGroup && paymentStatus === "all" ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Please select at least one filter (Class, Group, or Payment Status) to view transport fee balances.</p>
        </div>
      ) : (
        <EnhancedDataTable
          data={rows}
          columns={columns}
          title="Transport Fee Balances"
          searchKey="student_name"
          searchPlaceholder="Search students..."
          exportable={true}
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={true}
          loading={isLoading}
        />
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle>Transport Payment Summary</DialogTitle>
            <DialogDescription className="sr-only">View detailed transport payment summary information</DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="p-8 text-center text-muted-foreground">Loading payment details...</div>
          ) : !selectedSummary ? (
            <div className="p-2 text-sm text-muted-foreground">No summary selected.</div>
          ) : (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Admission No:</span> <span className="font-medium">{selectedSummary?.admission_no || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Roll Number:</span> <span className="font-medium">{selectedSummary?.roll_number || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Student Name:</span> <span className="font-medium">{selectedSummary?.student_name}</span></div>
                  <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{selectedSummary?.class_name}</span></div>
                  <div><span className="text-muted-foreground">Group:</span> <span className="font-medium">{selectedSummary?.group_name || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Course:</span> <span className="font-medium">{selectedSummary?.course_name || 'N/A'}</span></div>
                </div>
              </div>

              {/* Transport Assignment Information */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Transport Assignment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Bus Route:</span> <span className="font-medium">{selectedSummary?.bus_route_name || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Route No:</span> <span className="font-medium">{selectedSummary?.bus_route_no || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Vehicle Number:</span> <span className="font-medium">{selectedSummary?.vehicle_number || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Pickup Point:</span> <span className="font-medium">{selectedSummary?.pickup_point || 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Start Date:</span> <span className="font-medium">{selectedSummary?.transport_start_date ? new Date(selectedSummary.transport_start_date).toLocaleDateString() : 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">End Date:</span> <span className="font-medium">{selectedSummary?.transport_end_date ? new Date(selectedSummary.transport_end_date).toLocaleDateString() : 'N/A'}</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className={`font-medium ${selectedSummary?.transport_assignment_active ? 'text-green-600' : 'text-red-600'}`}>{selectedSummary?.transport_assignment_active ? 'Active' : 'Inactive'}</span></div>
                </div>
              </div>

              {/* Payment Summary */}
              {selectedSummary && (() => {
                const totalPaid = typeof selectedSummary.total_amount_paid === 'string' 
                  ? parseFloat(selectedSummary.total_amount_paid) || 0 
                  : (selectedSummary.total_amount_paid || 0);
                const totalPending = typeof selectedSummary.total_amount_pending === 'string' 
                  ? parseFloat(selectedSummary.total_amount_pending) || 0 
                  : (selectedSummary.total_amount_pending || 0);
                
                return (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg mb-3">Payment Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Months Paid:</span> 
                        <span className="font-medium text-green-600 ml-1">{selectedSummary.months_paid_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Months Pending:</span> 
                        <span className="font-medium text-red-600 ml-1">{selectedSummary.months_pending_count}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Paid:</span> 
                        <span className="font-medium text-lg text-green-600 ml-1">{formatCurrency(totalPaid)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Pending:</span> 
                        <span className="font-medium text-lg text-red-600 ml-1">{formatCurrency(totalPending)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Monthly Payments */}
              {selectedSummary?.monthly_payments && selectedSummary.monthly_payments.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Monthly Payments</h3>
                  <div className="space-y-2">
                    {selectedSummary.monthly_payments.map((payment: CollegeStudentTransportMonthlyPayment, index: number) => {
                      const amountPaid = typeof payment.amount_paid === 'string' 
                        ? parseFloat(payment.amount_paid) || 0 
                        : (payment.amount_paid || 0);
                      
                      const paymentDate = payment.payment_month 
                        ? new Date(payment.payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'N/A';
                      
                      return (
                        <div key={payment.payment_id ?? index} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Month:</span> 
                              <span className="font-medium ml-1">{paymentDate}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Amount:</span> 
                              <span className="font-medium ml-1">{formatCurrency(amountPaid)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span> 
                              <span className="font-medium ml-1">{payment.payment_status}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Receipt:</span> 
                              <span className="font-medium ml-1">{payment.receipt_no || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expected Payments */}
              {selectedSummary?.expected_payments && selectedSummary.expected_payments.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Expected Payments</h3>
                  <div className="space-y-2">
                    {selectedSummary.expected_payments.map((expected: CollegeStudentTransportExpectedPayment, index: number) => {
                      const expectedDate = expected.expected_payment_month 
                        ? new Date(expected.expected_payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'N/A';
                      
                      return (
                        <div key={`${expected.expected_payment_month}-${index}`} className="bg-white p-3 rounded border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Month:</span> 
                              <span className="font-medium ml-1">{expectedDate}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Status:</span> 
                              <span className="font-medium text-red-600 ml-1">{expected.payment_status}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Payment Period */}
              {selectedSummary && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Payment Period</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">First Expected Payment:</span> 
                      <span className="font-medium ml-1">
                        {selectedSummary.first_expected_payment_month 
                          ? new Date(selectedSummary.first_expected_payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Expected Payment:</span> 
                      <span className="font-medium ml-1">
                        {selectedSummary.last_expected_payment_month 
                          ? new Date(selectedSummary.last_expected_payment_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
