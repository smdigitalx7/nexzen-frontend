import { useMemo, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/common/components/ui/sheet";
import { Separator } from "@/common/components/ui/separator";
import { Badge } from "@/common/components/ui/badge";
import { User, Wallet, Calendar, Search } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { useCollegeStudentTransportPaymentSummary, useCollegeStudentTransportPaymentSummaryByEnrollmentId } from "@/features/college/hooks";
import { useCollegeClasses, useCollegeGroups } from "@/features/college/hooks/use-college-dropdowns";
import type {
  CollegeStudentTransportPaymentSummaryItem,
  CollegeStudentTransportMonthlyPayment,
  CollegeStudentTransportExpectedPayment
} from "@/features/college/types";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/common/utils";
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "-";
  if (dateString.includes("T")) {
    const parts = dateString.split("T");
    const time = parts[1].split(".")[0]; // Remove milliseconds
    return `${parts[0]} ${time}`;
  }
  return dateString;
};

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
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
    default:
      return status;
  }
};

interface TransportFeeBalancesPanelProps {
  onViewStudent: (s: TransportFeeBalanceRow) => void;
  onExportCSV: () => void;
}

export function TransportFeeBalancesPanel({ onViewStudent, onExportCSV }: TransportFeeBalancesPanelProps) {
  // State management
  const { data: classesData } = useCollegeClasses({ enabled: true });
  const classes = classesData?.items || [];
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceGroup, setBalanceGroup] = useState<string>("");
  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: groupsData } = useCollegeGroups(classIdNum || 0, { enabled: !!classIdNum });
  const groups = groupsData?.items || [];

  const [paymentStatus, setPaymentStatus] = useState<"all" | PaymentStatus>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (balanceClass) {
      setBalanceGroup("");
    }
  }, [balanceClass]);

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

  const summaryParams = useMemo(() => {
    if (!balanceClass && !balanceGroup && paymentStatus === "all") {
      return undefined;
    }

    const params: any = {};
    if (paymentStatus !== "all") {
      params.payment_status = paymentStatus;
    }
    if (searchQuery) {
      params.search = searchQuery;
    }
    return params;
  }, [paymentStatus, balanceClass, balanceGroup, searchQuery]);

  const { data: transportSummaryData, isLoading } = useCollegeStudentTransportPaymentSummary(summaryParams);

  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { data: selectedSummary, isLoading: isLoadingDetails } = useCollegeStudentTransportPaymentSummaryByEnrollmentId(selectedEnrollmentId);

  const rows = useMemo<TransportFeeBalanceRow[]>(() => {
    if (!transportSummaryData?.items) {
      return [];
    }

    let mappedRows = transportSummaryData.items.map((item: CollegeStudentTransportPaymentSummaryItem): TransportFeeBalanceRow => {
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

    if (selectedClassName) {
      mappedRows = mappedRows.filter(row => row.class_name === selectedClassName);
    }

    if (selectedGroupName) {
      mappedRows = mappedRows.filter(row => row.group_name === selectedGroupName);
    }

    return mappedRows;
  }, [transportSummaryData, selectedClassName, selectedGroupName]);

  const handleViewDetails = useCallback((row: TransportFeeBalanceRow) => {
    setSelectedEnrollmentId(row.enrollment_id);
    setDetailsOpen(true);
    onViewStudent(row);
  }, [onViewStudent]);

  const columns: ColumnDef<TransportFeeBalanceRow>[] = useMemo(() => [
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
            <div className="text-sm text-slate-500 font-mono">{row.original.admission_no || 'N/A'}</div>
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
      accessorKey: "group_name",
      header: "Group",
    },
    {
      accessorKey: 'months_paid_count',
      header: 'Paid Months',
      cell: ({ row }) => (
        <span className="text-green-600 font-semibold">{row.original.months_paid_count}</span>
      ),
    },
    {
      accessorKey: 'months_pending_count',
      header: 'Pending Months',
      cell: ({ row }) => (
        <span className="text-red-600 font-semibold">{row.original.months_pending_count}</span>
      ),
    },
    {
      accessorKey: "total_fee",
      header: "Total Fee",
      cell: ({ row }) => <span className="font-mono">{formatCurrency(row.original.total_fee)}</span>
    },
    {
      accessorKey: 'paid_amount',
      header: 'Paid Amount',
      cell: ({ row }) => (
        <span className="text-green-600 font-semibold font-mono">
          {formatCurrency(row.original.paid_amount)}
        </span>
      ),
    },
    {
      accessorKey: 'outstanding_amount',
      header: 'Outstanding',
      cell: ({ row }) => (
        <span className="text-red-600 font-bold font-mono">
          {formatCurrency(row.original.outstanding_amount)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      accessorKey: "last_payment_date",
      header: "Last Payment",
      cell: ({ row }) => {
        const date = row.original.last_payment_date;
        return <span className="text-sm text-slate-500">{formatDate(date)}</span>;
      }
    },
  ], []);

  const actions: ActionConfig<TransportFeeBalanceRow>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View Details',
      icon: User,
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
      <div className="flex gap-4 items-end bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex-1">
          <label htmlFor="transport-balance-class" className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Class</label>
          <Select
            value={balanceClass}
            onValueChange={(value) => {
              setBalanceClass(value);
              setBalanceGroup("");
            }}
          >
            <SelectTrigger id="transport-balance-class" className="h-10">
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
          <label htmlFor="transport-balance-group" className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Group</label>
          <Select
            value={balanceGroup}
            onValueChange={setBalanceGroup}
            disabled={!balanceClass}
          >
            <SelectTrigger id="transport-balance-group" className="h-10">
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
          <label htmlFor="transport-balance-status" className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Payment Status</label>
          <Select
            value={paymentStatus}
            onValueChange={(value: string) => {
              setPaymentStatus(value === "all" ? "all" : value as PaymentStatus);
            }}
          >
            <SelectTrigger id="transport-balance-status" className="h-10">
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

      <DataTable
        data={rows}
        columns={columns}
        actions={actions}
        title="Transport Fee Balances"
        searchPlaceholder="Search students..."
        loading={isLoading}
        export={{ enabled: true, filename: 'transport_fee_balances' }}
        showSearch={false}
        toolbarLeftContent={
          <div className="w-full sm:flex-1 min-w-[200px] max-w-sm">
            <Input
              placeholder="Search by student name or admission no..."
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              className="h-9 w-full"
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        }
      />

      {/* Details: right-side sheet (same as school) */}
      <Sheet open={detailsOpen} onOpenChange={(open) => { if (!open) setDetailsOpen(false); }}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
            <SheetTitle>Transport Fee Balance</SheetTitle>
            <SheetDescription className="sr-only">Detailed transport fee balance for the selected student</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {selectedEnrollmentId == null ? (
              <p className="text-sm text-muted-foreground py-8">No student selected.</p>
            ) : isLoadingDetails ? (
              <p className="text-sm text-muted-foreground py-8">Loading...</p>
            ) : !selectedSummary ? (
              <p className="text-sm text-muted-foreground py-8">No summary selected.</p>
            ) : (
              <div className="space-y-6 pt-4">
                {/* Student info */}
                <section>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <User className="h-4 w-4" />
                    Student
                  </div>
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Admission No</span>
                      <span className="font-medium tabular-nums">{selectedSummary.admission_no || "–"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Roll No</span>
                      <span className="font-medium">{selectedSummary.roll_number || "–"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{selectedSummary.student_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Class</span>
                      <span className="font-medium">{selectedSummary.class_name || "–"}</span>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Transport assignment */}
                <section>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <Wallet className="h-4 w-4" />
                    Transport Assignment
                  </div>
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bus Route</span>
                      <span className="font-medium">{selectedSummary.bus_route_name || "–"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Route No</span>
                      <span className="font-medium">{selectedSummary.bus_route_no || "–"}</span>
                    </div>
                  </div>
                </section>

                <Separator />

                {/* Payment summary */}
                <section>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <Wallet className="h-4 w-4" />
                    Payment Summary
                  </div>
                  <div className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Months Paid</span>
                      <span className="font-medium text-green-600">{selectedSummary.months_paid_count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Months Pending</span>
                      <span className="font-medium text-red-600">{selectedSummary.months_pending_count}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Paid</span>
                      <span className="text-green-600">
                        {formatCurrency(
                          typeof selectedSummary.total_amount_paid === "string"
                            ? parseFloat(selectedSummary.total_amount_paid) || 0
                            : selectedSummary.total_amount_paid || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-destructive">
                      <span>Total Pending</span>
                      <span>
                        {formatCurrency(
                          typeof selectedSummary.total_amount_pending === "string"
                            ? parseFloat(selectedSummary.total_amount_pending) || 0
                            : selectedSummary.total_amount_pending || 0
                        )}
                      </span>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    Record
                  </div>
                  <div className="rounded-lg border bg-card p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last updated</span>
                      <span className="font-medium">–</span>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
