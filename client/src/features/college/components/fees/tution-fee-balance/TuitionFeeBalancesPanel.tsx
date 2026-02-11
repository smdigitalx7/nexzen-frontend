import { useEffect, useMemo, useState, memo, useCallback } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { User, BookOpen, Wallet, Calendar, FileText, Search, Pencil, Check, X } from "lucide-react";
import { useCollegeTuitionBalancesList, useCollegeTuitionBalanceByAdmission, useUpdateCollegeTuitionBalance } from "@/features/college/hooks";
import { useCollegeClasses, useCollegeGroups } from "@/features/college/hooks/use-college-dropdowns";
import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import { useToast } from "@/common/hooks/use-toast";
import type { CollegeTuitionFeeBalanceRead, CollegeTuitionFeeBalanceFullRead } from "@/features/college/types";
import { StudentFeeBalancesTable } from "./StudentFeeBalancesTable";

type StudentRow = React.ComponentProps<typeof StudentFeeBalancesTable>["studentBalances"][number];

interface TuitionFeeBalancesPanelProps {
  onViewStudent: (s: StudentRow) => void;
  onExportCSV: () => void;
}

// Right-side sheet: Tuition Fee Balance Details (same as school modal)
const DetailsSheet = memo(({
  isOpen,
  onClose,
  selectedAdmissionNo,
  selectedBalance,
  enrollmentId,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAdmissionNo: string | null;
  selectedBalance: CollegeTuitionFeeBalanceFullRead | undefined;
  enrollmentId: number | undefined;
}) => {
  const { toast } = useToast();


  const formatCurrency = (n: number) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); } }}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-muted/30 shrink-0">
          <SheetTitle>Tuition Fee Balance</SheetTitle>
          <SheetDescription className="sr-only">Detailed tuition fee balance for the selected student</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {!selectedAdmissionNo ? (
            <p className="text-sm text-muted-foreground py-8">No student selected.</p>
          ) : !selectedBalance ? (
            <p className="text-sm text-muted-foreground py-8">Loading...</p>
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
                    <span className="font-medium tabular-nums">{selectedBalance.admission_no}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Roll No</span>
                    <span className="font-medium">{selectedBalance.roll_number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{selectedBalance.student_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Class / Group / Course</span>
                    <span className="font-medium">{selectedBalance.class_name || "–"} / {selectedBalance.group_name || "–"} / {selectedBalance.course_name || "–"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Father</span>
                    <span className="font-medium">{selectedBalance.father_name || "–"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{selectedBalance.phone_number || "–"}</span>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Fee summary */}
              <section>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  <Wallet className="h-4 w-4" />
                  Fee Summary
                </div>
                <div className="rounded-lg border bg-card p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Actual Fee</span>
                    <span className="font-medium">{formatCurrency(selectedBalance.actual_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Concession</span>
                    <span className="font-medium">{formatCurrency(selectedBalance.concession_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Fee</span>
                    <span>{formatCurrency(selectedBalance.total_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-destructive">
                    <span>Overall Balance</span>
                    <span>{formatCurrency(selectedBalance.overall_balance_fee)}</span>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Book fee */}
              <div className="flex items-center justify-between text-sm font-medium text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Book Fee
                </div>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Book Fee</span>
                  <span className="font-medium">{formatCurrency(selectedBalance.book_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium">{formatCurrency(selectedBalance.book_paid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{selectedBalance.book_paid_status}</span>
                </div>
              </div>

              <Separator />

              {/* Terms table */}
              <section>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  <FileText className="h-4 w-4" />
                  Term-wise
                </div>
                <div className="rounded-lg border bg-card overflow-hidden">
                  <Table bordered>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Term</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Paid</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Term 1</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedBalance.term1_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedBalance.term1_paid)}</TableCell>
                        <TableCell className="text-right text-destructive font-medium">{formatCurrency(selectedBalance.term1_balance)}</TableCell>
                        <TableCell>{selectedBalance.term1_status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Term 2</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedBalance.term2_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedBalance.term2_paid)}</TableCell>
                        <TableCell className="text-right text-destructive font-medium">{formatCurrency(selectedBalance.term2_balance)}</TableCell>
                        <TableCell>{selectedBalance.term2_status}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Term 3</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedBalance.term3_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(selectedBalance.term3_paid)}</TableCell>
                        <TableCell className="text-right text-destructive font-medium">{formatCurrency(selectedBalance.term3_balance)}</TableCell>
                        <TableCell>{selectedBalance.term3_status}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
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
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{new Date(selectedBalance.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span className="font-medium">{selectedBalance.updated_at ? new Date(selectedBalance.updated_at).toLocaleString() : "–"}</span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
});

DetailsSheet.displayName = "DetailsSheet";

const TuitionFeeBalancesPanelComponent = ({ onViewStudent, onExportCSV }: TuitionFeeBalancesPanelProps) => {
  // State management
  const { data: classesData } = useCollegeClasses({ enabled: true });
  const classes = classesData?.items || [];
  const [balanceClass, setBalanceClass] = useState<string>("");
  const [balanceGroup, setBalanceGroup] = useState<string>("");
  const classIdNum = balanceClass ? parseInt(balanceClass) : undefined;
  const { data: groupsData } = useCollegeGroups(classIdNum || 0, { enabled: !!classIdNum });
  const groups = groupsData?.items || [];
  // Optional: when a row is clicked, fetch full details
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput || undefined);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: selectedBalance } = useCollegeTuitionBalanceByAdmission(selectedAdmissionNo);

  // Reset group and page when class changes
  useEffect(() => {
    if (balanceClass) {
      setBalanceGroup("");
      setPage(1);
    }
  }, [balanceClass]);

  // Reset page when group or search changes
  useEffect(() => {
    setPage(1);
  }, [balanceGroup, searchQuery]);

  const groupIdNum = balanceGroup ? parseInt(balanceGroup) : undefined;
  // Fetch data when class, group, or search query changes
  const { data: tuitionResp, isLoading: tuitionLoading } = useCollegeTuitionBalancesList(
    classIdNum && groupIdNum ? { 
      class_id: classIdNum, 
      group_id: groupIdNum,
      page: page, 
      pageSize: pageSize,
      search: searchQuery,
    } : undefined
  );


  // Memoized handlers
  const handleViewStudent = useCallback((student: StudentRow) => {
    setSelectedAdmissionNo(student.student_id); // student_id contains admission_no
    setDetailsOpen(true);
    onViewStudent(student);
  }, [onViewStudent]);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedAdmissionNo(null);
  }, []);

  // Memoized data transformation
  const rows = useMemo<StudentRow[]>(() => {
    return (tuitionResp?.data || []).map((t: CollegeTuitionFeeBalanceRead) => {
      const totalFee = (t.total_fee || 0) + (t.book_fee || 0); // Include book_fee in total
      const paidTotal = (t.term1_paid || 0) + (t.term2_paid || 0) + (t.term3_paid || 0) + (t.book_paid || 0);
      const outstanding = Math.max(0, totalFee - paidTotal);
      return {
        id: t.enrollment_id, // enrollment_id required for concession/term-payment APIs
        student_id: t.admission_no,
        student_name: t.student_name,
        class_name: t.course_name || "", // Use course_name as class_name since class_name is not available
        academic_year: "",
        total_fee: totalFee,
        paid_amount: paidTotal,
        outstanding_amount: outstanding,
        admission_paid: true,
        books_paid: t.book_paid > 0,
        term_1_paid: t.term1_paid > 0,
        term_2_paid: t.term2_paid > 0,
        term_3_paid: t.term3_paid > 0,
        transport_paid: false,
        last_payment_date: new Date().toISOString(),
        status: outstanding <= 0 ? 'PAID' : paidTotal > 0 ? 'PARTIAL' : 'OUTSTANDING',
        concession_amount: t.concession_amount ?? 0,
      };
    });
  }, [tuitionResp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* Class and Group Filters */}
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="tuition-balance-class" className="text-sm font-medium mb-2 block">Class</label>
          <Select 
            value={balanceClass} 
            onValueChange={(value) => {
              setBalanceClass(value);
              setBalanceGroup(""); // Reset group when class changes
            }}
          >
            <SelectTrigger id="tuition-balance-class">
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
          <label htmlFor="tuition-balance-group" className="text-sm font-medium mb-2 block">Group</label>
          <Select 
            value={balanceGroup} 
            onValueChange={setBalanceGroup}
            disabled={!balanceClass}
          >
            <SelectTrigger id="tuition-balance-group">
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
      </div>

      {!balanceClass || !balanceGroup ? (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Please select a class and group to view tuition fee balances.</p>
        </div>
      ) : (
        <StudentFeeBalancesTable
          studentBalances={rows}
          onViewStudent={handleViewStudent}
          onExportCSV={onExportCSV}
          showHeader={false}
          loading={tuitionLoading}
          pagination="server"
          totalCount={tuitionResp?.total_count ?? 0}
          currentPage={tuitionResp?.current_page ?? page}
          pageSize={tuitionResp?.page_size ?? pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />
      )}

      {/* Details: right-side sheet (same as school) */}
      <DetailsSheet
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        selectedAdmissionNo={selectedAdmissionNo}
        selectedBalance={selectedBalance}
        enrollmentId={selectedBalance?.enrollment_id}
      />
    </motion.div>
  );
};

export const TuitionFeeBalancesPanel = TuitionFeeBalancesPanelComponent;
export default TuitionFeeBalancesPanelComponent;
